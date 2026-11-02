package com.company.reviewratingservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class ReviewDtos {

    public record CreateReviewRequest(
            @NotBlank String skuCode,
            @NotNull @Min(1) @Max(5) Integer rating,
            String title,
            String content,
            String comment,
            List<String> pros,
            List<String> cons
    ) {
        public CreateReviewRequest(
                String skuCode,
                Integer rating,
                String title,
                String content,
                List<String> pros,
                List<String> cons
        ) {
            this(skuCode, rating, title, content, null, pros, cons);
        }

        public String effectiveTitle() {
            if (title != null && !title.isBlank()) return title.trim();
            return "חוות דעת של קונה מאומת";
        }

        public String effectiveContent() {
            if (content != null && !content.isBlank()) return content.trim();
            if (comment != null && !comment.isBlank()) return comment.trim();
            return "מוצר מעולה, ממליץ בחום!";
        }
    }

    public record ReviewResponse(
            UUID id,
            String skuCode,
            String customerId,
            String customerName,
            int rating,
            String title,
            String content,
            String comment,
            List<String> pros,
            List<String> cons,
            boolean verifiedPurchase,
            Instant createdAt
    ) implements Serializable {}

    public record ReviewSummaryResponse(
            String skuCode,
            double averageRating,
            int totalReviews,
            Map<Integer, Integer> starDistribution
    ) implements Serializable {}

    public record AiReviewSummaryResponse(
            String skuCode,
            String aiSummary,
            List<String> prosList,
            List<String> consList,
            int verifiedReviewsCount,
            double averageVerifiedRating,
            Instant updatedAt
    ) implements Serializable {}

    public record ProductReviewsPageResponse(
            ReviewSummaryResponse summary,
            List<ReviewResponse> reviews
    ) implements Serializable {}

    public record BuyerCheckResponse(
            String skuCode,
            boolean verifiedBuyer,
            boolean hasReviewed
    ) {}
}
