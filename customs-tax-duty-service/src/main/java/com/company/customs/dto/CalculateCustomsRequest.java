package com.company.customs.dto;

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
public class CalculateCustomsRequest {
    @NotBlank
    private String originCountry;

    @NotBlank
    private String hsCode;

    @NotBlank
    private String productName;

    @Min(1)
    private int itemCount;

    @Positive
    private BigDecimal subtotalILS;
}
