package com.company.ragservice.service;

import com.company.ragservice.dto.RagQueryResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Semantic Cache Service backed by Redis (with L1 In-Memory fallback).
 * Computes Cosine Similarity between incoming query embeddings and cached query embeddings
 * within the same filter context, returning sub-10ms responses for semantically equivalent queries.
 */
@Service
@Slf4j
public class SemanticCacheService {

    private static final String REDIS_HASH_KEY_PREFIX = "rag:semantic:cache:";
    private static final Duration CACHE_TTL = Duration.ofHours(1);
    private static final int MAX_ENTRIES_PER_PARTITION = 100;

    private final StringRedisTemplate redisTemplate;
    private final MeterRegistry meterRegistry;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${rag.cache.enabled:true}")
    private boolean cacheEnabled = true;

    @Value("${rag.cache.similarity-threshold:0.92}")
    private double similarityThreshold = 0.92;

    // L1 / fallback concurrent store partitioned by filter context
    private final Map<String, Map<String, CachedSemanticEntry>> localPartitionCache = new ConcurrentHashMap<>();

    public record CachedSemanticEntry(
            String originalQuery,
            List<Float> embedding,
            RagQueryResponse response,
            long cachedAtEpochMs
    ) {}

    @Autowired
    public SemanticCacheService(
            @Autowired(required = false) StringRedisTemplate redisTemplate,
            @Autowired(required = false) MeterRegistry meterRegistry) {
        this.redisTemplate = redisTemplate;
        this.meterRegistry = meterRegistry;
    }

    /**
     * Searches Redis (and L1 fallback) for a semantically equivalent query embedding
     * with Cosine Similarity >= similarityThreshold.
     */
    public Optional<RagQueryResponse> findSemanticallySimilar(
            String query,
            List<Float> queryVector,
            String category,
            Double maxPrice,
            Double minRating,
            Boolean onlyInStock) {

        if (!cacheEnabled || query == null || queryVector == null || queryVector.isEmpty()) {
            return Optional.empty();
        }

        // Skip cache for transactional write commands (like adding to cart or checking live order status)
        if (isTransactionalWriteOrLiveStatusIntent(query)) {
            return Optional.empty();
        }

        long lookupStart = System.currentTimeMillis();
        String partitionKey = buildFilterPartitionKey(category, maxPrice, minRating, onlyInStock);
        Collection<CachedSemanticEntry> candidates = loadPartitionEntries(partitionKey);

        CachedSemanticEntry bestMatch = null;
        double bestSimilarity = -1.0;

        for (CachedSemanticEntry candidate : candidates) {
            if (candidate == null || candidate.embedding() == null || candidate.response() == null) {
                continue;
            }
            double sim = cosineSimilarity(queryVector, candidate.embedding());
            if (sim >= similarityThreshold && sim > bestSimilarity) {
                bestSimilarity = sim;
                bestMatch = candidate;
            }
        }

        if (bestMatch != null) {
            long lookupLatency = Math.max(1L, System.currentTimeMillis() - lookupStart);
            log.info("Semantic Cache HIT for query '{}' (matched '{}' with cosine similarity={}, latency={}ms)",
                    query, bestMatch.originalQuery(), String.format("%.4f", bestSimilarity), lookupLatency);
            recordCacheMetric("HIT");

            RagQueryResponse cached = bestMatch.response();
            String cachedModelLabel = cached.model() != null && !cached.model().contains("semantic-cache")
                    ? cached.model() + " (semantic-cache)"
                    : cached.model();
            return Optional.of(RagQueryResponse.builder()
                    .query(query)
                    .answer(cached.answer())
                    .citations(cached.citations())
                    .executedActions(cached.executedActions())
                    .confidenceScore(cached.confidenceScore())
                    .model(cachedModelLabel)
                    .latencyMs(lookupLatency)
                    .retrievedDocumentsCount(cached.retrievedDocumentsCount())
                    .build());
        }

        recordCacheMetric("MISS");
        return Optional.empty();
    }

