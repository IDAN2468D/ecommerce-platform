package com.company.common.events;

import java.time.Instant;
import java.util.UUID;

public record StockReservedEvent(
        UUID orderId,
        String reservationId,
        Instant reservedAt
) {}
