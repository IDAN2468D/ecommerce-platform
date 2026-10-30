package com.company.paymentservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public class PaymentDtos {

    public record PaymentRequest(
        UUID orderId,
        @NotBlank String customerId,
        @NotNull @Positive BigDecimal amount,
        @NotBlank @Size(min = 3, max = 3) String currency,
        @NotBlank String paymentMethodToken,
        @NotBlank String idempotencyKey
    ) {
        public PaymentRequest(String customerId, BigDecimal amount, String currency, String paymentMethodToken, String idempotencyKey) {
            this(null, customerId, amount, currency, paymentMethodToken, idempotencyKey);
        }
    }

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
