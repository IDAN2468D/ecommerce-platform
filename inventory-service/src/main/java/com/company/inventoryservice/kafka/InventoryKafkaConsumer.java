package com.company.inventoryservice.kafka;

import com.company.common.events.OrderCancelledEvent;
import com.company.common.events.OrderCreatedEvent;
import com.company.common.events.StockReservationFailedEvent;
import com.company.common.events.StockReservedEvent;
import com.company.inventoryservice.dto.InventoryDtos.ReservationResponse;
import com.company.inventoryservice.dto.InventoryDtos.StockCheckItem;
import com.company.inventoryservice.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@KafkaListener(topics = "order-events", groupId = "inventory-service-group")
public class InventoryKafkaConsumer {

    public static final String TOPIC_INVENTORY_EVENTS = "inventory-events";

    private final InventoryService inventoryService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaHandler
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Received OrderCreatedEvent from Kafka for orderId={}", event.orderId());

        List<StockCheckItem> items = event.items().stream()
                .map(i -> new StockCheckItem(i.skuCode(), i.quantity()))
                .toList();

        ReservationResponse response = inventoryService.reserveStock(items);
        if (response.available()) {
            StockReservedEvent reservedEvent = new StockReservedEvent(
                    event.orderId(),
                    response.reservationId(),
                    Instant.now()
            );
            log.info("Stock successfully reserved for orderId={}, publishing StockReservedEvent", event.orderId());
            kafkaTemplate.send(TOPIC_INVENTORY_EVENTS, event.orderId().toString(), reservedEvent);
        } else {
            StockReservationFailedEvent failedEvent = new StockReservationFailedEvent(
                    event.orderId(),
                    response.failureReason(),
                    Instant.now()
            );
            log.warn("Stock reservation failed for orderId={}, publishing StockReservationFailedEvent", event.orderId());
            kafkaTemplate.send(TOPIC_INVENTORY_EVENTS, event.orderId().toString(), failedEvent);
        }
    }

    @KafkaHandler
    public void handleOrderCancelled(OrderCancelledEvent event) {
        log.info("Received OrderCancelledEvent from Kafka for orderId={}", event.orderId());
    }

    @KafkaHandler(isDefault = true)
    public void handleUnknown(Object object) {
        log.debug("Received unhandled event in inventory listener: {}", object);
    }
}
