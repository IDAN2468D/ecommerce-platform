package com.company.recommendationloyaltyservice.domain.entity;

import com.company.recommendationloyaltyservice.domain.enums.LoyaltyTier;
import com.company.recommendationloyaltyservice.domain.enums.LoyaltyTxType;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document(collection = "loyalty_wallets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyWalletEntity {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Indexed(unique = true)
    private String customerId;

    @Field(targetType = FieldType.DECIMAL128)
    @Builder.Default
    private BigDecimal pointsBalance = BigDecimal.ZERO;

    @Field(targetType = FieldType.DECIMAL128)
    @Builder.Default
    private BigDecimal lifetimePointsEarned = BigDecimal.ZERO;

    @Builder.Default
    private LoyaltyTier tier = LoyaltyTier.BRONZE;

    @Builder.Default
    private List<LoyaltyTransaction> transactions = new ArrayList<>();

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();

    public void addTransaction(LoyaltyTxType type, BigDecimal points, BigDecimal orderAmount, UUID orderId, String paymentTxId, String desc) {
        if (this.transactions == null) {
            this.transactions = new ArrayList<>();
        }
        if (type == LoyaltyTxType.EARN) {
            this.pointsBalance = this.pointsBalance.add(points);
            this.lifetimePointsEarned = this.lifetimePointsEarned.add(points);
        } else if (type == LoyaltyTxType.BURN || type == LoyaltyTxType.REFUND) {
            this.pointsBalance = this.pointsBalance.subtract(points).max(BigDecimal.ZERO);
        }

        recalculateTier();

        this.transactions.add(LoyaltyTransaction.builder()
                .txId(UUID.randomUUID())
                .orderId(orderId)
                .paymentTransactionId(paymentTxId)
                .type(type)
                .points(points)
                .orderAmount(orderAmount)
                .description(desc)
                .timestamp(Instant.now())
                .build());

        this.updatedAt = Instant.now();
    }

    public void recalculateTier() {
        if (this.lifetimePointsEarned.compareTo(new BigDecimal("10000")) >= 0) {
            this.tier = LoyaltyTier.PLATINUM;
        } else if (this.lifetimePointsEarned.compareTo(new BigDecimal("5000")) >= 0) {
            this.tier = LoyaltyTier.GOLD;
        } else if (this.lifetimePointsEarned.compareTo(new BigDecimal("1000")) >= 0) {
            this.tier = LoyaltyTier.SILVER;
        } else {
            this.tier = LoyaltyTier.BRONZE;
        }
    }
}
