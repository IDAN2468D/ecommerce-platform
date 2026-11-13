package com.company.wallet.service;

import com.company.wallet.domain.MultiCurrencyWalletCard;
import com.company.wallet.dto.IssueWalletGiftCardRequest;
import com.company.wallet.repository.MultiCurrencyWalletCardRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DigitalWalletGiftcardService {

    private static final BigDecimal USD_RATE = BigDecimal.valueOf(3.70);
    private static final BigDecimal EUR_RATE = BigDecimal.valueOf(4.00);

    private final MultiCurrencyWalletCardRepository walletRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @PostConstruct
    public void seedWalletsIfEmpty() {
        if (walletRepository.count() == 0) {
            log.info("Seeding initial Smart Multi-Currency Wallet & Gift Cards...");
            issueGiftCard(IssueWalletGiftCardRequest.builder()
                    .senderCustomerId("cust_vip_idan")
                    .recipientEmail("vip.wallet@company.co.il")
                    .occasionTitle("VIP Unified RMA + Trade-In + Gift Balance")
                    .amountILS(BigDecimal.valueOf(1000.00))
                    .build());
        }
    }

    public List<MultiCurrencyWalletCard> getAllCards() {
        return walletRepository.findAll();
    }

    public MultiCurrencyWalletCard issueGiftCard(IssueWalletGiftCardRequest request) {
        BigDecimal baseAmount = request.getAmountILS().setScale(2, RoundingMode.HALF_UP);
        // 8% VIP bonus top-up on wallet loads / gift cards of 500 ILS or more
        BigDecimal bonusFactor = baseAmount.compareTo(BigDecimal.valueOf(500.00)) >= 0
                ? BigDecimal.valueOf(0.08)
                : BigDecimal.valueOf(0.05);
        BigDecimal bonus = baseAmount.multiply(bonusFactor).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalILS = baseAmount.add(bonus).setScale(2, RoundingMode.HALF_UP);

        BigDecimal eqUSD = totalILS.divide(USD_RATE, 2, RoundingMode.HALF_UP);
        BigDecimal eqEUR = totalILS.divide(EUR_RATE, 2, RoundingMode.HALF_UP);

        MultiCurrencyWalletCard card = MultiCurrencyWalletCard.builder()
                .voucherCode("WLT-FX-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .senderCustomerId(request.getSenderCustomerId())
                .recipientEmail(request.getRecipientEmail())
                .occasionTitle(request.getOccasionTitle())
                .amountILS(baseAmount)
                .topUpBonusILS(bonus)
                .totalAvailableILS(totalILS)
                .equivalentUSD(eqUSD)
                .equivalentEUR(eqEUR)
                .ledgerType("DOUBLE_ENTRY_IMMUTABLE_LEDGER")
                .status("ACTIVE_MULTI_CURRENCY_BALANCE")
                .createdAt(Instant.now())
                .build();

        MultiCurrencyWalletCard saved = walletRepository.save(card);
        try {
            kafkaTemplate.send("digital-wallet-events", saved.getVoucherCode(),
                    "WALLET_GIFTCARD_ISSUED:" + saved.getVoucherCode() + ":₪" + saved.getTotalAvailableILS());
        } catch (Exception e) {
            log.warn("Kafka wallet event skipped: {}", e.getMessage());
        }
        return saved;
    }
}
