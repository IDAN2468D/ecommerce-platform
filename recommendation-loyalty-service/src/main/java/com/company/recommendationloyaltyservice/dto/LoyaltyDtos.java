package com.company.recommendationloyaltyservice.dto;

import com.company.recommendationloyaltyservice.domain.enums.LoyaltyTier;
import com.company.recommendationloyaltyservice.domain.enums.LoyaltyTxType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class LoyaltyDtos {

    public record LoyaltyTransactionDto(
            UUID txId,
            UUID orderId,
            LoyaltyTxType type,
            BigDecimal points,
            BigDecimal orderAmount,
            String description,
            Instant timestamp
    ) implements Serializable {}

    public record LoyaltyWalletResponse(
            String customerId,
            BigDecimal pointsBalance,
            BigDecimal lifetimePointsEarned,
            LoyaltyTier tier,
            int cashbackRatePercent,
            List<LoyaltyTransactionDto> transactions
    ) implements Serializable {}

    public record RedeemPointsRequest(
            @NotNull @Positive BigDecimal pointsToRedeem
    ) {}

    public record RedeemPointsResponse(
            boolean success,
            BigDecimal pointsRedeemed,
            BigDecimal discountAmount,
            BigDecimal remainingBalance,
            String message
    ) implements Serializable {}
}
