package com.company.cartwishlistservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class CartDtos {

    public record CartItemDto(
            String skuCode,
            String productName,
            int quantity,
            BigDecimal unitPrice,
            BigDecimal lineTotal,
            String imageUrl
    ) implements Serializable {}

    public record CartResponse(
            String customerId,
            List<CartItemDto> items,
            int totalItems,
            BigDecimal subtotalAmount,
            String currency,
            Instant updatedAt
    ) implements Serializable {}

    public record UpdateCartItemRequest(
            @NotBlank String skuCode,
            String productName,
            @NotNull @Min(1) Integer quantity,
            @NotNull @Positive BigDecimal unitPrice,
            String imageUrl
    ) {}

    public record MergeCartRequest(
            List<UpdateCartItemRequest> items
    ) {}

    public record WishlistItemDto(
            String skuCode,
            String productName,
            BigDecimal unitPrice,
            String imageUrl,
            Instant addedAt
    ) implements Serializable {}

    public record WishlistResponse(
            String customerId,
            List<WishlistItemDto> items,
            int totalItems
    ) implements Serializable {}

    public record AddToWishlistRequest(
            @NotBlank String skuCode,
            String productName,
            BigDecimal unitPrice,
            String imageUrl
    ) {}
}
