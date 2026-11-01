package com.company.recommendationloyaltyservice.rag.repository;

import com.company.recommendationloyaltyservice.rag.dto.CitationDto;
import com.company.recommendationloyaltyservice.rag.model.ProductVectorDocument;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public class ProductVectorRepository {

    private static final Logger log = LoggerFactory.getLogger(ProductVectorRepository.class);
    private static final String COLLECTION_NAME = "catalog_embeddings";

    private final MongoTemplate mongoTemplate;

    public ProductVectorRepository(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public ProductVectorDocument save(ProductVectorDocument document) {
        return mongoTemplate.save(document, COLLECTION_NAME);
    }

    public Optional<ProductVectorDocument> findBySkuCode(String skuCode) {
        Query query = new Query(Criteria.where("skuCode").is(skuCode));
        return Optional.ofNullable(mongoTemplate.findOne(query, ProductVectorDocument.class, COLLECTION_NAME));
    }

    public long count() {
        return mongoTemplate.count(new Query(), COLLECTION_NAME);
    }

    public List<ProductVectorDocument> findAll() {
        return mongoTemplate.findAll(ProductVectorDocument.class, COLLECTION_NAME);
    }

    /**
     * Executes Vector Search:
     * 1. Attempts MongoDB Atlas $vectorSearch pipeline aggregation.
     * 2. Falls back seamlessly to Cosine Similarity calculation across stored embeddings.
     */
    public List<CitationDto> searchSimilar(List<Double> queryVector, String category, int topK, double minSimilarity) {
        try {
            // Attempt Atlas $vectorSearch
            Document vectorSearchStage = new Document("$vectorSearch",
                    new Document("index", "vector_index")
                            .append("path", "embedding")
                            .append("queryVector", queryVector)
                            .append("numCandidates", Math.max(100, topK * 10))
                            .append("limit", topK)
            );

            List<Document> pipeline = new ArrayList<>();
            pipeline.add(vectorSearchStage);

            if (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL") && !category.equalsIgnoreCase("הכל")) {
                pipeline.add(new Document("$match", new Document("category", category)));
            }

            pipeline.add(new Document("$project",
                    new Document("skuCode", 1)
                            .append("title", 1)
                            .append("textChunk", 1)
                            .append("category", 1)
                            .append("price", 1)
                            .append("inStock", 1)
                            .append("score", new Document("$meta", "vectorSearchScore"))
            ));

            List<Document> rawResults = mongoTemplate.getCollection(COLLECTION_NAME)
                    .aggregate(pipeline)
                    .into(new ArrayList<>());

            if (!rawResults.isEmpty()) {
                return rawResults.stream()
                        .map(doc -> CitationDto.builder()
                                .skuCode(doc.getString("skuCode"))
                                .title(doc.getString("title"))
                                .price(doc.getDouble("price"))
                                .category(doc.getString("category"))
                                .inStock(doc.getBoolean("inStock", true))
                                .relevanceScore(Math.round(doc.getDouble("score") * 100.0) / 100.0)
                                .snippet(doc.getString("textChunk"))
                                .build())
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.debug("MongoDB Atlas $vectorSearch pipeline unavailable, using local Cosine Similarity: {}", e.getMessage());
        }

        // High-performance fallback: In-memory cosine similarity over documents
        Query query = new Query();
        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL") && !category.equalsIgnoreCase("הכל")) {
            query.addCriteria(Criteria.where("category").is(category));
        }

        List<ProductVectorDocument> candidates = mongoTemplate.find(query, ProductVectorDocument.class, COLLECTION_NAME);

        return candidates.stream()
                .filter(doc -> doc.getEmbedding() != null && !doc.getEmbedding().isEmpty())
                .map(doc -> {
                    double score = computeCosineSimilarity(queryVector, doc.getEmbedding());
                    return Map.entry(doc, score);
                })
                .sorted(Map.Entry.<ProductVectorDocument, Double>comparingByValue().reversed())
                .limit(topK)
                .map(entry -> {
                    ProductVectorDocument doc = entry.getKey();
                    return CitationDto.builder()
                            .skuCode(doc.getSkuCode())
                            .title(doc.getTitle())
                            .price(doc.getPrice())
                            .category(doc.getCategory())
                            .inStock(doc.getInStock())
                            .relevanceScore(Math.round(entry.getValue() * 100.0) / 100.0)
                            .snippet(doc.getTextChunk())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private double computeCosineSimilarity(List<Double> v1, List<Double> v2) {
        if (v1 == null || v2 == null || v1.isEmpty() || v2.isEmpty()) return 0.0;
        int size = Math.min(v1.size(), v2.size());
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < size; i++) {
            double a = v1.get(i);
            double b = v2.get(i);
            dotProduct += a * b;
            normA += a * a;
            normB += b * b;
        }
        if (normA == 0.0 || normB == 0.0) return 0.0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
