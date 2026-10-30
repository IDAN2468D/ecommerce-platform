package com.company.shippingservice.controller;

import com.company.shippingservice.domain.entity.ShipmentEntity;
import com.company.shippingservice.dto.ShippingDtos.AdvanceStatusRequest;
import com.company.shippingservice.dto.ShippingDtos.ShipmentResponse;
import com.company.shippingservice.service.ShippingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shipping")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Shipping & Delivery", description = "SAGA Step 5 Shipment Management & Tracking")
public class ShippingController {

    private final ShippingService shippingService;

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get shipment details and timeline by order ID")
    public ResponseEntity<ShipmentResponse> getShipmentByOrder(@PathVariable UUID orderId) {
        log.info("REST: Querying shipment for orderId: {}", orderId);
        ShipmentEntity shipment = shippingService.getByOrderId(orderId);
        return ResponseEntity.ok(shippingService.toResponse(shipment));
    }

    @GetMapping("/{shipmentId}")
    @Operation(summary = "Get shipment details and timeline by shipment ID")
    public ResponseEntity<ShipmentResponse> getShipmentById(@PathVariable UUID shipmentId) {
        log.info("REST: Querying shipment by id: {}", shipmentId);
        ShipmentEntity shipment = shippingService.getById(shipmentId);
        return ResponseEntity.ok(shippingService.toResponse(shipment));
    }

    @PostMapping("/{shipmentId}/advance-status")
    @Operation(summary = "Advance shipment status and trigger real-time notification events")
    public ResponseEntity<ShipmentResponse> advanceStatus(
            @PathVariable UUID shipmentId,
            @RequestBody(required = false) AdvanceStatusRequest request) {
        log.info("REST: Advancing shipment status for id: {}", shipmentId);
        ShipmentEntity updated = shippingService.advanceStatus(shipmentId, request);
        return ResponseEntity.ok(shippingService.toResponse(updated));
    }

    @PostMapping("/order/{orderId}/schedule")
    @Operation(summary = "Manually schedule shipment for an order")
    public ResponseEntity<ShipmentResponse> scheduleForOrder(
            @PathVariable UUID orderId,
            @RequestParam(required = false, defaultValue = "usr_demo") String customerId) {
        log.info("REST: Manually scheduling shipment for order: {}", orderId);
        ShipmentEntity shipment = shippingService.scheduleShipment(orderId, customerId);
        return ResponseEntity.ok(shippingService.toResponse(shipment));
    }
}
