package com.company.inventoryservice.domain.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.UUID;

@Document(collection = "inventory_reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryReservationEntity {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Indexed
    private String reservationId;

    @Indexed
    private String skuCode;

    private Integer quantity;

    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, RELEASED, COMMITTED

    @Builder.Default
    private Instant createdAt = Instant.now();
}
