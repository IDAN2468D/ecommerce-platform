package com.company.common.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentCapturedEvent(
        UUID orderId,
        String customerId,
        String transactionId,
        BigDecimal amount,
        String currency,
        Instant capturedAt
) {
    public PaymentCapturedEvent(UUID orderId, String transactionId, BigDecimal amount, String currency, Instant capturedAt) {
        this(orderId, null, transactionId, amount, currency, capturedAt);
    }
}
