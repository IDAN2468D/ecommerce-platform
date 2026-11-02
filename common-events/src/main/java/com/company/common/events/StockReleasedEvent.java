package com.company.common.events;

import java.time.Instant;
import java.util.Map;

public record StockReleasedEvent(
        String reservationId,
        String reason,
        Instant releasedAt,
        String skuCode,
        Integer availableQuantity,
        Map<String, Integer> updatedStockBySku
) {
    public StockReleasedEvent(String reservationId, String reason, Instant releasedAt) {
        this(reservationId, reason, releasedAt, null, null, null);
    }
}
