package com.company.inventoryservice.controller;

import com.company.inventoryservice.dto.InventoryDtos.InventoryReleaseRequest;
import com.company.inventoryservice.dto.InventoryDtos.ReservationResponse;
import com.company.inventoryservice.dto.InventoryDtos.StockCheckItem;
import com.company.inventoryservice.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/internal/v1/inventory")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Internal Inventory", description = "Internal Declarative Endpoints used by Order Service")
public class InventoryInternalController {

    private final InventoryService inventoryService;

    @PostMapping("/reserve")
    @Operation(summary = "Reserve stock items for pending order")
    public ResponseEntity<ReservationResponse> reserveStock(@RequestBody List<StockCheckItem> items) {
        ReservationResponse response = inventoryService.reserveStock(items);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/release")
    @Operation(summary = "Release reserved stock (SAGA compensating action)")
    public ResponseEntity<Void> releaseStock(@RequestBody InventoryReleaseRequest request) {
        inventoryService.releaseStock(request);
        return ResponseEntity.ok().build();
    }
}
