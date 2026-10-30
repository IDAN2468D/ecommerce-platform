package com.company.orderservice.domain.entity;

import com.company.orderservice.domain.enums.OrderStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * MongoDB Document representing a customer Order.
 * Follows /mongodb-schema-design best practices: bounded order line items (OrderItemEntity)
 * are embedded directly inside the Order document for single-query atomic reads and writes.
 */
@Document(collection = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class OrderEntity {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Indexed
    private String customerId;

    @Indexed(unique = true)
    private String idempotencyKey;

    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal totalAmount;

    private String couponCode;

    @Field(targetType = FieldType.DECIMAL128)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Builder.Default
    private String currency = "ILS";

    private String paymentTransactionId;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();

    @Version
    private Long version;

    @Builder.Default
    private List<OrderItemEntity> items = new ArrayList<>();

    public void addItem(OrderItemEntity item) {
        if (item.getId() == null) {
            item.setId(UUID.randomUUID());
        }
        items.add(item);
    }

    public void removeItem(OrderItemEntity item) {
        items.remove(item);
    }
}
