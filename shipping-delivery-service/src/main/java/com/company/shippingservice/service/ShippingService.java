package com.company.shippingservice.service;

import com.company.common.events.OrderDispatchedEvent;
import com.company.common.events.ShipmentCancelledEvent;
import com.company.common.events.ShipmentScheduledEvent;
import com.company.shippingservice.domain.entity.ShipmentEntity;
import com.company.shippingservice.domain.enums.ShipmentStatus;
import com.company.shippingservice.dto.ShippingDtos.AdvanceStatusRequest;
import com.company.shippingservice.dto.ShippingDtos.ShipmentResponse;
import com.company.shippingservice.kafka.ShippingEventPublisher;
import com.company.shippingservice.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShippingService {

    private final ShipmentRepository shipmentRepository;
    private final ShippingEventPublisher eventPublisher;
    private final Random random = new Random();

    @Transactional
    public ShipmentEntity scheduleShipment(UUID orderId, String customerId) {
        log.info("Scheduling shipment for orderId: {}, customerId: {}", orderId, customerId);

        Optional<ShipmentEntity> existing = shipmentRepository.findByOrderId(orderId);
        if (existing.isPresent()) {
            log.info("Shipment already exists for orderId: {}", orderId);
            return existing.get();
        }

        String trackingNumber = "IL-EXP-" + (100000 + random.nextInt(900000));
        String carrier = "Israel Post Express";
        String destination = "שדרות רוטשילד 45, תל אביב, ישראל";
        Instant estimatedDelivery = Instant.now().plus(Duration.ofDays(3));

        ShipmentEntity shipment = ShipmentEntity.builder()
                .id(UUID.randomUUID())
                .orderId(orderId)
                .customerId(customerId != null ? customerId : "usr_demo")
                .trackingNumber(trackingNumber)
                .carrier(carrier)
                .destinationAddress(destination)
                .status(ShipmentStatus.SCHEDULED)
                .estimatedDeliveryDate(estimatedDelivery)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        shipment.addTimelineEntry(
                ShipmentStatus.SCHEDULED,
                "הזמנת שילוח נקלטה במערכת",
                "אישור תשלום SAGA התקבל בהצלחה. המשלוח הועבר למרכז הלוגיסטי להכנה.",
                "מרכז מיון ראשי - תל אביב"
        );

        ShipmentEntity saved = shipmentRepository.save(shipment);
        log.info("Shipment created with ID: {}, trackingNumber: {}", saved.getId(), saved.getTrackingNumber());

        eventPublisher.publishShipmentScheduled(new ShipmentScheduledEvent(
                saved.getId(),
                saved.getOrderId(),
                saved.getCustomerId(),
                saved.getTrackingNumber(),
                saved.getCarrier(),
                saved.getDestinationAddress(),
                saved.getEstimatedDeliveryDate(),
                saved.getCreatedAt()
        ));

        return saved;
    }

    @Transactional
    public ShipmentEntity advanceStatus(UUID shipmentId, AdvanceStatusRequest request) {
        log.info("Advancing status for shipmentId: {}", shipmentId);
        ShipmentEntity shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found: " + shipmentId));

        if (shipment.getStatus() == ShipmentStatus.CANCELLED || shipment.getStatus() == ShipmentStatus.DELIVERED) {
            log.warn("Cannot advance status of shipment {} in terminal state: {}", shipmentId, shipment.getStatus());
            return shipment;
        }

        ShipmentStatus nextStatus = (request != null && request.nextStatus() != null)
                ? request.nextStatus()
                : getNextSequentialStatus(shipment.getStatus());

        String location = (request != null && request.location() != null)
                ? request.location()
                : getDefaultLocationForStatus(nextStatus);

        String note = (request != null && request.note() != null)
                ? request.note()
                : getDefaultNoteForStatus(nextStatus);

        String title = getTitleForStatus(nextStatus);

        shipment.addTimelineEntry(nextStatus, title, note, location);
        ShipmentEntity updated = shipmentRepository.save(shipment);

        eventPublisher.publishOrderDispatched(new OrderDispatchedEvent(
                updated.getId(),
                updated.getOrderId(),
                updated.getCustomerId(),
                updated.getTrackingNumber(),
                updated.getCarrier(),
                nextStatus.name(),
                Instant.now()
        ));

        return updated;
    }

    @Transactional
    public void cancelShipmentForOrder(UUID orderId, String reason) {
        log.info("Processing compensating shipment cancellation for orderId: {}", orderId);
        Optional<ShipmentEntity> shipmentOpt = shipmentRepository.findByOrderId(orderId);
        if (shipmentOpt.isEmpty()) {
            log.info("No shipment found for orderId: {}, nothing to compensate", orderId);
            return;
        }

        ShipmentEntity shipment = shipmentOpt.get();
        if (shipment.getStatus() == ShipmentStatus.DELIVERED) {
            log.warn("Shipment {} already delivered, cannot cancel delivery", shipment.getId());
            return;
        }

        shipment.addTimelineEntry(
                ShipmentStatus.CANCELLED,
                "המשלוח בוטל",
                "בוצעה טרנזקציית פיצוי (SAGA Compensation) עקב ביטול הזמנה: " + (reason != null ? reason : "ביטול על ידי הלקוח"),
                "מרכז הפצה ארצי"
        );
        shipmentRepository.save(shipment);

        eventPublisher.publishShipmentCancelled(new ShipmentCancelledEvent(
                shipment.getId(),
                shipment.getOrderId(),
                shipment.getCustomerId(),
                shipment.getTrackingNumber(),
                reason,
                Instant.now()
        ));
    }

    public ShipmentResponse toResponse(ShipmentEntity entity) {
        return new ShipmentResponse(
                entity.getId(),
                entity.getOrderId(),
                entity.getCustomerId(),
                entity.getTrackingNumber(),
                entity.getCarrier(),
                entity.getDestinationAddress(),
                entity.getStatus(),
                entity.getEstimatedDeliveryDate(),
                entity.getTimeline(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public ShipmentEntity getByOrderId(UUID orderId) {
        return shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("No shipment found for order: " + orderId));
    }

    public ShipmentEntity getById(UUID shipmentId) {
        return shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new IllegalArgumentException("No shipment found with id: " + shipmentId));
    }

    private ShipmentStatus getNextSequentialStatus(ShipmentStatus current) {
        return switch (current) {
            case SCHEDULED -> ShipmentStatus.PACKING;
            case PACKING -> ShipmentStatus.IN_TRANSIT;
            case IN_TRANSIT -> ShipmentStatus.OUT_FOR_DELIVERY;
            case OUT_FOR_DELIVERY -> ShipmentStatus.DELIVERED;
            case DELIVERED, CANCELLED -> current;
        };
    }

    private String getTitleForStatus(ShipmentStatus status) {
        return switch (status) {
            case SCHEDULED -> "הזמנת שילוח נקלטה";
            case PACKING -> "החבילה נארזת במחסן";
            case IN_TRANSIT -> "החבילה בדרכה למרכז המיון";
            case OUT_FOR_DELIVERY -> "החבילה בידי השליח לחלוקה";
            case DELIVERED -> "החבילה נמסרה בהצלחה ליעד";
            case CANCELLED -> "המשלוח בוטל";
        };
    }

    private String getDefaultNoteForStatus(ShipmentStatus status) {
        return switch (status) {
            case SCHEDULED -> "פרטי המשלוח נקלטו בהצלחה במערכת.";
            case PACKING -> "הפריטים נאספו מהמדף ונארזו באריזה מאובטחת.";
            case IN_TRANSIT -> "המשלוח יצא מהמחסן המרכזי ונמצא במעבר ליעד.";
            case OUT_FOR_DELIVERY -> "שליח החברה יצא לאספקה בכתובת היעד בתיאום מראש.";
            case DELIVERED -> "המשלוח נמסר ללקוח ונחתם אישור מסירה דיגיטלי.";
            case CANCELLED -> "המשלוח בוטל וסומן כהחזרה למלאי.";
        };
    }

    private String getDefaultLocationForStatus(ShipmentStatus status) {
        return switch (status) {
            case SCHEDULED, PACKING -> "מחסן מרכזי - ראשון לציון";
            case IN_TRANSIT -> "מרכז מיון מחוזי - שפלה";
            case OUT_FOR_DELIVERY -> "רכב שליחויות אזור גוש דן";
            case DELIVERED -> "כתובת הלקוח - תל אביב";
            case CANCELLED -> "מרכז לוגיסטי";
        };
    }
}
