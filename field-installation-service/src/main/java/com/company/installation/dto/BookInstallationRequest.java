package com.company.installation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookInstallationRequest {
    @NotBlank
    private String customerId;

    @NotBlank
    private String skuCode;

    @NotBlank
    private String productName;

    @NotBlank
    private String installationType;

    @NotBlank
    private String city;

    private boolean vipMember;
}
