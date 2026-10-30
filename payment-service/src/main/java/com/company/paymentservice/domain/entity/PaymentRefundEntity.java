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

@Document(collection = "payment_refunds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRefundEntity {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Indexed
    private UUID transactionId;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal refundAmount;

    private String reason;

    @Builder.Default
    private String refundStatus = "SUCCEEDED";

    @Builder.Default
    private Instant createdAt = Instant.now();
}
