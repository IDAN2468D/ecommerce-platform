package com.company.recommendationloyaltyservice.service;

import com.company.recommendationloyaltyservice.domain.entity.LoyaltyWalletEntity;
import com.company.recommendationloyaltyservice.domain.enums.LoyaltyTier;
import com.company.recommendationloyaltyservice.domain.enums.LoyaltyTxType;
import com.company.recommendationloyaltyservice.dto.LoyaltyDtos.*;
import com.company.recommendationloyaltyservice.repository.LoyaltyWalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoyaltyService {

    private final LoyaltyWalletRepository walletRepository;
    private static final BigDecimal CASHBACK_RATE = new BigDecimal("0.05"); // 5% Cashback

    @Transactional
    public LoyaltyWalletEntity getOrCreateWallet(String customerId) {
        String targetId = (customerId != null && !customerId.isBlank()) ? customerId : "usr_demo";
        return walletRepository.findByCustomerId(targetId)
                .orElseGet(() -> {
                    LoyaltyWalletEntity wallet = LoyaltyWalletEntity.builder()
                            .id(UUID.randomUUID())
                            .customerId(targetId)
                            .pointsBalance(new BigDecimal("50.00")) // Welcome gift: 50 points (₪50)
                            .lifetimePointsEarned(new BigDecimal("50.00"))
                            .tier(LoyaltyTier.BRONZE)
                            .transactions(new ArrayList<>())
                            .createdAt(Instant.now())
                            .updatedAt(Instant.now())
                            .build();

                    wallet.getTransactions().add(com.company.recommendationloyaltyservice.domain.entity.LoyaltyTransaction.builder()
                            .txId(UUID.randomUUID())
                            .type(LoyaltyTxType.EARN)
                            .points(new BigDecimal("50.00"))
                            .orderAmount(BigDecimal.ZERO)
                            .description("מתנת הצטרפות למועדון VIP (50 נקודות)")
                            .timestamp(Instant.now())
                            .build());

                    return walletRepository.save(wallet);
                });
    }

    @Transactional
    public void creditCashback(String customerId, UUID orderId, String paymentTxId, BigDecimal orderAmount) {
        if (orderAmount == null || orderAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        BigDecimal points = orderAmount.multiply(CASHBACK_RATE).setScale(2, RoundingMode.HALF_UP);
        log.info("Crediting {} loyalty points (5% Cashback) for customer: {}, orderId: {}", points, customerId, orderId);

        LoyaltyWalletEntity wallet = getOrCreateWallet(customerId);
        wallet.addTransaction(
                LoyaltyTxType.EARN,
                points,
                orderAmount,
                orderId,
                paymentTxId,
                "צבירת 5% Cashback על הזמנה #" + (orderId != null ? orderId.toString().substring(0, 8) : "N/A")
        );
        walletRepository.save(wallet);
        log.info("Wallet updated. New balance: {} points, Tier: {}", wallet.getPointsBalance(), wallet.getTier());
    }

    @Transactional
    public void compensateRefund(String customerId, UUID orderId, String paymentTxId, BigDecimal refundAmount) {
        if (refundAmount == null || refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        BigDecimal pointsToDeduct = refundAmount.multiply(CASHBACK_RATE).setScale(2, RoundingMode.HALF_UP);
        log.info("Compensating loyalty refund: deducting {} points for customer: {}, orderId: {}", pointsToDeduct, customerId, orderId);

        LoyaltyWalletEntity wallet = getOrCreateWallet(customerId);
        wallet.addTransaction(
                LoyaltyTxType.REFUND,
                pointsToDeduct,
                refundAmount,
                orderId,
                paymentTxId,
                "קיזוז נקודות עקב ביטול/החזר עבור הזמנה"
        );
        walletRepository.save(wallet);
    }

    @Transactional
    public RedeemPointsResponse redeemPoints(String customerId, BigDecimal pointsToRedeem) {
        log.info("Redeeming {} points for customer: {}", pointsToRedeem, customerId);
        LoyaltyWalletEntity wallet = getOrCreateWallet(customerId);

        if (wallet.getPointsBalance().compareTo(pointsToRedeem) < 0) {
            return new RedeemPointsResponse(
                    false,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    wallet.getPointsBalance(),
                    "יתרת הנקודות אינה מספיקה למימוש המבוקש"
            );
        }

        wallet.addTransaction(
                LoyaltyTxType.BURN,
                pointsToRedeem,
                BigDecimal.ZERO,
                null,
                null,
                "מימוש " + pointsToRedeem + " נקודות להנחה בעגלת הקניות"
        );
        walletRepository.save(wallet);

        return new RedeemPointsResponse(
                true,
                pointsToRedeem,
                pointsToRedeem, // 1 point = ₪1
                wallet.getPointsBalance(),
                "הנקודות מומשו בהצלחה (הנחה של ₪" + pointsToRedeem + " בסל)"
        );
    }

    public LoyaltyWalletResponse toResponse(LoyaltyWalletEntity wallet) {
        List<LoyaltyTransactionDto> dtoList = (wallet.getTransactions() != null)
                ? wallet.getTransactions().stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .map(t -> new LoyaltyTransactionDto(
                        t.getTxId(),
                        t.getOrderId(),
                        t.getType(),
                        t.getPoints(),
                        t.getOrderAmount(),
                        t.getDescription(),
                        t.getTimestamp()
                )).toList()
                : List.of();

        return new LoyaltyWalletResponse(
                wallet.getCustomerId(),
                wallet.getPointsBalance(),
                wallet.getLifetimePointsEarned(),
                wallet.getTier(),
                5,
                dtoList
        );
    }
}
