package com.company.inventoryservice.kafka;

import com.company.common.events.*;
import com.company.inventoryservice.domain.entity.ProcessedEventEntity;
import com.company.inventoryservice.dto.InventoryDtos.ReservationResponse;
import com.company.inventoryservice.dto.InventoryDtos.StockCheckItem;
import com.company.inventoryservice.repository.ProcessedEventRepository;
import com.company.inventoryservice.service.InventoryService;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@KafkaListener(topics = {"order-events", "review-events"}, groupId = "inventory-service-group")
public class InventoryKafkaConsumer {

    public static final String TOPIC_INVENTORY_EVENTS = "inventory-events";
    private static final String CONSUMER_GROUP = "inventory-service-group";
    private static final Duration INBOX_TTL = Duration.ofHours(24);

    private final InventoryService inventoryService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    @Autowired(required = false)
    private ProcessedEventRepository processedEventRepository;

    @Autowired(required = false)
    private MeterRegistry meterRegistry;

    private final InboxIdempotencyTracker inboxTracker = new InboxIdempotencyTracker(CONSUMER_GROUP);

    @KafkaHandler
    public void handleOrderCreated(
            OrderCreatedEvent event,
            @Header(name = EventIdempotencyKeyResolver.HEADER_EVENT_ID, required = false) String eventIdHeader) {
        if (!tryAcquireIdempotentLock(event, eventIdHeader)) {
            log.info("Inbox Idempotency: Skipping duplicate OrderCreatedEvent for orderId={}", event.orderId());
            return;
        }
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
    public void handleOrderCancelled(
            OrderCancelledEvent event,
            @Header(name = EventIdempotencyKeyResolver.HEADER_EVENT_ID, required = false) String eventIdHeader) {
        if (!tryAcquireIdempotentLock(event, eventIdHeader)) {
            log.info("Inbox Idempotency: Skipping duplicate OrderCancelledEvent for orderId={}", event.orderId());
            return;
        }
        log.info("Received OrderCancelledEvent from Kafka for orderId={}", event.orderId());
    }

    @KafkaHandler
    public void handleProductRatingUpdated(
            ProductRatingUpdatedEvent event,
            @Header(name = EventIdempotencyKeyResolver.HEADER_EVENT_ID, required = false) String eventIdHeader) {
        if (!tryAcquireIdempotentLock(event, eventIdHeader)) {
            log.info("Inbox Idempotency: Skipping duplicate ProductRatingUpdatedEvent for skuCode={}", event.skuCode());
            return;
        }
        log.info("Received ProductRatingUpdatedEvent from Kafka for skuCode={}, avgRating={}, count={}",
                event.skuCode(), event.averageRating(), event.reviewCount());
        inventoryService.updateProductRating(event.skuCode(), event.averageRating(), event.reviewCount());
    }

    @KafkaHandler(isDefault = true)
    public void handleUnknown(Object object) {
        log.debug("Received unhandled event in inventory listener: {}", object);
    }

    public boolean tryAcquireIdempotentLock(Object event, String eventIdHeader) {
        boolean acquired = inboxTracker.tryAcquire(event, eventIdHeader, key -> {
            if (redisTemplate != null) {
                try {
                    Boolean set = redisTemplate.opsForValue().setIfAbsent("inbox:" + key, "1", INBOX_TTL);
                    if (Boolean.FALSE.equals(set)) {
                        return false;
                    }
                } catch (Exception ex) {
                    log.debug("Redis Inbox check fallback to MongoDB processed_events: {}", ex.getMessage());
                }
            }
            if (processedEventRepository != null) {
                try {
                    if (processedEventRepository.existsById(key)) {
                        return false;
                    }
                    processedEventRepository.save(ProcessedEventEntity.builder()
                            .eventId(key)
                            .consumerGroup(CONSUMER_GROUP)
                            .eventType(event != null ? event.getClass().getSimpleName() : "UNKNOWN")
                            .processedAt(Instant.now())
                            .build());
                } catch (Exception ex) {
                    log.debug("ProcessedEventRepository save warning: {}", ex.getMessage());
                }
            }
            return true;
        });
        if (meterRegistry != null) {
            meterRegistry.counter("ecommerce_kafka_idempotent_events_total",
                    "consumer_group", CONSUMER_GROUP,
                    "outcome", acquired ? "PROCESSED" : "DUPLICATE_SKIPPED").increment();
        }
        return acquired;
    }
}
