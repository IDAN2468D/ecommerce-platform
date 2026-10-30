package com.company.cartwishlistservice.controller;

import com.company.cartwishlistservice.dto.CartDtos.*;
import com.company.cartwishlistservice.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Wishlist", description = "Customer Wishlist Cloud Management")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @Operation(summary = "Get user wishlist")
    public ResponseEntity<WishlistResponse> getWishlist(
            @RequestHeader(value = "X-Customer-Id", required = false, defaultValue = "usr_demo") String customerId) {
        return ResponseEntity.ok(wishlistService.getWishlist(customerId));
    }

    @PostMapping("/{skuCode}")
    @Operation(summary = "Add item to wishlist by SKU code")
    public ResponseEntity<WishlistResponse> addToWishlist(
            @RequestHeader(value = "X-Customer-Id", required = false, defaultValue = "usr_demo") String customerId,
            @PathVariable String skuCode,
            @RequestBody(required = false) AddToWishlistRequest body) {
        AddToWishlistRequest request = body != null ? body : new AddToWishlistRequest(skuCode, skuCode, null, null);
        return ResponseEntity.ok(wishlistService.addToWishlist(customerId, request));
    }

    @DeleteMapping("/{skuCode}")
    @Operation(summary = "Remove item from wishlist")
    public ResponseEntity<WishlistResponse> removeFromWishlist(
            @RequestHeader(value = "X-Customer-Id", required = false, defaultValue = "usr_demo") String customerId,
            @PathVariable String skuCode) {
        return ResponseEntity.ok(wishlistService.removeFromWishlist(customerId, skuCode));
    }
}
