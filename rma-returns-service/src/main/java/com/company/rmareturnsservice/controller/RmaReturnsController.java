package com.company.rmareturnsservice.controller;

import com.company.rmareturnsservice.dto.RmaDtos.*;
import com.company.rmareturnsservice.service.RmaReturnsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/returns")
@RequiredArgsConstructor
@Tag(name = "Autonomous RMA & Reverse Logistics API", description = "Endpoints for return eligibility evaluation, Gemini Vision inspection, and instant VIP store credit")
public class RmaReturnsController {

    private final RmaReturnsService rmaService;

    @PostMapping("/evaluate")
    @Operation(summary = "Evaluate return eligibility and compare refund vs. +10% VIP Instant Credit")
    public ResponseEntity<ReturnEligibilityResponse> evaluateReturn(@Valid @RequestBody EvaluateReturnRequest request) {
        return ResponseEntity.ok(rmaService.evaluateReturn(request));
    }

    @PostMapping
    @Operation(summary = "Submit an RMA return/exchange request with Gemini Vision defect photo & initiate SAGA")
    public ResponseEntity<ReturnRequestResponse> createReturn(@Valid @RequestBody CreateReturnRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rmaService.createReturn(request));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "List all RMA requests and return statuses for a specific customer")
    public ResponseEntity<List<ReturnRequestResponse>> getCustomerReturns(@PathVariable String customerId) {
        return ResponseEntity.ok(rmaService.getCustomerReturns(customerId));
    }

    @GetMapping("/{rmaNumber}")
    @Operation(summary = "Retrieve live status, DHL return label tracking, and Google Calendar appointment for an RMA")
    public ResponseEntity<ReturnRequestResponse> getByRmaNumber(@PathVariable String rmaNumber) {
        return ResponseEntity.ok(rmaService.getByRmaNumber(rmaNumber));
    }
}
