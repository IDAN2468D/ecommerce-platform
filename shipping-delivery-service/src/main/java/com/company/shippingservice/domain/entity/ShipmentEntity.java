package com.company.shippingservice.domain.entity;

import com.company.shippingservice.domain.enums.ShipmentStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document(collection = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentEntity {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Indexed(unique = true)
    private UUID orderId;

    @Indexed
    private String customerId;

    @Indexed(unique = true)
    private String trackingNumber;

    private String carrier;

    private String destinationAddress;

    @Indexed
    @Builder.Default
    private ShipmentStatus status = ShipmentStatus.SCHEDULED;

    private Instant estimatedDeliveryDate;

    @Builder.Default
    private List<ShipmentTimelineEntry> timeline = new ArrayList<>();

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();

    public void addTimelineEntry(ShipmentStatus status, String title, String description, String location) {
        this.status = status;
        this.updatedAt = Instant.now();
        if (this.timeline == null) {
            this.timeline = new ArrayList<>();
        }
        this.timeline.add(ShipmentTimelineEntry.builder()
                .status(status)
                .title(title)
                .description(description)
                .location(location)
                .timestamp(Instant.now())
                .build());
    }
}
