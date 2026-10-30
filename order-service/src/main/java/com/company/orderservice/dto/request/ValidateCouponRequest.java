package com.company.orderservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ValidateCouponRequest(
    @NotBlank(message = "Coupon code is required")
    String couponCode,

    @NotNull(message = "Order amount is required")
    @Positive(message = "Order amount must be positive")
    BigDecimal orderAmount
) {}
