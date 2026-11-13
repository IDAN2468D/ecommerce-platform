package com.company.wallet.dto;

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
public class IssueWalletGiftCardRequest {
    @NotBlank
    private String senderCustomerId;

    @NotBlank
    private String recipientEmail;

    @NotBlank
    private String occasionTitle;

    @Positive
    private BigDecimal amountILS;
}
