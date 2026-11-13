package com.company.fulfillment.dto;

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
public class ReserveLockerRequest {
    @NotBlank
    private String customerId;

    @NotBlank
    private String skuCode;

    @NotBlank
    private String productName;

    @NotBlank
    private String hubCity;

    @Positive
    private BigDecimal retailPriceILS;
}
