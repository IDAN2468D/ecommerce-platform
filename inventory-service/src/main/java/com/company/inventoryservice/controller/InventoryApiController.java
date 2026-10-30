package com.company.inventoryservice.controller;

import com.company.inventoryservice.dto.InventoryDtos;
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
    @Operation(summary = "Get all products catalog with real images, search, server-side filtering, and pagination")
    public ResponseEntity<Object> getAllProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) Boolean inStockOnly,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "12") int size) {

        // If advanced filtering or query is requested, use the search engine
        if (query != null || minPrice != null || maxPrice != null || inStockOnly != null || minRating != null || sort != null) {
            return ResponseEntity.ok(inventoryService.searchProducts(query, category, minPrice, maxPrice, inStockOnly, minRating, sort, page, size));
        }

        // Otherwise return standard catalog for backwards compatibility
        return ResponseEntity.ok(inventoryService.getAllProductsCatalog(category).products());
    }

    @GetMapping("/reservation/{reservationId}/ttl")
    @Operation(summary = "Check flash sale countdown timer and remaining reservation TTL")
    public ResponseEntity<InventoryDtos.StockReservationTtlResponse> getReservationTtl(
            @PathVariable String reservationId) {
        return ResponseEntity.ok(inventoryService.getReservationTtl(reservationId));
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
