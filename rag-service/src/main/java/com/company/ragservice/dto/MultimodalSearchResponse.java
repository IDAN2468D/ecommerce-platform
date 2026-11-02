package com.company.ragservice.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record MultimodalSearchResponse(
        String extractedDescription,
        List<String> detectedFeatures,
        String answer,
        List<CitationDto> matches,
        String model,
        Long latencyMs
) {}
