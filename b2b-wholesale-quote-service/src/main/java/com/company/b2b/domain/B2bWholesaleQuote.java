package com.company.b2b.domain;

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
@Document(collection = "b2b_wholesale_quotes")
public class B2bWholesaleQuote {

    @Id
    private String id;

    @Indexed(unique = true)
    private String quoteNumber;

    private String companyName;
    private String skuCode;
    private String productName;
    private int quantity;

    private BigDecimal unitRetailPriceILS;
    private int volumeDiscountPct;
    private BigDecimal netUnitPriceILS;
    private BigDecimal totalNetAmountILS;

    @Builder.Default
    private String paymentTerms = "NET_30_CORPORATE_CREDIT";

    @Builder.Default
    private String status = "ISSUED_APPROVED";

    @Builder.Default
    private Instant createdAt = Instant.now();
}
