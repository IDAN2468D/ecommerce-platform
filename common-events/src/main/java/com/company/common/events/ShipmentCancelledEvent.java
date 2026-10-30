package com.company.common.events;

import java.time.Instant;
import java.util.UUID;

public record ShipmentCancelledEvent(
        UUID shipmentId,
        UUID orderId,
        String customerId,
        String trackingNumber,
        String reason,
        Instant cancelledAt
) {}
