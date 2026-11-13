package com.company.customs.controller;

import com.company.customs.domain.CustomsDutyAssessment;
import com.company.customs.dto.CalculateCustomsRequest;
import com.company.customs.service.CustomsTaxDutyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customs")
@RequiredArgsConstructor
@Tag(name = "Cross-Border Customs & DDP Tax Engine", description = "$75 USD exemption, 18% VAT calculation & smart parcel split")
public class CustomsTaxDutyController {

    private final CustomsTaxDutyService customsService;

    @GetMapping
    @Operation(summary = "List all cross-border customs & DDP tax assessments")
    public ResponseEntity<List<CustomsDutyAssessment>> getAllAssessments() {
        return ResponseEntity.ok(customsService.getAllAssessments());
    }

    @PostMapping("/calculate")
    @Operation(summary = "Calculate Landed Cost (DDP), VAT and smart parcel split savings")
    public ResponseEntity<CustomsDutyAssessment> calculateDuty(@Valid @RequestBody CalculateCustomsRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customsService.calculateDuty(request));
    }
}
