package com.company.cartwishlistservice.domain.model;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItem implements Serializable {
    private String skuCode;
    private String productName;
    private BigDecimal unitPrice;
    private String imageUrl;
    @Builder.Default
    private Instant addedAt = Instant.now();
}
