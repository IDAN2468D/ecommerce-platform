package com.company.creator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCreatorCampaignRequest {
    @NotBlank
    private String creatorHandle;

    @NotBlank
    private String streamTitle;

    @NotBlank
    private String pinnedSkuCode;

    @NotBlank
    private String pinnedProductName;

    @Positive
    private BigDecimal retailPriceILS;
}
