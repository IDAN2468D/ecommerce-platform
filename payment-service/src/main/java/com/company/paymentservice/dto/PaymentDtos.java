package com.company.paymentservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class PaymentDtos {

    public record PaymentRequest(
        @NotBlank String customerId,
        @NotNull @Positive BigDecimal amount,
        @NotBlank @Size(min = 3, max = 3) String currency,
        @NotBlank String paymentMethodToken,
        @NotBlank String idempotencyKey
    ) {}

    public record PaymentResponse(
        boolean success,
        String transactionId,
        String status,
        String failureReason
    ) {}

    public record RefundRequest(
        @NotBlank String transactionId,
        @NotNull @Positive BigDecimal amount,
        String reason
    ) {}

    public record RefundResponse(
        boolean success,
        String refundId,
        String status
    ) {}
}
