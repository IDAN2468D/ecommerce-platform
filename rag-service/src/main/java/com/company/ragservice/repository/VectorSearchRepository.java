package com.company.ragservice.repository;

import com.company.ragservice.entity.CatalogVectorDocument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
@Slf4j
public class VectorSearchRepository {

    private final MongoTemplate mongoTemplate;
    private static final String COLLECTION_NAME = "catalog_embeddings";

    // Weights for Hybrid Reranking: 75% semantic vector similarity + 25% verified customer rating
    private static final double VECTOR_WEIGHT = 0.75;
    private static final double RATING_WEIGHT = 0.25;

    public record ScoredDocument(CatalogVectorDocument document, double score) {}

    /**
     * Backward-compatible 5-arg overload.
     */
    public List<ScoredDocument> searchSimilar(
            List<Float> queryVector,
            String category,
            Double maxPrice,
            Boolean onlyInStock,
            int limit
    ) {
        return searchSimilar(queryVector, category, maxPrice, null, onlyInStock, limit);
    }

    /**
     * Executes Hybrid Vector Search against MongoDB Atlas with Pre-Filtering (inStock, maxPrice, minRating, category)
     * and Reranking that combines Cosine Similarity with Product Rating (averageRating).
     * Automatically falls back to local Cosine Similarity + Hybrid Reranking if Atlas $vectorSearch is unavailable.
     */
    public List<ScoredDocument> searchSimilar(
            List<Float> queryVector,
            String category,
            Double maxPrice,
            Double minRating,
            Boolean onlyInStock,
            int limit
    ) {
        if (queryVector == null || queryVector.isEmpty()) {
            return Collections.emptyList();
        }

        // 1. Try MongoDB Atlas $vectorSearch Aggregation Pipeline with Pre-filtering + Hybrid Reranking
        try {
            Document filterDoc = new Document();
            if (category != null && !category.isBlank() && !category.equalsIgnoreCase("all") && !category.equalsIgnoreCase("הכל")) {
                filterDoc.put("category", category);
            }
            if (Boolean.TRUE.equals(onlyInStock)) {
                filterDoc.put("inStock", true);
            }
            if (maxPrice != null && maxPrice > 0) {
                filterDoc.put("price", new Document("$lte", maxPrice));
            }
            if (minRating != null && minRating > 0) {
                filterDoc.put("averageRating", new Document("$gte", minRating));
            }

            Document vectorSearchStage = new Document("$vectorSearch", new Document()
                    .append("index", "vector_index")
                    .append("path", "embedding")
                    .append("queryVector", queryVector)
                    .append("numCandidates", Math.max(limit * 15, 60))
                    .append("limit", Math.max(limit * 3, 12))
                    .append("filter", filterDoc)
            );

            Document projectStage = new Document("$project", new Document()
                    .append("id", "$_id")
                    .append("skuCode", 1)
                    .append("title", 1)
                    .append("textChunk", 1)
                    .append("category", 1)
                    .append("price", 1)
                    .append("inStock", 1)
                    .append("availableQuantity", 1)
                    .append("averageRating", 1)
                    .append("metadata", 1)
                    .append("indexedAt", 1)
                    .append("vectorScore", new Document("$meta", "vectorSearchScore"))
            );

            // Reranking Stage: weighted combination of vectorSearchScore (75%) and normalized averageRating (25%)
            Document rerankAddFieldsStage = new Document("$addFields", new Document("score",
                    new Document("$add", List.of(
                            new Document("$multiply", List.of("$vectorScore", VECTOR_WEIGHT)),
                            new Document("$multiply", List.of(
                                    new Document("$divide", List.of(
                                            new Document("$ifNull", List.of("$averageRating", 4.5)),
                                            5.0
                                    )),
                                    RATING_WEIGHT
                            ))
                    ))
            ));

            Document sortByHybridScoreStage = new Document("$sort", new Document("score", -1));
            Document limitStage = new Document("$limit", limit);

            List<Document> pipeline = List.of(
                    vectorSearchStage,
                    projectStage,
                    rerankAddFieldsStage,
                    sortByHybridScoreStage,
                    limitStage
            );

            List<Document> rawResults = mongoTemplate.getDb()
                    .getCollection(COLLECTION_NAME)
                    .aggregate(pipeline)
                    .into(new ArrayList<>());

            if (!rawResults.isEmpty()) {
                List<ScoredDocument> scored = new ArrayList<>();
                for (Document doc : rawResults) {
                    CatalogVectorDocument entity = mongoTemplate.getConverter().read(CatalogVectorDocument.class, doc);
                    Double scoreVal = doc.getDouble("score");
                    scored.add(new ScoredDocument(entity, scoreVal != null ? scoreVal : 0.85));
                }
                log.info("MongoDB Atlas $vectorSearch + Hybrid Reranking returned {} matches", scored.size());
                return scored;
            }
        } catch (Exception ex) {
            log.debug("Atlas $vectorSearch fallback to local Hybrid Reranking: {}", ex.getMessage());
        }

        // 2. High-Performance Local Cosine Similarity + Pre-filtering + Hybrid Reranking
        return searchWithLocalHybridReranking(queryVector, category, maxPrice, minRating, onlyInStock, limit);
    }

    private List<ScoredDocument> searchWithLocalHybridReranking(
            List<Float> queryVector,
            String category,
            Double maxPrice,
            Double minRating,
            Boolean onlyInStock,
            int limit
    ) {
        Query query = new Query();
        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("all") && !category.equalsIgnoreCase("הכל")) {
            query.addCriteria(Criteria.where("category").regex(category.trim(), "i"));
        }
        if (Boolean.TRUE.equals(onlyInStock)) {
            query.addCriteria(Criteria.where("inStock").is(true));
        }
        if (maxPrice != null && maxPrice > 0) {
            query.addCriteria(Criteria.where("price").lte(maxPrice));
        }
        if (minRating != null && minRating > 0) {
            query.addCriteria(Criteria.where("averageRating").gte(minRating));
        }

        List<CatalogVectorDocument> candidates = mongoTemplate.find(query, CatalogVectorDocument.class);
        if (candidates.isEmpty()) {
            return Collections.emptyList();
        }

        return candidates.stream()
                .filter(doc -> doc.getEmbedding() != null && !doc.getEmbedding().isEmpty())
                .filter(doc -> !Boolean.TRUE.equals(onlyInStock) || (Boolean.TRUE.equals(doc.getInStock()) && (doc.getAvailableQuantity() == null || doc.getAvailableQuantity() > 0)))
                .map(doc -> {
                    double cosineSim = computeCosineSimilarity(queryVector, doc.getEmbedding());
                    double rating = doc.getAverageRating() != null ? doc.getAverageRating() : 4.5;
                    double normalizedRating = Math.max(0.0, Math.min(1.0, rating / 5.0));
                    double hybridScore = (VECTOR_WEIGHT * cosineSim) + (RATING_WEIGHT * normalizedRating);
                    return new ScoredDocument(doc, hybridScore);
                })
                .sorted(Comparator.comparingDouble(ScoredDocument::score).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    public static double computeCosineSimilarity(List<Float> vectorA, List<Float> vectorB) {
        if (vectorA.size() != vectorB.size() || vectorA.isEmpty()) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vectorA.size(); i++) {
            float a = vectorA.get(i);
            float b = vectorB.get(i);
            dotProduct += a * b;
            normA += a * a;
            normB += b * b;
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        return Math.max(0.0, Math.min(1.0, dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))));
    }
}
