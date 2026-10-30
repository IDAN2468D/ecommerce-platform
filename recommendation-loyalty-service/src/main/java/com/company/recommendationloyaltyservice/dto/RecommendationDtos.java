package com.company.recommendationloyaltyservice.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

public class RecommendationDtos {

    public record RecommendedProductDto(
            String skuCode,
            String productName,
            String category,
            BigDecimal unitPrice,
            String imageUrl,
            double coOccurrenceScore,
            String recommendationReason
    ) implements Serializable {}

    public record RecommendationResponse(
            String sourceSkuCode,
            List<RecommendedProductDto> recommendations
    ) implements Serializable {}
}
