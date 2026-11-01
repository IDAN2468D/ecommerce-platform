package com.company.ragservice.dto;

import lombok.Builder;

@Builder
public record CitationDto(
        String skuCode,
        String title,
        Double price,
        Double relevanceScore,
        String category,
        Boolean inStock,
        String snippet
) {}
