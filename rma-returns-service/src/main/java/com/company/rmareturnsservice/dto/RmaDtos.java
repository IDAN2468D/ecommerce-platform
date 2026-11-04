package com.company.rmareturnsservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class RmaDtos {

    public record EvaluateReturnRequest(
            @NotNull UUID orderId,
            @NotBlank String skuCode,
            String customerId,
            String reason
    ) {}

    public record ReturnEligibilityResponse(
            UUID orderId,
            String skuCode,
            boolean eligible,
            BigDecimal baseRefundAmount,
            BigDecimal vipBonusAmount,
            BigDecimal vipTotalCreditAmount,
            String recommendedResolution,
            String explanation
    ) {}

    public record CreateReturnRequest(
            @NotNull UUID orderId,
            @NotBlank String skuCode,
            @NotBlank String customerId,
            String reasonCategory,
            String resolutionType,
            String imageBase64
    ) {}

    public record ReturnRequestResponse(
            String rmaNumber,
            UUID orderId,
            String customerId,
            String skuCode,
            String reasonCategory,
            String resolutionType,
            String status,
            BigDecimal baseAmount,
            BigDecimal bonusAmount,
            BigDecimal totalCreditAmount,
            String dhlReturnTracking,
            String pickupWindow,
            String calendarPickupEventUrl,
            Instant createdAt
    ) {}
}
