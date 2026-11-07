package com.company.groupbuy.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JoinGroupBuyRequest {
    @NotBlank
    private String customerId;

    private String customerName;
    private String referredByCode;
}
