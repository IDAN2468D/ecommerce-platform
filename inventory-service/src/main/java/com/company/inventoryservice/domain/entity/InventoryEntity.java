package com.company.inventoryservice.domain.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Document(collection = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryEntity {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Indexed(unique = true)
    private String skuCode;

    private String productName;

    private Integer availableQuantity;

    @Builder.Default
    private Integer reservedQuantity = 0;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal unitPrice;

    private String description;

    @Indexed
    private String category;

    private String imageUrl;

    @Builder.Default
    private Instant updatedAt = Instant.now();

    @Version
    private Long version;
}
