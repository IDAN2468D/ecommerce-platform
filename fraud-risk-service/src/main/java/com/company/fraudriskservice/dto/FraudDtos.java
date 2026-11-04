package com.company.fraudriskservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class FraudDtos {

    public record FraudAssessmentRequest(
            @NotNull UUID orderId,
            @NotBlank String customerId,
            @NotNull @Positive BigDecimal totalAmount,
            String city,
            String couponCode
    ) {}

    public record InventoryDepletionWarningDto(
            String skuCode,
            Integer remainingUnits,
            Double predictedDaysUntilDepletion
    ) {}

    public record FraudAssessmentResponse(
            String assessmentId,
            UUID orderId,
            String customerId,
            Integer riskScore,
            String riskLevel,
            String decision,
            List<String> signalsChecked,
            List<String> triggeredRules,
            InventoryDepletionWarningDto inventoryDepletionWarning,
            Instant evaluatedAt
    ) {}
}
