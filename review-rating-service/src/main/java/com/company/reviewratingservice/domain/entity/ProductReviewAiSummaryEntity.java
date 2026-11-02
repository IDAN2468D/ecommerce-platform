package com.company.reviewratingservice.domain.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document(collection = "product_review_ai_summaries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductReviewAiSummaryEntity {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Indexed(unique = true)
    private String skuCode;

    private String aiSummary;

    @Builder.Default
    private List<String> prosList = new ArrayList<>();

    @Builder.Default
    private List<String> consList = new ArrayList<>();

    private int verifiedReviewsCount;

    private double averageVerifiedRating;

    @Builder.Default
    private Instant updatedAt = Instant.now();
}
