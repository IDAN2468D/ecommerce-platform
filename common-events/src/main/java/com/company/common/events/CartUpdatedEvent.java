package com.company.common.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record CartUpdatedEvent(
        String customerId,
        String updateType,
        List<CartItemPayload> items,
        int totalItems,
        BigDecimal subtotalAmount,
        String currency,
        Instant timestamp
) {
    public CartUpdatedEvent {
        if (items == null) {
            items = List.of();
        }
        if (subtotalAmount == null) {
            subtotalAmount = BigDecimal.ZERO;
        }
        if (currency == null) {
            currency = "ILS";
        }
        if (timestamp == null) {
            timestamp = Instant.now();
        }
    }

    public record CartItemPayload(
            String skuCode,
            String productName,
            int quantity,
            BigDecimal unitPrice,
            BigDecimal lineTotal,
            String imageUrl
    ) {}
}
