package com.company.workspace.kafka;

import com.company.common.events.PaymentCapturedEvent;
import com.company.common.events.ShipmentCancelledEvent;
import com.company.common.events.ShipmentScheduledEvent;
import com.company.workspace.service.WorkspaceSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@KafkaListener(topics = {"payment-events", "shipping-events"}, groupId = "workspace-integration-service-group")
public class WorkspaceKafkaConsumer {

    private final WorkspaceSyncService syncService;

    @KafkaHandler
    public void handlePaymentCaptured(PaymentCapturedEvent event) {
        log.info("Workspace service consumed PaymentCapturedEvent: orderId={}, txId={}", event.orderId(), event.transactionId());
        if (event.orderId() != null) {
            syncService.archiveInvoice(event.orderId(), event.customerId());
        } else {
            log.warn("PaymentCapturedEvent had no orderId, skipping Google Drive invoice archival.");
        }
    }

    @KafkaHandler
    public void handleShipmentScheduled(ShipmentScheduledEvent event) {
        log.info("Workspace service consumed ShipmentScheduledEvent: orderId={}, tracking={}", event.orderId(), event.trackingNumber());
        if (event.orderId() != null) {
            syncService.scheduleDelivery(event);
        }
    }

    @KafkaHandler
    public void handleShipmentCancelled(ShipmentCancelledEvent event) {
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
