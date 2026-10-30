package com.company.orderservice.domain.entity;

import com.company.orderservice.domain.enums.CouponType;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Document(collection = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class CouponEntity {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Indexed(unique = true)
    private String code;

    private CouponType discountType;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal discountValue;

    @Field(targetType = FieldType.DECIMAL128)
    @Builder.Default
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal maxDiscountCap;

    @Builder.Default
    private Integer maxUses = 1000;

    @Builder.Default
    private Integer currentUses = 0;

    @Builder.Default
    private Instant validFrom = Instant.now();

    private Instant validUntil;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
