package com.company.paymentservice.domain.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Document(collection = "payment_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransactionEntity {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Indexed
    private UUID orderId;

    @Indexed(unique = true)
    private String idempotencyKey;

    @Indexed
    private String customerId;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal amount;

    private String currency;

    private String status; // SUCCEEDED, DECLINED, REFUNDED

    private String gatewayTransactionId;

    private String paymentMethodToken;

    private String failureReason;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();
}
