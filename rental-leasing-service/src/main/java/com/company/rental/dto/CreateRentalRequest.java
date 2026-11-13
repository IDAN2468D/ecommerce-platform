package com.company.rental.dto;

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
public class CreateRentalRequest {
    @NotBlank
    private String customerId;

    @NotBlank
    private String skuCode;

    @NotBlank
    private String productName;

    @Min(7)
    private int durationDays;

    @Positive
    private BigDecimal retailPriceILS;
}
