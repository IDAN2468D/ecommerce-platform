package com.company.marketplace.dto;

import com.company.marketplace.domain.Vendor;
import com.company.marketplace.domain.VendorStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorResponse {
    private String id;
    private String vendorCode;
    private String businessName;
    private String slug;
    private String contactEmail;
    private String description;
    private String logoUrl;
    private String bannerUrl;
    private double rating;
    private int reviewCount;
    private BigDecimal commissionRatePct;
    private BigDecimal walletBalanceILS;
    private BigDecimal totalGrossSalesILS;
    private int totalOrdersFulfilled;
    private VendorStatus status;
    private List<String> supportedCategories;
    private Instant createdAt;

    public static VendorResponse fromEntity(Vendor v) {
        return VendorResponse.builder()
                .id(v.getId())
                .vendorCode(v.getVendorCode())
                .businessName(v.getBusinessName())
                .slug(v.getSlug())
                .contactEmail(v.getContactEmail())
                .description(v.getDescription())
                .logoUrl(v.getLogoUrl())
                .bannerUrl(v.getBannerUrl())
                .rating(v.getRating())
                .reviewCount(v.getReviewCount())
                .commissionRatePct(v.getCommissionRatePct())
                .walletBalanceILS(v.getWalletBalanceILS())
                .totalGrossSalesILS(v.getTotalGrossSalesILS())
                .totalOrdersFulfilled(v.getTotalOrdersFulfilled())
                .status(v.getStatus())
                .supportedCategories(v.getSupportedCategories())
                .createdAt(v.getCreatedAt())
                .build();
    }
}
