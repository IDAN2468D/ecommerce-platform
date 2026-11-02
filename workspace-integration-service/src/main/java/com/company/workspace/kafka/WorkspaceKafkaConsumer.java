package com.company.workspace.kafka;

import com.company.common.events.*;
import com.company.workspace.service.WorkspaceSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@KafkaListener(topics = {"payment-events", "shipping-events"}, groupId = "workspace-integration-service-group")
public class WorkspaceKafkaConsumer {

    private static final String CONSUMER_GROUP = "workspace-integration-service-group";
    private final WorkspaceSyncService syncService;
    private final InboxIdempotencyTracker inboxTracker = new InboxIdempotencyTracker(CONSUMER_GROUP);

    @KafkaHandler
    public void handlePaymentCaptured(
            PaymentCapturedEvent event,
            @Header(name = EventIdempotencyKeyResolver.HEADER_EVENT_ID, required = false) String eventIdHeader) {
        if (!inboxTracker.tryAcquire(event, eventIdHeader, null)) {
            log.info("Inbox Idempotency: Skipping duplicate PaymentCapturedEvent in Workspace consumer for orderId={}", event.orderId());
            return;
        }
        log.info("Workspace service consumed PaymentCapturedEvent: orderId={}, txId={}", event.orderId(), event.transactionId());
        if (event.orderId() != null) {
            syncService.archiveInvoice(event.orderId(), event.customerId());
        } else {
            log.warn("PaymentCapturedEvent had no orderId, skipping Google Drive invoice archival.");
        }
    }

    @KafkaHandler
    public void handleShipmentScheduled(
            ShipmentScheduledEvent event,
            @Header(name = EventIdempotencyKeyResolver.HEADER_EVENT_ID, required = false) String eventIdHeader) {
        if (!inboxTracker.tryAcquire(event, eventIdHeader, null)) {
            log.info("Inbox Idempotency: Skipping duplicate ShipmentScheduledEvent in Workspace consumer for orderId={}", event.orderId());
            return;
        }
        log.info("Workspace service consumed ShipmentScheduledEvent: orderId={}, tracking={}", event.orderId(), event.trackingNumber());
        if (event.orderId() != null) {
            syncService.scheduleDelivery(event);
        }
    }

    @KafkaHandler
    public void handleShipmentCancelled(
            ShipmentCancelledEvent event,
            @Header(name = EventIdempotencyKeyResolver.HEADER_EVENT_ID, required = false) String eventIdHeader) {
        if (!inboxTracker.tryAcquire(event, eventIdHeader, null)) {
            log.info("Inbox Idempotency: Skipping duplicate ShipmentCancelledEvent in Workspace consumer for orderId={}", event.orderId());
            return;
        }
        log.info("Workspace service consumed ShipmentCancelledEvent: orderId={}. Initiating SAGA Calendar compensation.", event.orderId());
        if (event.orderId() != null) {
            syncService.cancelDelivery(event);
        }
    }

    @KafkaHandler(isDefault = true)
    public void handleDefault(Object event) {
        log.debug("Workspace integration service ignored unrelated event: {}", event != null ? event.getClass().getSimpleName() : "null");
    }
}
