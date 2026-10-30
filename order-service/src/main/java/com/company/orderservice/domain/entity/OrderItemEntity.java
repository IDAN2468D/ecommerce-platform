package com.company.orderservice.domain.entity;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Embedded sub-document inside OrderEntity.items following /mongodb-schema-design.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class OrderItemEntity {

    @Builder.Default
    private UUID id = UUID.randomUUID();

    private String skuCode;

    private Integer quantity;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal unitPrice;
}
