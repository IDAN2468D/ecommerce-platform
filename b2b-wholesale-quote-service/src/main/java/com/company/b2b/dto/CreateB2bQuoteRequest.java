package com.company.b2b.dto;

import jakarta.validation.constraints.Min;
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
public class CreateB2bQuoteRequest {
    @NotBlank
    private String companyName;

    @NotBlank
    private String skuCode;

    @NotBlank
    private String productName;

    @Min(5)
    private int quantity;

    @Positive
    private BigDecimal unitRetailPriceILS;
}
