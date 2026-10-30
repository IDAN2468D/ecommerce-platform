package com.company.recommendationloyaltyservice.controller;

import com.company.recommendationloyaltyservice.domain.entity.LoyaltyWalletEntity;
import com.company.recommendationloyaltyservice.dto.LoyaltyDtos.*;
import com.company.recommendationloyaltyservice.service.LoyaltyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/loyalty")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "VIP Loyalty Club", description = "VIP Cashback Points Wallet & Rewards")
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    @GetMapping("/wallet")
    @Operation(summary = "Get user VIP loyalty wallet, points balance and tier")
    public ResponseEntity<LoyaltyWalletResponse> getWallet(
            @RequestHeader(value = "X-Customer-Id", required = false, defaultValue = "usr_demo") String customerId) {
        log.info("REST: Querying loyalty wallet for customer: {}", customerId);
        LoyaltyWalletEntity wallet = loyaltyService.getOrCreateWallet(customerId);
        return ResponseEntity.ok(loyaltyService.toResponse(wallet));
    }

    @PostMapping("/redeem")
    @Operation(summary = "Redeem loyalty points for shopping cart discount (1 pt = ₪1)")
    public ResponseEntity<RedeemPointsResponse> redeemPoints(
            @RequestHeader(value = "X-Customer-Id", required = false, defaultValue = "usr_demo") String customerId,
            @Valid @RequestBody RedeemPointsRequest request) {
        log.info("REST: Redeeming {} points for customer: {}", request.pointsToRedeem(), customerId);
        RedeemPointsResponse response = loyaltyService.redeemPoints(customerId, request.pointsToRedeem());
        return ResponseEntity.ok(response);
    }
}
