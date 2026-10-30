package com.company.orderservice.dto.response;

import com.company.orderservice.domain.enums.CouponType;

import java.math.BigDecimal;

public record CouponValidationResponse(
    boolean valid,
    String code,
    CouponType discountType,
    BigDecimal discountValue,
    BigDecimal discountAmount,
    BigDecimal finalAmount,
    String message
) {}
