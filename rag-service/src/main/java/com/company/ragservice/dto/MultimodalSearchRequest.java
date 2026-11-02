package com.company.ragservice.dto;

import lombok.Builder;

@Builder
public record MultimodalSearchRequest(
        String imageBase64,
        String mimeType,
        String queryText,
        String category,
        Double maxPrice,
        Boolean onlyInStock,
        Integer topK
) {}
