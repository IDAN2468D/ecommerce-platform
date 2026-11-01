package com.company.ragservice.repository;

import com.company.ragservice.entity.CatalogVectorDocument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
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

    public record ScoredDocument(CatalogVectorDocument document, double score) {}

    /**
     * Executes vector search against MongoDB Atlas with metadata filtering.
     * Includes automatic fallback to exact Cosine Similarity vector ranking when running
     * in local or non-Atlas MongoDB environments.
     */
    public List<ScoredDocument> searchSimilar(
            List<Float> queryVector,
            String category,
            Double maxPrice,
            Boolean inStockOnly,
            int limit
    ) {
        if (queryVector == null || queryVector.isEmpty()) {
            return Collections.emptyList();
        }

        // 1. Try MongoDB Atlas $vectorSearch Aggregation Stage
        try {
            Document filterDoc = new Document();
            if (category != null && !category.isBlank() && !category.equalsIgnoreCase("all") && !category.equalsIgnoreCase("הכל")) {
                filterDoc.put("category", category);
            }
            if (inStockOnly != null && inStockOnly) {
                filterDoc.put("inStock", true);
            }
            if (maxPrice != null && maxPrice > 0) {
                filterDoc.put("price", new Document("$lte", maxPrice));
            }

            Document vectorSearchStage = new Document("$vectorSearch", new Document()
                    .append("index", "vector_index")
                    .append("path", "embedding")
                    .append("queryVector", queryVector)
                    .append("numCandidates", Math.max(limit * 10, 50))
                    .append("limit", limit)
                    .append("filter", filterDoc)
            );

            List<Document> pipeline = List.of(
                    vectorSearchStage,
                    new Document("$project", new Document()
                            .append("id", "$_id")
                            .append("skuCode", 1)
                            .append("title", 1)
                            .append("textChunk", 1)
                            .append("category", 1)
                            .append("price", 1)
                            .append("inStock", 1)
                            .append("averageRating", 1)
                            .append("metadata", 1)
                            .append("indexedAt", 1)
                            .append("score", new Document("$meta", "vectorSearchScore"))
                    )
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
                log.info("MongoDB Atlas $vectorSearch returned {} matches", scored.size());
                return scored;
            }
        } catch (Exception ex) {
            log.debug("Atlas $vectorSearch not available (likely local Mongo instance): {}. Proceeding to Cosine Similarity fallback.", ex.getMessage());
        }

        // 2. High-Performance Local Cosine Similarity Fallback
        return searchWithLocalCosineSimilarity(queryVector, category, maxPrice, inStockOnly, limit);
    }

    private List<ScoredDocument> searchWithLocalCosineSimilarity(
            List<Float> queryVector,
            String category,
            Double maxPrice,
            Boolean inStockOnly,
            int limit
    ) {
        Query query = new Query();
        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("all") && !category.equalsIgnoreCase("הכל")) {
            query.addCriteria(Criteria.where("category").is(category));
        }
        if (inStockOnly != null && inStockOnly) {
            query.addCriteria(Criteria.where("inStock").is(true));
        }
        if (maxPrice != null && maxPrice > 0) {
            query.addCriteria(Criteria.where("price").lte(maxPrice));
        }

        List<CatalogVectorDocument> candidates = mongoTemplate.find(query, CatalogVectorDocument.class);
        if (candidates.isEmpty()) {
            return Collections.emptyList();
        }

        return candidates.stream()
                .filter(doc -> doc.getEmbedding() != null && !doc.getEmbedding().isEmpty())
                .map(doc -> new ScoredDocument(doc, computeCosineSimilarity(queryVector, doc.getEmbedding())))
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
