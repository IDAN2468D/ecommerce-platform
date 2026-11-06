package com.company.marketplace.dto;

import com.company.marketplace.domain.VendorCommission;
import com.company.marketplace.domain.VendorPayout;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorDashboardSummary {
    private VendorResponse vendor;
    private BigDecimal availableBalanceILS;
    private BigDecimal totalGrossEarningsILS;
    private BigDecimal totalPlatformFeesPaidILS;
    private int totalOrders;
    private List<VendorCommission> recentSales;
    private List<VendorPayout> recentPayouts;
}
