package com.company.customs.domain;

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
@Document(collection = "customs_duty_assessments")
public class CustomsDutyAssessment {

    @Id
    private String id;

    @Indexed(unique = true)
    private String declarationNumber;

    private String originCountry;
    private String hsCode;
    private String productName;
    private int itemCount;

    private BigDecimal subtotalILS;
    private BigDecimal estimatedValueUSD;
    private boolean vatExemptUnder75USD;

    private BigDecimal vatAmountILS;
    private BigDecimal customsDutyAmountILS;
    private BigDecimal totalLandedCostILS;

    private boolean smartSplitRecommended;
    private BigDecimal potentialSplitSavingsILS;

    @Builder.Default
    private String incoterms = "DDP_DELIVERED_DUTY_PAID";

    @Builder.Default
    private Instant createdAt = Instant.now();
}
