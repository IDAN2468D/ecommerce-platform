package com.company.common.events;

import java.time.Instant;

public record ProductRatingUpdatedEvent(
        String skuCode,
        double averageRating,
        int reviewCount,
        Instant updatedAt
) {}
