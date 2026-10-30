package com.company.common.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentFailedEvent(
        UUID orderId,
        String reason,
        BigDecimal attemptedAmount,
        String currency,
        Instant failedAt
) {}
