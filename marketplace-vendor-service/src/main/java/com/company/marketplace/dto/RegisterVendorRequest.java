package com.company.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
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
public class RegisterVendorRequest {
    @NotBlank
    private String businessName;
    private String contactEmail;
    private String contactPhone;
    private String description;
    private String logoUrl;
    private String bannerUrl;
    private BigDecimal customCommissionRatePct;
    private List<String> supportedCategories;
    private String bankAccountRef;
}
