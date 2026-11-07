package com.company.flashsale.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimFlashDropRequest {
    @NotBlank
    private String customerId;

    @Min(1)
    @Builder.Default
    private int quantity = 1;
}
