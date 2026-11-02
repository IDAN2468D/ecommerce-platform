package com.company.ragservice.service;

import com.company.ragservice.config.GeminiProperties;
import com.company.ragservice.dto.*;
import com.company.ragservice.entity.CatalogVectorDocument;
import com.company.ragservice.repository.CatalogVectorRepository;
import com.company.ragservice.repository.VectorSearchRepository;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class RagOrchestrationService {

    private final EmbeddingService embeddingService;
    private final VectorSearchRepository vectorSearchRepository;
    private final CatalogVectorRepository catalogVectorRepository;
    private final GeminiGenerationService geminiGenerationService;
    private final AgenticToolsService agenticToolsService;
    private final GeminiProperties geminiProperties;
    private SemanticCacheService semanticCacheService;
    private MeterRegistry meterRegistry;

    public RagOrchestrationService(
            EmbeddingService embeddingService,
            VectorSearchRepository vectorSearchRepository,
            CatalogVectorRepository catalogVectorRepository,
            GeminiGenerationService geminiGenerationService,
            AgenticToolsService agenticToolsService,
            GeminiProperties geminiProperties) {
        this.embeddingService = embeddingService;
        this.vectorSearchRepository = vectorSearchRepository;
        this.catalogVectorRepository = catalogVectorRepository;
        this.geminiGenerationService = geminiGenerationService;
        this.agenticToolsService = agenticToolsService;
        this.geminiProperties = geminiProperties;
        this.semanticCacheService = new SemanticCacheService(null, null);
    }

    @Autowired(required = false)
    public void setSemanticCacheService(SemanticCacheService semanticCacheService) {
        if (semanticCacheService != null) {
            this.semanticCacheService = semanticCacheService;
        }
    }

    @Autowired(required = false)
    public void setMeterRegistry(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    public RagQueryResponse processQuery(RagQueryRequest request) {
        long startTime = System.currentTimeMillis();
        String query = request.query();
        int topK = (request.topK() != null && request.topK() > 0) ? request.topK() : 4;
        String category = request.effectiveCategory();
        Boolean onlyInStock = request.effectiveOnlyInStock();
        String customerId = request.effectiveCustomerId();

        log.info("Processing Agentic & Hybrid RAG query: '{}' [Category: {}, MaxPrice: {}, MinRating: {}, OnlyInStock: {}, TopK: {}]",
                query, category, request.maxPrice(), request.minRating(), onlyInStock, topK);

        // 1. Generate Query Embedding
        List<Float> queryVector = embeddingService.generateEmbedding(query);

        // 2. Check Redis Semantic Cache (Cosine Similarity >= threshold) before hitting Vector DB & Gemini LLM
        if (semanticCacheService != null) {
            Optional<RagQueryResponse> cachedOpt = semanticCacheService.findSemanticallySimilar(
                    query,
                    queryVector,
                    category,
                    request.maxPrice(),
                    request.minRating(),
                    onlyInStock
            );
            if (cachedOpt.isPresent()) {
                recordLatencyMetric("rag_query", "HIT", System.currentTimeMillis() - startTime);
                return cachedOpt.get();
            }
        }

        // 3. Hybrid Vector Search Retrieval (Pre-filtering + Reranking with averageRating)
        List<VectorSearchRepository.ScoredDocument> matches = vectorSearchRepository.searchSimilar(
                queryVector,
                category,
                request.maxPrice(),
                request.minRating(),
                onlyInStock,
                topK
        );

        // 4. Assemble Citations and Context Chunks
        List<CitationDto> citations = new ArrayList<>();
        StringBuilder contextBuilder = new StringBuilder();

        for (VectorSearchRepository.ScoredDocument scored : matches) {
            CatalogVectorDocument doc = scored.document();
            CitationDto citation = CitationDto.builder()
                    .skuCode(doc.getSkuCode())
                    .title(doc.getTitle())
                    .price(doc.getPrice())
                    .relevanceScore(Math.round(scored.score() * 100.0) / 100.0)
                    .category(doc.getCategory())
                    .inStock(doc.getInStock())
                    .snippet(doc.getTextChunk())
                    .build();
            citations.add(citation);

            contextBuilder.append(String.format("- מוצר: %s (מק״ט: %s), קטגוריה: %s, מחיר: ₪%.2f, דירוג: %.1f, זמינות: %s (%d יח׳), תיאור: %s\n",
                    doc.getTitle(), doc.getSkuCode(), doc.getCategory(),
                    doc.getPrice() != null ? doc.getPrice() : 0.0,
                    doc.getAverageRating() != null ? doc.getAverageRating() : 4.8,
                    Boolean.TRUE.equals(doc.getInStock()) ? "במלאי" : "אזל",
                    doc.getAvailableQuantity() != null ? doc.getAvailableQuantity() : 0,
                    doc.getTextChunk()));
        }

        // 5. Grounded Generation + Gemini Function Calling (Tools)
        GeminiGenerationService.AgenticGenerationResult generationResult = geminiGenerationService.generateAgenticAnswer(
                query,
                contextBuilder.toString(),
                citations,
                customerId,
                request.cartTotal()
        );

        long latency = System.currentTimeMillis() - startTime;
        double confidence = citations.isEmpty() ? 0.3 : Math.min(0.98, citations.get(0).relevanceScore() + 0.08);

        RagQueryResponse response = RagQueryResponse.builder()
                .query(query)
                .answer(generationResult.answer())
                .citations(citations)
                .executedActions(generationResult.executedActions())
                .confidenceScore(confidence)
                .model(geminiProperties.getModel())
                .latencyMs(latency)
                .retrievedDocumentsCount(citations.size())
                .build();

        if (semanticCacheService != null) {
            semanticCacheService.put(query, queryVector, category, request.maxPrice(), request.minRating(), onlyInStock, response);
        }
        recordLatencyMetric("rag_query", "MISS", latency);
        return response;
    }

    /**
     * Feature 5: Smart Product Comparison AI Verdict
     */
    public ProductComparisonResponse compareProducts(ProductComparisonRequest request) {
        long startTime = System.currentTimeMillis();
        List<String> skus = request.skus() != null ? request.skus() : List.of();
        log.info("Generating AI Product Comparison Verdict for SKUs: {} | UseCase: '{}'", skus, request.userUseCase());

        List<CatalogVectorDocument> resolvedProducts = new ArrayList<>();
        for (String sku : skus) {
            if (sku == null || sku.isBlank()) continue;
            Optional<CatalogVectorDocument> docOpt = catalogVectorRepository.findBySkuCode(sku.trim())
                    .or(() -> catalogVectorRepository.findBySkuCode(agenticToolsService.resolveCanonicalSku(sku)));
            docOpt.ifPresent(resolvedProducts::add);
        }

        ProductComparisonResponse response = geminiGenerationService.generateProductComparisonVerdict(
                resolvedProducts,
                skus,
                request.userUseCase(),
                startTime
        );
        recordLatencyMetric("product_comparison", "MISS", System.currentTimeMillis() - startTime);
        return response;
    }

    /**
     * Feature 6: Multimodal Search (Vision + Vector Search)
     */
    public MultimodalSearchResponse multimodalSearch(MultimodalSearchRequest request) {
        long startTime = System.currentTimeMillis();
        int topK = (request.topK() != null && request.topK() > 0) ? request.topK() : 4;

        log.info("Processing Multimodal Search [hasImage={}, queryText='{}', topK={}]",
                request.imageBase64() != null && !request.imageBase64().isBlank(),
                request.queryText(),
                topK);

        // 1. Extract product description and technical features using Gemini Vision
        GeminiGenerationService.VisionExtractionResult visionResult = geminiGenerationService.extractProductDescriptionFromImage(
                request.imageBase64(),
                request.mimeType(),
                request.queryText()
        );

        String combinedSearchQuery = visionResult.extractedDescription();
        if (request.queryText() != null && !request.queryText().isBlank()) {
            combinedSearchQuery = request.queryText() + " " + combinedSearchQuery;
        }

        // 2. Embed extracted description into 768-dim vector
        List<Float> queryVector = embeddingService.generateEmbedding(combinedSearchQuery);

        // 3. Retrieve matching catalog products from VectorSearchRepository
        List<VectorSearchRepository.ScoredDocument> matches = vectorSearchRepository.searchSimilar(
                queryVector,
                request.category(),
                request.maxPrice(),
                null,
                request.onlyInStock() != null ? request.onlyInStock() : true,
                topK
        );

        List<CitationDto> citations = matches.stream()
                .map(scored -> {
                    CatalogVectorDocument doc = scored.document();
                    return CitationDto.builder()
                            .skuCode(doc.getSkuCode())
                            .title(doc.getTitle())
                            .price(doc.getPrice())
                            .relevanceScore(Math.round(scored.score() * 100.0) / 100.0)
                            .category(doc.getCategory())
                            .inStock(doc.getInStock())
                            .snippet(doc.getTextChunk())
                            .build();
                })
                .toList();

        String answer = geminiGenerationService.generateGroundedAnswer(
                combinedSearchQuery,
                visionResult.extractedDescription(),
                citations
        );

        long latency = System.currentTimeMillis() - startTime;
        recordLatencyMetric("multimodal_search", "MISS", latency);

        return MultimodalSearchResponse.builder()
                .extractedDescription(visionResult.extractedDescription())
                .detectedFeatures(visionResult.detectedFeatures())
                .answer(answer)
                .matches(citations)
                .model(geminiProperties.getModel())
                .latencyMs(latency)
                .build();
    }

    /**
     * Streams the generated tokens via SSE for real-time customer UX.
     */
    public void streamQuery(RagQueryRequest request, SseEmitter emitter) {
        CompletableFuture.runAsync(() -> {
            try {
                RagQueryResponse fullResponse = processQuery(request);

                emitter.send(SseEmitter.event()
                        .name("citations")
                        .data(Map.of(
                                "citations", fullResponse.citations(),
                                "executedActions", fullResponse.executedActions() != null ? fullResponse.executedActions() : List.of(),
                                "model", fullResponse.model()
                        )));

                String answer = fullResponse.answer();
                String[] words = answer.split(" ");
                for (int i = 0; i < words.length; i++) {
                    String piece = (i == 0 ? "" : " ") + words[i];
                    emitter.send(SseEmitter.event()
                            .name("token")
                            .data(Map.of("text", piece, "done", false)));
                    Thread.sleep(20);
                }

                emitter.send(SseEmitter.event()
                        .name("complete")
                        .data(Map.of(
                                "done", true,
                                "latencyMs", fullResponse.latencyMs(),
                                "executedActions", fullResponse.executedActions() != null ? fullResponse.executedActions() : List.of()
                        )));
                emitter.complete();
            } catch (Exception ex) {
                log.error("SSE stream error during RAG generation: {}", ex.getMessage());
                try {
                    emitter.send(SseEmitter.event().name("error").data(Map.of("error", ex.getMessage())));
                } catch (IOException ignored) {}
                emitter.completeWithError(ex);
            }
        });
    }

    private void recordLatencyMetric(String operation, String cacheStatus, long latencyMs) {
        if (meterRegistry != null) {
            meterRegistry.timer("ecommerce_gemini_generation_latency_seconds",
                    "operation", operation,
                    "cache_status", cacheStatus).record(latencyMs, TimeUnit.MILLISECONDS);
        }
    }
}
