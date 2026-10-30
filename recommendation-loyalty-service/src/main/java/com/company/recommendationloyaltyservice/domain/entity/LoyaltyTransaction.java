package com.company.recommendationloyaltyservice.domain.entity;

import com.company.recommendationloyaltyservice.domain.enums.LoyaltyTxType;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyTransaction {
    @Builder.Default
    private UUID txId = UUID.randomUUID();
    private UUID orderId;
    private String paymentTransactionId;
    private LoyaltyTxType type;
    private BigDecimal points;
    private BigDecimal orderAmount;
    private String description;
    @Builder.Default
    private Instant timestamp = Instant.now();
}
