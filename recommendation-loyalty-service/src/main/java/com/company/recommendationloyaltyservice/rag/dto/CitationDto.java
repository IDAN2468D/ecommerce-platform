package com.company.recommendationloyaltyservice.rag.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CitationDto {
    private String skuCode;
    private String title;
    private Double price;
    private Double relevanceScore;
    private String category;
    private Boolean inStock;
    private String snippet;
}
