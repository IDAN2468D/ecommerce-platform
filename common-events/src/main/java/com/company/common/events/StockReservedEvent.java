package com.company.common.events;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record StockReservedEvent(
        UUID orderId,
        String reservationId,
        Instant reservedAt,
        String skuCode,
        Integer availableQuantity,
        Map<String, Integer> updatedStockBySku
) {
    public StockReservedEvent(UUID orderId, String reservationId, Instant reservedAt) {
        this(orderId, reservationId, reservedAt, null, null, null);
    }
}
