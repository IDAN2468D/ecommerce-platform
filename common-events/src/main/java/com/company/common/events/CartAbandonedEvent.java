package com.company.common.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record CartAbandonedEvent(
        String userId,
        List<AbandonedCartItem> items,
        BigDecimal totalAmount,
        Instant timestamp
) {
    public String customerId() {
        return userId;
    }

    public BigDecimal estimatedTotal() {
        return totalAmount;
    }

    public record AbandonedCartItem(
            String skuCode,
            String productName,
            int quantity,
            BigDecimal unitPrice
    ) {}
}
