package com.company.cartwishlistservice.controller;

import com.company.cartwishlistservice.dto.CartDtos.*;
import com.company.cartwishlistservice.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Shopping Cart", description = "Sub-2ms Redis Hash Shopping Cart Management")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get current shopping cart for customer (Redis sub-2ms)")
    public ResponseEntity<CartResponse> getCart(
            @RequestHeader(value = "X-Customer-Id", required = false, defaultValue = "usr_demo") String customerId) {
        return ResponseEntity.ok(cartService.getCart(customerId));
    }

    @PutMapping("/items")
    @Operation(summary = "Add or update item quantity in cart")
    public ResponseEntity<CartResponse> updateItem(
            @RequestHeader(value = "X-Customer-Id", required = false, defaultValue = "usr_demo") String customerId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(cartService.upsertItem(customerId, request));
    }

    @DeleteMapping("/items/{skuCode}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<CartResponse> removeItem(
            @RequestHeader(value = "X-Customer-Id", required = false, defaultValue = "usr_demo") String customerId,
            @PathVariable String skuCode) {
        return ResponseEntity.ok(cartService.removeItem(customerId, skuCode));
    }

    @DeleteMapping
    @Operation(summary = "Clear all items from cart")
    public ResponseEntity<Void> clearCart(
            @RequestHeader(value = "X-Customer-Id", required = false, defaultValue = "usr_demo") String customerId) {
        cartService.clearCart(customerId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/merge")
    @Operation(summary = "Merge guest cart into logged-in user cart")
    public ResponseEntity<CartResponse> mergeCart(
            @RequestHeader(value = "X-Customer-Id", required = false, defaultValue = "usr_demo") String customerId,
            @RequestBody MergeCartRequest request) {
        return ResponseEntity.ok(cartService.mergeGuestCart(customerId, request));
    }
}
