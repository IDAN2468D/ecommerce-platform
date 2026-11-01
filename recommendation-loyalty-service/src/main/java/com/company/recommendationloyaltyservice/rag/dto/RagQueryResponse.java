package com.company.recommendationloyaltyservice.rag.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagQueryResponse {
    private String query;
    private String answer;
    private List<CitationDto> citations;
    private Double confidenceScore;
    private String model;
    private Long latencyMs;
    private Integer retrievedDocumentsCount;
}
