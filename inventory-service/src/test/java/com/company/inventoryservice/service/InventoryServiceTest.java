package com.company.inventoryservice.service;

import com.company.inventoryservice.domain.entity.InventoryEntity;
import com.company.inventoryservice.dto.InventoryDtos.InventoryItemResponse;
import com.company.inventoryservice.dto.InventoryDtos.InventoryReleaseRequest;
import com.company.inventoryservice.dto.InventoryDtos.ReservationResponse;
import com.company.inventoryservice.dto.InventoryDtos.StockCheckItem;
import com.company.inventoryservice.repository.InventoryRepository;
import com.company.inventoryservice.repository.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate;

    private InventoryService inventoryService;

    @BeforeEach
    void setUp() {
        inventoryService = new InventoryService(inventoryRepository, reservationRepository, kafkaTemplate);
    }

    @Test
    @DisplayName("Reserve stock successfully when stock is available")
    void reserveStock_Success() {
        InventoryEntity item = InventoryEntity.builder()
                .id(UUID.randomUUID())
                .skuCode("IPHONE-16")
                .productName("iPhone 16")
                .availableQuantity(10)
                .reservedQuantity(0)
                .unitPrice(new BigDecimal("4000.00"))
                .build();

        when(inventoryRepository.findBySkuCodeForUpdate("IPHONE-16")).thenReturn(Optional.of(item));

        ReservationResponse response = inventoryService.reserveStock(
                List.of(new StockCheckItem("IPHONE-16", 2))
        );

        assertThat(response.available()).isTrue();
        assertThat(response.reservationId()).isNotNull();
        assertThat(item.getAvailableQuantity()).isEqualTo(8);
        assertThat(item.getReservedQuantity()).isEqualTo(2);

        verify(reservationRepository, times(1)).save(any());
        verify(inventoryRepository, times(1)).save(item);
    }

    @Test
    @DisplayName("Reserve stock fails when quantity requested exceeds available quantity")
    void reserveStock_InsufficientQuantity() {
        InventoryEntity item = InventoryEntity.builder()
                .skuCode("IPHONE-16")
                .availableQuantity(1)
                .reservedQuantity(0)
                .build();

        when(inventoryRepository.findBySkuCodeForUpdate("IPHONE-16")).thenReturn(Optional.of(item));

        ReservationResponse response = inventoryService.reserveStock(
                List.of(new StockCheckItem("IPHONE-16", 5))
        );

        assertThat(response.available()).isFalse();
        assertThat(response.failureReason()).contains("out of stock");
        verify(reservationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Release stock successfully restores available stock")
    void releaseStock_Success() {
        InventoryReleaseRequest request = new InventoryReleaseRequest(
                null,
                List.of(new StockCheckItem("IPHONE-16", 2))
        );

        InventoryEntity item = InventoryEntity.builder()
                .skuCode("IPHONE-16")
                .availableQuantity(8)
                .reservedQuantity(2)
                .build();

        when(inventoryRepository.findBySkuCodeForUpdate("IPHONE-16")).thenReturn(Optional.of(item));

        inventoryService.releaseStock(request);

        assertThat(item.getAvailableQuantity()).isEqualTo(10);
        assertThat(item.getReservedQuantity()).isEqualTo(0);
        verify(inventoryRepository, times(1)).save(item);
    }

    @Test
    @DisplayName("Get all products returns mapped catalog with real images and details")
    void getAllProducts_Success() {
        InventoryEntity item = InventoryEntity.builder()
                .id(UUID.randomUUID())
                .skuCode("IPHONE-16-PRO-256")
                .productName("Apple iPhone 16 Pro 256GB")
                .availableQuantity(50)
                .reservedQuantity(0)
                .unitPrice(new BigDecimal("4899.00"))
                .description("A18 Pro")
                .category("סמארטפונים")
                .imageUrl("https://images.unsplash.com/photo-iphone")
                .build();

        when(inventoryRepository.findAllByOrderByProductNameAsc()).thenReturn(List.of(item));

        List<InventoryItemResponse> products = inventoryService.getAllProductsCatalog(null).products();

        assertThat(products).hasSize(1);
        assertThat(products.get(0).skuCode()).isEqualTo("IPHONE-16-PRO-256");
        assertThat(products.get(0).category()).isEqualTo("סמארטפונים");
        assertThat(products.get(0).imageUrl()).isEqualTo("https://images.unsplash.com/photo-iphone");
    }
}
