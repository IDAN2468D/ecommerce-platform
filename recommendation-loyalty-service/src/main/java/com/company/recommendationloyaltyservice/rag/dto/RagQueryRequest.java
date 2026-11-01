package com.company.recommendationloyaltyservice.rag.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagQueryRequest {

    @NotBlank(message = "Query text is required")
    private String query;

    private String conversationId;
    private String category;

    @Builder.Default
    private Integer topK = 4;

    @Builder.Default
    private Double minSimilarity = 0.5;
}
