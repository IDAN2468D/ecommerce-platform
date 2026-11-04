package com.company.merchantanalyticsservice.dto;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class AnalyticsDtos {

    public record AnalyticsSummaryResponse(
            BigDecimal grossMerchandiseValueIls,
            BigDecimal netRevenueIls,
            Long ordersCount,
            BigDecimal averageOrderValueIls,
            Double conversionRatePercentage,
            Double fraudBlockRatePercentage,
            Double rmaVipRetentionRatePercentage,
            Long abandonedCartsRecovered,
            Instant lastRefreshed
    ) {}

    public record SkuDepletionForecastDto(
            String skuCode,
            String title,
            Integer currentStock,
            Double dailyBurnRate,
            Double predictedDaysUntilDepletion,
            String restockUrgency,
            Instant calculatedAt
    ) {}

    public record MerchantCopilotRequest(
            @NotBlank String question
    ) {}

    public record MerchantCopilotResponse(
            String question,
            String answer,
            List<SkuDepletionForecastDto> topUrgentSkus,
            Instant answeredAt
    ) {}
}
