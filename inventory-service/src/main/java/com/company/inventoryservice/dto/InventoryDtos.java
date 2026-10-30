package com.company.inventoryservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class InventoryDtos {

    public record StockCheckItem(
        @NotBlank String skuCode,
        @Min(1) int quantity
    ) {}

    public record ReservationResponse(
        boolean available,
        String reservationId,
        String failureReason
    ) {}

    public record InventoryReleaseRequest(
        String reservationId,
        List<StockCheckItem> items
    ) {}

    public record ProductCatalogResponse(
        List<InventoryItemResponse> products
    ) implements java.io.Serializable {}

    public record InventoryItemResponse(
        UUID id,
        String skuCode,
        String productName,
        int availableQuantity,
        int reservedQuantity,
        BigDecimal unitPrice,
        String description,
        String category,
        String imageUrl
    ) implements java.io.Serializable {
        public InventoryItemResponse(UUID id, String skuCode, String productName, int availableQuantity, int reservedQuantity, BigDecimal unitPrice) {
            this(id, skuCode, productName, availableQuantity, reservedQuantity, unitPrice, null, null, null);
        }
    }

    public record CreateInventoryItemRequest(
        @NotBlank String skuCode,
        @NotBlank String productName,
        @Min(0) int quantity,
        @NotNull @Positive BigDecimal unitPrice,
        String description,
        String category,
        String imageUrl
    ) {
        public CreateInventoryItemRequest(String skuCode, String productName, int quantity, BigDecimal unitPrice) {
            this(skuCode, productName, quantity, unitPrice, null, null, null);
        }
    }
}
