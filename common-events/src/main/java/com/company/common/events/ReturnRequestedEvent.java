package com.company.common.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ReturnRequestedEvent(
        String rmaNumber,
        UUID orderId,
        String customerId,
        String skuCode,
        String reasonCategory,
        String resolutionType,
        BigDecimal baseAmount,
        Instant timestamp
) {
    public ReturnRequestedEvent(String rmaNumber, UUID orderId, String customerId, String skuCode, String resolutionType, BigDecimal baseAmount) {
        this(rmaNumber, orderId, customerId, skuCode, "GENERAL", resolutionType, baseAmount, Instant.now());
    }
}
