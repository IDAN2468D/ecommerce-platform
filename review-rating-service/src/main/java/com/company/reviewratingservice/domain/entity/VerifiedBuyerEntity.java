package com.company.reviewratingservice.domain.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.UUID;

@Document(collection = "verified_buyers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@CompoundIndex(name = "customer_sku_idx", def = "{'customerId': 1, 'skuCode': 1}", unique = false)
public class VerifiedBuyerEntity {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Indexed
    private String customerId;

    @Indexed
    private String skuCode;

    private UUID orderId;

    @Builder.Default
    private Instant verifiedAt = Instant.now();
}
