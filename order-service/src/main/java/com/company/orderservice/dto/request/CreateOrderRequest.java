package com.company.orderservice.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record CreateOrderRequest(
    @NotBlank(message = "Currency is required and must be 3 characters")
    @Size(min = 3, max = 3, message = "Currency must be a 3-letter ISO code")
    String currency,

    @NotBlank(message = "Payment method token is required")
    String paymentMethodToken,

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    List<OrderItemRequest> items,

    String couponCode
) {
    public CreateOrderRequest(String currency, String paymentMethodToken, List<OrderItemRequest> items) {
        this(currency, paymentMethodToken, items, null);
    }

    public record OrderItemRequest(
        @NotBlank(message = "SKU code cannot be blank")
        String skuCode,

        @Min(value = 1, message = "Quantity must be at least 1")
        int quantity,

        @NotNull(message = "Unit price cannot be null")
        @Positive(message = "Unit price must be positive")
        BigDecimal unitPrice
    ) {}
}
