package com.company.gifting.dto;

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
public class ContributeGiftRequest {
    @NotBlank
    private String contributorName;

    @Positive
    private BigDecimal amountILS;

    private String greetingMessage;
}
