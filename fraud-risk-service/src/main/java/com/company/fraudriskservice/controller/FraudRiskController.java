package com.company.fraudriskservice.controller;

import com.company.fraudriskservice.dto.FraudDtos.*;
import com.company.fraudriskservice.service.FraudRiskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/fraud")
@RequiredArgsConstructor
@Tag(name = "Fraud & Risk Guard API", description = "Endpoints for real-time SAGA pre-capture transaction risk scoring, velocity checks, and alerts")
public class FraudRiskController {

    private final FraudRiskService fraudService;

    @PostMapping("/assess")
    @Operation(summary = "Perform real-time synchronous fraud risk scoring for an order or cart before payment capture")
    public ResponseEntity<FraudAssessmentResponse> assessRisk(@Valid @RequestBody FraudAssessmentRequest request) {
        return ResponseEntity.ok(fraudService.assessRisk(request));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Fetch the recorded fraud assessment and signal breakdown for a specific order")
    public ResponseEntity<FraudAssessmentResponse> getAssessmentByOrderId(@PathVariable UUID orderId) {
        return ResponseEntity.ok(fraudService.getAssessmentByOrderId(orderId));
    }

    @GetMapping("/alerts/recent")
    @Operation(summary = "Return recent transaction assessments and security risk flags")
    public ResponseEntity<List<FraudAssessmentResponse>> getRecentAlerts() {
        return ResponseEntity.ok(fraudService.getRecentAlerts());
    }
}
