package com.company.bnpl.dto;

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
public class CreateBnplPlanRequest {
    @NotBlank
    private String customerId;

    private String orderId;
    private String productSummary;

    @Positive
    private BigDecimal totalAmount;

    @Min(2)
    @Builder.Default
    private int installmentsCount = 4;
}
