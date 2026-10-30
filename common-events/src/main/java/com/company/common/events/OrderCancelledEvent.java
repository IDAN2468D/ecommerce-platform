package com.company.common.events;

import java.time.Instant;
import java.util.UUID;

public record OrderCancelledEvent(
        UUID orderId,
        String customerId,
        String reason,
        Instant cancelledAt
) {}
