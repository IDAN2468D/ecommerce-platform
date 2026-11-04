package com.company.common.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ReturnApprovedEvent(
        String rmaNumber,
        UUID orderId,
        String customerId,
        String skuCode,
        BigDecimal refundAmount,
        BigDecimal bonusCredit,
        String resolutionType,
        String dhlTrackingNumber,
        Instant approvedAt
) {
    public ReturnApprovedEvent(String rmaNumber, UUID orderId, String customerId, String skuCode, BigDecimal refundAmount, BigDecimal bonusCredit, String resolutionType) {
        this(rmaNumber, orderId, customerId, skuCode, refundAmount, bonusCredit, resolutionType, null, Instant.now());
    }
}
