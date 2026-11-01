package com.company.ragservice.dto;

import java.util.List;

public record VectorSyncRequest(
        List<ProductSyncItem> products,
        Boolean wipeExisting
) {
    public record ProductSyncItem(
            String skuCode,
            String name,
            String description,
            String category,
            Double price,
            Boolean inStock,
            Double rating
    ) {}
}
