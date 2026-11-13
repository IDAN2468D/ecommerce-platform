package com.company.sustainability.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessSustainabilityRequest {
    @NotBlank
    private String customerId;

    @NotBlank
    private String skuCode;

    @NotBlank
    private String productName;

    @Positive
    private double weightKg;

    private boolean ecoConsolidatedDelivery;
}
