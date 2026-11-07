package com.company.warranty.controller;

import com.company.warranty.domain.DigitalWarrantyCertificate;
import com.company.warranty.dto.WarrantyClaimRequest;
import com.company.warranty.service.WarrantyEscrowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/warranties")
@RequiredArgsConstructor
@Tag(name = "Digital Warranty & Smart Escrow", description = "SHA-256 Digital Warranty Certificates, Smart Vendor Escrow release, and Warranty Claims")
public class WarrantyEscrowController {

    private final WarrantyEscrowService warrantyEscrowService;

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get all cryptographic digital warranty certificates and escrow statuses for a customer")
    public ResponseEntity<List<DigitalWarrantyCertificate>> getCustomerWarranties(@PathVariable String customerId) {
        return ResponseEntity.ok(warrantyEscrowService.getCustomerWarranties(customerId));
    }

    @PostMapping("/{id}/release-escrow")
    @Operation(summary = "Confirm delivery satisfaction and release held escrow funds to merchant vendor")
    public ResponseEntity<DigitalWarrantyCertificate> releaseEscrow(@PathVariable String id) {
        return ResponseEntity.ok(warrantyEscrowService.releaseEscrowToVendor(id));
    }

    @PostMapping("/{id}/claim")
    @Operation(summary = "Submit an official warranty repair or replacement claim")
    public ResponseEntity<DigitalWarrantyCertificate> submitClaim(
            @PathVariable String id,
            @Valid @RequestBody WarrantyClaimRequest request) {
        return ResponseEntity.ok(warrantyEscrowService.submitWarrantyClaim(id, request));
    }
}
