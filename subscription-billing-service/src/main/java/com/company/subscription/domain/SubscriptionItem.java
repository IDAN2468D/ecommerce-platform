package com.company.subscription.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionItem {
    private String skuCode;
    private String productName;
    private BigDecimal baseUnitPrice;
    private BigDecimal discountedUnitPrice;
    private int quantity;
    private String imageUrl;
}
