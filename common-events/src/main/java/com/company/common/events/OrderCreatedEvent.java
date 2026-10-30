package com.company.common.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderCreatedEvent(
        UUID orderId,
        String customerId,
        BigDecimal totalAmount,
        String currency,
        String paymentMethodToken,
        String idempotencyKey,
        List<OrderItemPayload> items,
        Instant createdAt
) {
    public record OrderItemPayload(
            String skuCode,
            int quantity,
            BigDecimal unitPrice
    ) {}
}
