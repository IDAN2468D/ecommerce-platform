package com.company.tradein.dto;

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
public class CreateTradeInRequest {
    @NotBlank
    private String customerId;

    @NotBlank
    private String deviceModel;

    private String deviceCategory;
    private String serialOrImei;

    @NotBlank
    private String conditionGrade; // MINT_A_PLUS, GOOD_A, FAIR_B

    @Positive
    private BigDecimal originalRetailPriceILS;
}
