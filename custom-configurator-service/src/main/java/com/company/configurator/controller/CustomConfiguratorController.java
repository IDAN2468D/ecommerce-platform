package com.company.configurator.controller;

import com.company.configurator.domain.CustomRigBuild;
import com.company.configurator.dto.CreateCustomBuildRequest;
import com.company.configurator.service.CustomConfiguratorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/configurator")
@RequiredArgsConstructor
@Tag(name = "AI Custom Setup & Rig Configurator", description = "100% physical/power compatibility verification and multi-part rig discount")
public class CustomConfiguratorController {

    private final CustomConfiguratorService configuratorService;

    @GetMapping
    @Operation(summary = "List all verified custom rig & studio builds")
    public ResponseEntity<List<CustomRigBuild>> getAllBuilds() {
        return ResponseEntity.ok(configuratorService.getAllBuilds());
    }

    @PostMapping("/build")
    @Operation(summary = "Validate compatibility and build a custom multi-SKU setup")
    public ResponseEntity<CustomRigBuild> createBuild(@Valid @RequestBody CreateCustomBuildRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(configuratorService.createBuild(request));
    }
}
