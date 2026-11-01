package com.company.ragservice.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Document(collection = "catalog_embeddings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CatalogVectorDocument {

    @Id
    private String id;

    @Indexed(unique = true)
    private String skuCode;

    private String title;
    private String textChunk;
    private List<Float> embedding; // 768-dimensional vector

    @Indexed
    private String category;

    @Indexed
    private Double price;

    @Indexed
    private Boolean inStock;

    private Double averageRating;
    private Map<String, Object> metadata;
    private Instant indexedAt;
}
