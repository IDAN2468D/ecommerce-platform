package com.company.reviewratingservice.domain.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document(collection = "product_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductReviewEntity {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Indexed
    private String skuCode;

    @Indexed
    private String customerId;

    private String customerName;

    private int rating; // 1 to 5

    private String title;

    private String content;

    @Builder.Default
    private List<String> pros = new ArrayList<>();

    @Builder.Default
    private List<String> cons = new ArrayList<>();

    @Builder.Default
    private boolean verifiedPurchase = true;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
