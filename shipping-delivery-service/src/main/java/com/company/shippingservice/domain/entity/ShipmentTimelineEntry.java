package com.company.shippingservice.domain.entity;

import com.company.shippingservice.domain.enums.ShipmentStatus;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentTimelineEntry {
    private ShipmentStatus status;
    private String title;
    private String description;
    private String location;
    @Builder.Default
    private Instant timestamp = Instant.now();
}
