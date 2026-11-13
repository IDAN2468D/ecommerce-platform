package com.company.wallet.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "multi_currency_wallets")
public class MultiCurrencyWalletCard {

    @Id
    private String id;

    @Indexed(unique = true)
    private String voucherCode;

    private String senderCustomerId;
    private String recipientEmail;
    private String occasionTitle;

    private BigDecimal amountILS;
    private BigDecimal topUpBonusILS;
    private BigDecimal totalAvailableILS;
    private BigDecimal equivalentUSD;
    private BigDecimal equivalentEUR;

    @Builder.Default
    private String ledgerType = "DOUBLE_ENTRY_IMMUTABLE_LEDGER";

    @Builder.Default
    private String status = "ACTIVE_MULTI_CURRENCY_BALANCE";

    @Builder.Default
    private Instant createdAt = Instant.now();
}
