package com.company.ragservice.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;

import java.util.List;

@Builder
public record ProductComparisonRequest(
        @NotEmpty(message = "At least 2 SKUs are required for comparison")
        List<String> skus,
        String userUseCase
) {}