    public void put(
            String query,
            List<Float> queryVector,
            String category,
            Double maxPrice,
            Double minRating,
            Boolean onlyInStock,
            RagQueryResponse response) {

        if (!cacheEnabled || query == null || queryVector == null || queryVector.isEmpty() || response == null) {
            return;
        }
        if (isTransactionalWriteOrLiveStatusIntent(query)) {
            return;
        }

        String partitionKey = buildFilterPartitionKey(category, maxPrice, minRating, onlyInStock);
        String entryHash = sha256Short(query.trim().toLowerCase(Locale.ROOT));
        CachedSemanticEntry entry = new CachedSemanticEntry(
                query,
                queryVector,
                response,
                System.currentTimeMillis()
        );

        // Save in L1
        Map<String, CachedSemanticEntry> partitionMap = localPartitionCache.computeIfAbsent(
                partitionKey, k -> new ConcurrentHashMap<>());
        if (partitionMap.size() >= MAX_ENTRIES_PER_PARTITION) {
            String firstKey = partitionMap.keySet().iterator().next();
            partitionMap.remove(firstKey);
        }
        partitionMap.put(entryHash, entry);

        // Save in Redis
        if (redisTemplate != null) {
            try {
                String redisKey = REDIS_HASH_KEY_PREFIX + partitionKey;
                String json = objectMapper.writeValueAsString(entry);
                redisTemplate.opsForHash().put(redisKey, entryHash, json);
                redisTemplate.expire(redisKey, CACHE_TTL);
            } catch (Exception ex) {
                log.debug("Redis SemanticCache write fallback to L1 memory: {}", ex.getMessage());
            }
        }
    }

    private Collection<CachedSemanticEntry> loadPartitionEntries(String partitionKey) {
        if (redisTemplate != null) {
            try {
                String redisKey = REDIS_HASH_KEY_PREFIX + partitionKey;
                Map<Object, Object> raw = redisTemplate.opsForHash().entries(redisKey);
                if (raw != null && !raw.isEmpty()) {
                    List<CachedSemanticEntry> list = new ArrayList<>(raw.size());
                    for (Object val : raw.values()) {
                        if (val instanceof String str) {
                            list.add(objectMapper.readValue(str, CachedSemanticEntry.class));
                        }
                    }
                    return list;
                }
            } catch (Exception ex) {
                log.debug("Redis SemanticCache read fallback to L1 memory: {}", ex.getMessage());
            }
        }
        Map<String, CachedSemanticEntry> local = localPartitionCache.get(partitionKey);
        return local != null ? local.values() : List.of();
    }

    public static double cosineSimilarity(List<Float> v1, List<Float> v2) {
        int len = Math.min(v1.size(), v2.size());
        if (len == 0) {
            return 0.0;
        }
        double dot = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;
        for (int i = 0; i < len; i++) {
            float a = v1.get(i);
            float b = v2.get(i);
            dot += a * b;
            norm1 += a * a;
            norm2 += b * b;
        }
        double denom = Math.sqrt(norm1) * Math.sqrt(norm2);
        return denom > 0.0 ? (dot / denom) : 0.0;
    }

    private boolean isTransactionalWriteOrLiveStatusIntent(String query) {
        String lower = query.toLowerCase(Locale.ROOT);
        return lower.contains("הוסף") || lower.contains("תוסיף") || lower.contains("שים לי בסל")
                || lower.contains("לעגלה") || lower.contains("לסל הקניות") || lower.contains("add to cart")
                || lower.contains("תזמין לי") || lower.contains("מצב הזמנה") || lower.contains("סטטוס הזמנה")
                || lower.contains("איפה ההזמנה") || lower.contains("מעקב משלוח") || lower.contains("בדוק הזמנה")
                || lower.contains("order status");
    }

    private String buildFilterPartitionKey(String category, Double maxPrice, Double minRating, Boolean onlyInStock) {
        return String.format("%s|%s|%s|%s",
                category != null ? category : "ALL",
                maxPrice != null ? maxPrice : "ANY",
                minRating != null ? minRating : "ANY",
                onlyInStock != null ? onlyInStock : "ANY");
    }

    private String sha256Short(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(16);
            for (int i = 0; i < 8 && i < digest.length; i++) {
                sb.append(String.format("%02x", digest[i]));
            }
            return sb.toString();
        } catch (Exception e) {
            return String.valueOf(input.hashCode());
        }
    }

    private void recordCacheMetric(String result) {
        if (meterRegistry != null) {
            meterRegistry.counter("ecommerce_rag_semantic_cache_requests_total", "result", result).increment();
        }
    }
}

