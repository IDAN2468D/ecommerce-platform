package com.company.ragservice.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record RagQueryResponse(
        String query,
        String answer,
        List<CitationDto> citations,
        List<ExecutedActionDto> executedActions,
        Double confidenceScore,
        String model,
        Long latencyMs,
        Integer retrievedDocumentsCount
) {}
