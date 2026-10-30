package com.company.orderservice.dto.response;

import com.company.orderservice.domain.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
    UUID orderId,
    String customerId,
    OrderStatus status,
    BigDecimal totalAmount,
    String currency,
    String paymentTransactionId,
    Instant createdAt,
    Instant updatedAt,
    List<OrderItemResponse> items,
    String couponCode,
    BigDecimal discountAmount
) {
    public OrderResponse(
            UUID orderId,
            String customerId,
            OrderStatus status,
            BigDecimal totalAmount,
            String currency,
            String paymentTransactionId,
            Instant createdAt,
            Instant updatedAt,
            List<OrderItemResponse> items
    ) {
        this(orderId, customerId, status, totalAmount, currency, paymentTransactionId, createdAt, updatedAt, items, null, BigDecimal.ZERO);
    }

    public record OrderItemResponse(
        UUID id,
        String skuCode,
        int quantity,
        BigDecimal unitPrice
    ) {}
}
