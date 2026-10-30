package com.company.inventoryservice.controller;

import com.company.inventoryservice.dto.InventoryDtos.CreateInventoryItemRequest;
import com.company.inventoryservice.dto.InventoryDtos.InventoryItemResponse;
import com.company.inventoryservice.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/inventory", "/api/v1/products"})
@RequiredArgsConstructor
@Tag(name = "Products & Inventory", description = "Query product catalog, real images, stock, and manage items")
public class InventoryApiController {

    private final InventoryService inventoryService;

    @GetMapping
    @Operation(summary = "Get all products catalog with real images and details")
    public ResponseEntity<List<InventoryItemResponse>> getAllProducts(
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(inventoryService.getAllProductsCatalog(category).products());
    }

    @GetMapping("/{skuCode}")
    @Operation(summary = "Get inventory stock & product details by SKU")
    public ResponseEntity<InventoryItemResponse> getStock(@PathVariable String skuCode) {
        return inventoryService.getStock(skuCode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Add or restock inventory item / product")
    public ResponseEntity<InventoryItemResponse> addStock(@Valid @RequestBody CreateInventoryItemRequest request) {
        InventoryItemResponse created = inventoryService.addOrUpdateStock(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
