package com.company.marketplace.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "marketplace_vendors")
public class Vendor {

    @Id
    private String id;
    private String vendorCode;
    private String businessName;
    private String slug;
    private String contactEmail;
    private String contactPhone;
    private String description;
    private String logoUrl;
    private String bannerUrl;
    private double rating;
    private int reviewCount;
    private BigDecimal commissionRatePct; // e.g. 10.0%
    private BigDecimal walletBalanceILS;  // Available payout balance
    private BigDecimal totalGrossSalesILS;
    private int totalOrdersFulfilled;
    private VendorStatus status;
    private List<String> supportedCategories;
    private String bankAccountRef;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
