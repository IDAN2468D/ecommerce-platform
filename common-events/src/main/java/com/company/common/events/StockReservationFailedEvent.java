package com.company.common.events;

import java.time.Instant;
import java.util.UUID;

public record StockReservationFailedEvent(
        UUID orderId,
        String reason,
        Instant failedAt
) {}
