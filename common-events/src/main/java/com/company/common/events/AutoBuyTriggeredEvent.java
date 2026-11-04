package com.company.common.events;

import java.math.BigDecimal;
import java.time.Instant;

public record AutoBuyTriggeredEvent(
        String ruleId,
        String customerId,
        String skuCode,
        BigDecimal triggeredPrice,
        BigDecimal targetPrice,
        Instant triggeredAt
) {
    public AutoBuyTriggeredEvent(String ruleId, String customerId, String skuCode, BigDecimal triggeredPrice, BigDecimal targetPrice) {
        this(ruleId, customerId, skuCode, triggeredPrice, targetPrice, Instant.now());
    }
}
