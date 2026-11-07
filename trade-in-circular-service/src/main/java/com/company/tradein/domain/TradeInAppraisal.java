package com.company.tradein.domain;

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
@Document(collection = "trade_in_appraisals")
public class TradeInAppraisal {

    @Id
    private String id;

    @Indexed(unique = true)
    private String appraisalCode;

    @Indexed
    private String customerId;

    private String deviceCategory;
    private String deviceModel;
    private String serialOrImei;
    private String conditionGrade; // MINT_A_PLUS, GOOD_A, FAIR_B

    private BigDecimal baseMarketValueILS;
    private BigDecimal approvedCreditILS;
    private String tradeInVoucherCode;
    private int resaleRetention24mPct;

    @Builder.Default
    private String status = "APPROVED_VOUCHER_ISSUED";

    @Builder.Default
    private Instant createdAt = Instant.now();
}
