package com.company.ragservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record RagQueryRequest(
        @NotBlank(message = "השאילתה אינה יכולה להיות ריקה")
        String query,

        String customerId,
        String categoryFilter,
        Double maxPrice,
        Boolean inStockOnly,
        Integer topK
) {}
