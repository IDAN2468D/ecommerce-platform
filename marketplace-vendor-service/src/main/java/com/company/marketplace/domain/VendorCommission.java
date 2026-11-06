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
@Document(collection = "marketplace_commissions")
public class VendorCommission {

    @Id
    private String id;
    private String orderId;
    private String vendorId;
    private String skuCode;
    private BigDecimal grossAmount;
    private BigDecimal platformFee; // Platform cut (e.g. 10%)
    private BigDecimal vendorNetEarnings; // Vendor cut (e.g. 90%)

    @CreatedDate
    private Instant createdAt;
}
