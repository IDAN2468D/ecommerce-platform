package com.company.dynamicpricingservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class PricingDtos {

    public record PricePointDto(
            BigDecimal price,
            Instant recordedAt,
            String triggerReason
    ) {}

    public record PriceHistoryResponse(
            String skuCode,
            BigDecimal currentPrice,
            BigDecimal thirtyDayLow,
            BigDecimal thirtyDayHigh,
            String priceTrendForecast,
            Double dropProbability,
            List<PricePointDto> pricePoints
    ) {}

    public record CreateAutoBuyRuleRequest(
            @NotBlank String customerId,
            @NotBlank String skuCode,
            @NotNull @Positive BigDecimal targetPrice,
            boolean autoBuyEnabled
    ) {}

    public record AutoBuyRuleResponse(
            String ruleId,
            String customerId,
            String skuCode,
            BigDecimal currentPrice,
            BigDecimal thirtyDayLow,
            BigDecimal targetPrice,
            boolean autoBuyEnabled,
            String status,
            Instant createdAt
    ) {}

    public record BundleCalculationRequest(
            @NotEmpty List<String> skuCodes,
            BigDecimal budgetLimit
    ) {}

    public record BundleItemDto(
            String skuCode,
            String title,
            BigDecimal unitPrice
    ) {}

    public record BundleQuoteResponse(
            String bundleId,
            String bundleTitle,
            Double compatibilityScore,
            List<BundleItemDto> items,
            BigDecimal originalTotal,
            Double bundleDiscountPercentage,
            BigDecimal bundleDiscountAmount,
            BigDecimal finalBundlePrice
    ) {}
}
