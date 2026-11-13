package com.company.installation.controller;

import com.company.installation.domain.FieldInstallationBooking;
import com.company.installation.dto.BookInstallationRequest;
import com.company.installation.service.FieldInstallationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/installations")
@RequiredArgsConstructor
@Tag(name = "Home Installation & Certified Technician Setup", description = "Synchronized delivery + home technician installation & calibration")
public class FieldInstallationController {

    private final FieldInstallationService installationService;

    @GetMapping
    @Operation(summary = "List all scheduled home technician installation bookings")
    public ResponseEntity<List<FieldInstallationBooking>> getAllBookings() {
        return ResponseEntity.ok(installationService.getAllBookings());
    }

    @PostMapping("/book")
    @Operation(summary = "Book a certified home installation technician synced with shipment arrival")
    public ResponseEntity<FieldInstallationBooking> bookInstallation(@Valid @RequestBody BookInstallationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(installationService.bookInstallation(request));
    }
}
