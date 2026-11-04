package com.company.common.events;

import java.math.BigDecimal;
import java.time.Instant;

public record PriceDroppedEvent(
        String skuCode,
        BigDecimal oldPrice,
        BigDecimal newPrice,
        BigDecimal thirtyDayLow,
        Double discountPercentage,
        Instant timestamp
) {
    public PriceDroppedEvent(String skuCode, BigDecimal oldPrice, BigDecimal newPrice, BigDecimal thirtyDayLow, Double discountPercentage) {
        this(skuCode, oldPrice, newPrice, thirtyDayLow, discountPercentage, Instant.now());
    }
}
