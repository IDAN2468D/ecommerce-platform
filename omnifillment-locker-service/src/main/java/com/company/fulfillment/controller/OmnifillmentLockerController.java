package com.company.fulfillment.controller;

import com.company.fulfillment.domain.SmartLockerReservation;
import com.company.fulfillment.dto.ReserveLockerRequest;
import com.company.fulfillment.service.OmnifillmentLockerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fulfillment")
@RequiredArgsConstructor
@Tag(name = "Omnichannel Smart Lockers & Multi-Warehouse OMS", description = "45-minute Click & Collect, 24/7 OTP Smart Lockers & Eilat 0% VAT routing")
public class OmnifillmentLockerController {

    private final OmnifillmentLockerService lockerService;

    @GetMapping
    @Operation(summary = "List all active 24/7 Smart Locker & Click-and-Collect reservations")
    public ResponseEntity<List<SmartLockerReservation>> getAllReservations() {
        return ResponseEntity.ok(lockerService.getAllReservations());
    }

    @PostMapping("/reserve-locker")
    @Operation(summary = "Reserve a 24/7 Smart Locker compartment with instant OTP unlock code")
    public ResponseEntity<SmartLockerReservation> reserveLocker(@Valid @RequestBody ReserveLockerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lockerService.reserveLocker(request));
    }
}
