package com.company.dynamicpricingservice.controller;

import com.company.dynamicpricingservice.dto.PricingDtos.*;
import com.company.dynamicpricingservice.service.DynamicPricingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pricing")
@RequiredArgsConstructor
@Tag(name = "Dynamic Pricing & Auto-Buy API", description = "Endpoints for 30-day price history, bundle synergy discounts, and autonomous Auto-Buy rules")
public class DynamicPricingController {

    private final DynamicPricingService pricingService;

    @GetMapping("/history/{skuCode}")
    @Operation(summary = "Get 30-day rolling price history ledger, low/high, and elasticity forecast")
    public ResponseEntity<PriceHistoryResponse> getPriceHistory(@PathVariable String skuCode) {
        return ResponseEntity.ok(pricingService.getPriceHistory(skuCode));
    }

    @PostMapping("/autobuy")
    @Operation(summary = "Register an autonomous Auto-Buy mandate or price-drop alert rule")
    public ResponseEntity<AutoBuyRuleResponse> createAutoBuyRule(@Valid @RequestBody CreateAutoBuyRuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pricingService.createAutoBuyRule(request));
    }

    @GetMapping("/autobuy/customer/{customerId}")
    @Operation(summary = "List all active Auto-Buy rules for a specific customer")
    public ResponseEntity<List<AutoBuyRuleResponse>> getCustomerRules(@PathVariable String customerId) {
        return ResponseEntity.ok(pricingService.getCustomerRules(customerId));
    }

    @PostMapping("/bundles/calculate")
    @Operation(summary = "Calculate bundle compatibility score and multi-tier bundle synergy discount")
    public ResponseEntity<BundleQuoteResponse> calculateBundle(@Valid @RequestBody BundleCalculationRequest request) {
        return ResponseEntity.ok(pricingService.calculateBundle(request));
    }
}
