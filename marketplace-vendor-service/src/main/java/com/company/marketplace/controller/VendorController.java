package com.company.marketplace.controller;

import com.company.marketplace.domain.VendorCommission;
import com.company.marketplace.domain.VendorPayout;
import com.company.marketplace.dto.*;
import com.company.marketplace.service.VendorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/marketplace/vendors")
@RequiredArgsConstructor
@Tag(name = "Marketplace & Multi-Vendor", description = "Endpoints for vendor registration, store profiles, split payments and payout management")
public class VendorController {

    private final VendorService vendorService;

    @PostMapping
    @Operation(summary = "Register a new vendor store on the marketplace")
    public ResponseEntity<VendorResponse> registerVendor(@Valid @RequestBody RegisterVendorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vendorService.registerVendor(request));
    }

    @GetMapping
    @Operation(summary = "Get all active vendors in the marketplace")
    public ResponseEntity<List<VendorResponse>> getAllVendors() {
        return ResponseEntity.ok(vendorService.getAllVendors());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vendor by ID, code, or slug")
    public ResponseEntity<VendorResponse> getVendorById(@PathVariable String id) {
        return ResponseEntity.ok(vendorService.getVendorById(id));
    }

    @PostMapping("/sales/record")
    @Operation(summary = "Record vendor sale, calculate 10% platform fee and credit vendor net wallet balance")
    public ResponseEntity<VendorCommission> recordSale(@Valid @RequestBody RecordSaleRequest request) {
        return ResponseEntity.ok(vendorService.recordSale(request));
    }

    @PostMapping("/{id}/payouts")
    @Operation(summary = "Request merchant payout from vendor wallet balance")
    public ResponseEntity<VendorPayout> requestPayout(@PathVariable String id, @Valid @RequestBody VendorPayoutRequest request) {
        return ResponseEntity.ok(vendorService.requestPayout(id, request));
    }

    @GetMapping("/{id}/dashboard")
    @Operation(summary = "Get comprehensive vendor sales, commission and payout dashboard")
    public ResponseEntity<VendorDashboardSummary> getVendorDashboard(@PathVariable String id) {
        return ResponseEntity.ok(vendorService.getVendorDashboard(id));
    }
}
