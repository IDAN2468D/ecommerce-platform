package com.company.common.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentRefundedEvent(
        UUID transactionId,
        String refundId,
        BigDecimal amount,
        Instant refundedAt
) {}
