package com.company.common.events;

import java.time.Instant;
import java.util.UUID;

public record StockReleasedEvent(
        String reservationId,
        String reason,
        Instant releasedAt
) {}
