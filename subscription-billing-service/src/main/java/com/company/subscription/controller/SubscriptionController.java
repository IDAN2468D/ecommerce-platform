package com.company.subscription.controller;

import com.company.subscription.dto.CreateSubscriptionRequest;
import com.company.subscription.dto.SubscriptionResponse;
import com.company.subscription.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
@Tag(name = "Subscription & Recurring Billing", description = "Endpoints for managing recurring subscriptions, auto-deliveries and billing cycles")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping
    @Operation(summary = "Create a new subscription plan with recurring discount")
    public ResponseEntity<SubscriptionResponse> createSubscription(@Valid @RequestBody CreateSubscriptionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subscriptionService.createSubscription(request));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get all subscriptions for a customer")
    public ResponseEntity<List<SubscriptionResponse>> getCustomerSubscriptions(@PathVariable String customerId) {
        return ResponseEntity.ok(subscriptionService.getCustomerSubscriptions(customerId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get subscription by ID")
    public ResponseEntity<SubscriptionResponse> getSubscriptionById(@PathVariable String id) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionById(id));
    }

    @PostMapping("/{id}/pause")
    @Operation(summary = "Pause an active subscription")
    public ResponseEntity<SubscriptionResponse> pauseSubscription(@PathVariable String id) {
        return ResponseEntity.ok(subscriptionService.pauseSubscription(id));
    }

    @PostMapping("/{id}/resume")
    @Operation(summary = "Resume a paused subscription")
    public ResponseEntity<SubscriptionResponse> resumeSubscription(@PathVariable String id) {
        return ResponseEntity.ok(subscriptionService.resumeSubscription(id));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an active or paused subscription")
    public ResponseEntity<SubscriptionResponse> cancelSubscription(@PathVariable String id) {
        return ResponseEntity.ok(subscriptionService.cancelSubscription(id));
    }

    @PostMapping("/{id}/renew")
    @Operation(summary = "Trigger immediate renewal cycle")
    public ResponseEntity<SubscriptionResponse> triggerRenewal(@PathVariable String id) {
        return ResponseEntity.ok(subscriptionService.triggerRenewal(id));
    }
}
