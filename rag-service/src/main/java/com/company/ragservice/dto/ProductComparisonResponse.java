package com.company.ragservice.dto;

import lombok.Builder;

import java.util.List;
import java.util.Map;

@Builder
public record ProductComparisonResponse(
        List<String> skus,
        String userUseCase,
        String recommendedSku,
        String recommendedProductTitle,
        String verdictSummary,
        Map<String, String> categoryWinners,
        List<ProductTradeOffDto> tradeOffs,
        String model,
        Long latencyMs
) {
    @Builder
    public record ProductTradeOffDto(
            String skuCode,
            String title,
            Double price,
            Double rating,
            List<String> strengths,
            List<String> tradeOffs
    ) {}
}
