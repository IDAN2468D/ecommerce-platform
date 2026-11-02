package com.company.ragservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record RagQueryRequest(
        @NotBlank(message = "Query cannot be empty")
        String query,
        String conversationId,
        String customerId,
        String category,
        String categoryFilter,
        Double maxPrice,
        Double minRating,
        Boolean onlyInStock,
        Boolean inStockOnly,
        Integer topK,
        Double minSimilarity,
        Double cartTotal
) {
    public String effectiveCategory() {
        if (category != null && !category.isBlank()) {
            return category;
        }
        return categoryFilter;
    }

    public Boolean effectiveOnlyInStock() {
        if (onlyInStock != null) {
            return onlyInStock;
        }
        return inStockOnly;
    }

    public String effectiveCustomerId() {
        if (customerId != null && !customerId.isBlank()) {
            return customerId;
        }
        return "usr_demo";
    }
}
