package com.company.common.events;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record FraudFlaggedEvent(
        String assessmentId,
        UUID orderId,
        String customerId,
        Integer riskScore,
        List<String> reasons,
        Instant evaluatedAt
) {
    public FraudFlaggedEvent(String assessmentId, UUID orderId, String customerId, Integer riskScore, List<String> reasons) {
        this(assessmentId, orderId, customerId, riskScore, reasons, Instant.now());
    }
}
