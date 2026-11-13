package com.company.sustainability.controller;

import com.company.sustainability.domain.CarbonFootprintAssessment;
import com.company.sustainability.dto.AssessSustainabilityRequest;
import com.company.sustainability.service.CarbonSustainabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sustainability")
@RequiredArgsConstructor
@Tag(name = "Green Logistics & Carbon Footprint Engine", description = "CO2e emissions tracking, Eco-Score A+ grading & VIP Eco-Points rewards")
public class CarbonSustainabilityController {

    private final CarbonSustainabilityService sustainabilityService;

    @GetMapping
    @Operation(summary = "List all carbon footprint & green logistics certificates")
    public ResponseEntity<List<CarbonFootprintAssessment>> getAllAssessments() {
        return ResponseEntity.ok(sustainabilityService.getAllAssessments());
    }

    @PostMapping("/assess")
    @Operation(summary = "Assess CO2e footprint and award VIP Eco-Points for consolidated green shipping")
    public ResponseEntity<CarbonFootprintAssessment> assessFootprint(@Valid @RequestBody AssessSustainabilityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sustainabilityService.assessFootprint(request));
    }
}
