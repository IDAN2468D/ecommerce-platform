package com.company.warranty.domain;

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
@Document(collection = "digital_warranty_certificates")
public class DigitalWarrantyCertificate {

    @Id
    private String id;

    @Indexed(unique = true)
    private String certificateNumber;

    @Indexed
    private String customerId;

    private String orderId;
    private String skuCode;
    private String productName;
    private String serialNumber;
    private String vendorName;

    private BigDecimal purchaseAmount;
    private BigDecimal escrowAmountHeld;

    @Builder.Default
    private String escrowStatus = "HELD_IN_ESCROW"; // HELD_IN_ESCROW, RELEASED_TO_VENDOR, REFUNDED

    @Builder.Default
    private String warrantyStatus = "ACTIVE"; // ACTIVE, CLAIM_OPENED, EXPIRED

    private String sha256Signature;
    private int coverageMonths;
    private Instant issuedAt;
    private Instant expiresAt;
    private String activeClaimDescription;
}
