package com.company.bnpl.controller;

import com.company.bnpl.domain.BnplInstallmentPlan;
import com.company.bnpl.dto.CreateBnplPlanRequest;
import com.company.bnpl.service.BnplCreditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/bnpl")
@RequiredArgsConstructor
@Tag(name = "BNPL & Split Credit", description = "Instant 0% APR Buy-Now-Pay-Later credit underwriting and installment plans")
public class BnplCreditController {

    private final BnplCreditService bnplCreditService;

    @GetMapping("/eligibility/{customerId}")
    @Operation(summary = "Evaluate instant BNPL credit line and 0% APR eligibility")
    public ResponseEntity<Map<String, Object>> getEligibility(@PathVariable String customerId) {
        return ResponseEntity.ok(bnplCreditService.evaluateCreditLine(customerId));
    }

    @GetMapping("/plans/{customerId}")
    @Operation(summary = "Get all BNPL installment plans for a customer")
    public ResponseEntity<List<BnplInstallmentPlan>> getCustomerPlans(@PathVariable String customerId) {
        return ResponseEntity.ok(bnplCreditService.getCustomerPlans(customerId));
    }

    @PostMapping("/plans")
    @Operation(summary = "Create a new 4-installment 0% APR BNPL plan")
    public ResponseEntity<BnplInstallmentPlan> createPlan(@Valid @RequestBody CreateBnplPlanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bnplCreditService.createPlan(request));
    }

    @PostMapping("/plans/{planId}/pay-next")
    @Operation(summary = "Pay the next scheduled installment tranche early")
    public ResponseEntity<BnplInstallmentPlan> payNextInstallment(@PathVariable String planId) {
        return ResponseEntity.ok(bnplCreditService.payNextInstallment(planId));
    }
}
