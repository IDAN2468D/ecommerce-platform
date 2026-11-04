package com.company.common.events;

import java.time.Instant;
import java.util.UUID;

public record FraudCheckPassedEvent(
        String assessmentId,
        UUID orderId,
        String customerId,
        Integer riskScore,
        Instant evaluatedAt
) {
    public FraudCheckPassedEvent(String assessmentId, UUID orderId, String customerId, Integer riskScore) {
        this(assessmentId, orderId, customerId, riskScore, Instant.now());
    }
}
