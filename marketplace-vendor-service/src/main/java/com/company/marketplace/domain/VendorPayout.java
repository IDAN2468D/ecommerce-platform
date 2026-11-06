package com.company.marketplace.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "marketplace_payouts")
public class VendorPayout {

    @Id
    private String id;
    private String payoutNumber;
    private String vendorId;
    private BigDecimal amount;
    private String bankAccountRef;
    private String status; // "COMPLETED", "PROCESSING"
    private String transactionRef;

    @CreatedDate
    private Instant requestedAt;
}
