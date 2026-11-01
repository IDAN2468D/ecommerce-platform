package com.company.recommendationloyaltyservice.rag.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "catalog_embeddings")
public class ProductVectorDocument {

    @Id
    private String id;

    @Indexed(unique = true)
    private String skuCode;

    private String title;
    private String textChunk;
    private String category;
    private Double price;
    private Boolean inStock;
    private Double averageRating;
    private List<Double> embedding; // 768 dimensions normalized vector
    private Instant lastIndexedAt;
}
