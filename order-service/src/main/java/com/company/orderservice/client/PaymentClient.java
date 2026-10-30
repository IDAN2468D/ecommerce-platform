package com.company.orderservice.client;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PostExchange;

import java.math.BigDecimal;

@HttpExchange("/internal/v1/payments")
public interface PaymentClient {

    @PostExchange("/charge")
    PaymentResponse processPayment(@RequestBody PaymentRequest request);

    @PostExchange("/refund")
    RefundResponse refundPayment(@RequestBody RefundRequest request);

    record PaymentRequest(
        String customerId,
        BigDecimal amount,
        String currency,
        String paymentMethodToken,
        String idempotencyKey
    ) {}

    record PaymentResponse(
        boolean success,
        String transactionId,
        String status,
        String failureReason
    ) {}

    record RefundRequest(
        String transactionId,
        BigDecimal amount,
        String reason
    ) {}

    record RefundResponse(
        boolean success,
        String refundId,
        String status
    ) {}
}
