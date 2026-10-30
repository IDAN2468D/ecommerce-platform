package com.company.common.events;

import java.time.Instant;
import java.util.UUID;

public record OrderDispatchedEvent(
        UUID shipmentId,
        UUID orderId,
        String customerId,
        String trackingNumber,
        String carrier,
        String status,
        Instant dispatchedAt
) {}
