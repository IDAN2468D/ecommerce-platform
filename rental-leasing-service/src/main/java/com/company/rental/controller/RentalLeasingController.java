package com.company.rental.controller;

import com.company.rental.domain.EquipmentRentalContract;
import com.company.rental.dto.CreateRentalRequest;
import com.company.rental.service.RentalLeasingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rentals")
@RequiredArgsConstructor
@Tag(name = "Equipment Rental & Rent-to-Own", description = "Try-Before-You-Buy flexible leasing with 85% buyout credit")
public class RentalLeasingController {

    private final RentalLeasingService rentalService;

    @GetMapping
    @Operation(summary = "List all active equipment rental & Rent-to-Own contracts")
    public ResponseEntity<List<EquipmentRentalContract>> getAllContracts() {
        return ResponseEntity.ok(rentalService.getAllContracts());
    }

    @PostMapping
    @Operation(summary = "Create a new Try-Before-You-Buy or Rent-to-Own contract")
    public ResponseEntity<EquipmentRentalContract> createContract(@Valid @RequestBody CreateRentalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rentalService.createRentalContract(request));
    }
}
