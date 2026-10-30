package com.company.common.events;

import java.time.Instant;
import java.util.UUID;

public record ShipmentScheduledEvent(
        UUID shipmentId,
        UUID orderId,
        String customerId,
        String trackingNumber,
        String carrier,
        String destinationAddress,
        Instant estimatedDeliveryDate,
        Instant scheduledAt
) {}
