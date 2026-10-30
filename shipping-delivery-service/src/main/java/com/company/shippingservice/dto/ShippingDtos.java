package com.company.shippingservice.dto;

import com.company.shippingservice.domain.entity.ShipmentTimelineEntry;
import com.company.shippingservice.domain.enums.ShipmentStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class ShippingDtos {

    public record ShipmentResponse(
            UUID shipmentId,
            UUID orderId,
            String customerId,
            String trackingNumber,
            String carrier,
            String destinationAddress,
            ShipmentStatus status,
            Instant estimatedDeliveryDate,
            List<ShipmentTimelineEntry> timeline,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public record AdvanceStatusRequest(
            ShipmentStatus nextStatus,
            String location,
            String note
    ) {}
}
