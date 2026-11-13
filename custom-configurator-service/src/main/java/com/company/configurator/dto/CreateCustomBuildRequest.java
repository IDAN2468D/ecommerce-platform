package com.company.configurator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCustomBuildRequest {
    @NotBlank
    private String customerId;

    @NotBlank
    private String rigProfileType;

    @NotEmpty
    private List<String> selectedSkus;

    @Positive
    private BigDecimal baseComponentsTotalILS;
}
