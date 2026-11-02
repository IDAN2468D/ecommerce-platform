package com.company.paymentservice.kafka;

import com.company.common.events.EventIdempotencyKeyResolver;
import com.company.common.events.InboxIdempotencyTracker;
import com.company.common.events.OrderCancelledEvent;
import com.company.common.events.StockReservedEvent;
import com.company.paymentservice.domain.entity.ProcessedEventEntity;
import com.company.paymentservice.repository.ProcessedEventRepository;
import com.company.paymentservice.service.PaymentService;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
@KafkaListener(topics = {"inventory-events", "order-events"}, groupId = "payment-service-group")
public class PaymentKafkaConsumer {

    public static final String TOPIC_PAYMENT_EVENTS = "payment-events";
    private static final String CONSUMER_GROUP = "payment-service-group";

    private final PaymentService paymentService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired(required = false)
    private ProcessedEventRepository processedEventRepository;

    @Autowired(required = false)
    private MeterRegistry meterRegistry;

    private final InboxIdempotencyTracker inboxTracker = new InboxIdempotencyTracker(CONSUMER_GROUP);

    @KafkaHandler
    public void handleStockReserved(
            StockReservedEvent event,
            @Header(name = EventIdempotencyKeyResolver.HEADER_EVENT_ID, required = false) String eventIdHeader) {
        if (!tryAcquireIdempotentLock(event, eventIdHeader)) {
            log.info("Inbox Idempotency: Skipping duplicate StockReservedEvent for orderId={}", event.orderId());
            return;
        }
        log.info("Received StockReservedEvent from Kafka for orderId={}", event.orderId());
    }

    @KafkaHandler
    public void handleOrderCancelled(
            OrderCancelledEvent event,
            @Header(name = EventIdempotencyKeyResolver.HEADER_EVENT_ID, required = false) String eventIdHeader) {
        if (!tryAcquireIdempotentLock(event, eventIdHeader)) {
            log.info("Inbox Idempotency: Skipping duplicate OrderCancelledEvent for orderId={}", event.orderId());
            return;
        }
        log.info("Received OrderCancelledEvent from Kafka for orderId={}, processing refund", event.orderId());
    }

    @KafkaHandler(isDefault = true)
    public void handleUnknown(Object object) {
        log.debug("Received unhandled event in payment listener: {}", object);
    }

    public boolean tryAcquireIdempotentLock(Object event, String eventIdHeader) {
        boolean acquired = inboxTracker.tryAcquire(event, eventIdHeader, key -> {
            if (processedEventRepository == null) {
                return true;
            }
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
                return true;
            } catch (Exception ex) {
                log.debug("ProcessedEventRepository fallback to local inbox tracker: {}", ex.getMessage());
                return true;
            }
        });
        recordInboxMetric(acquired);
        return acquired;
    }

    private void recordInboxMetric(boolean processed) {
        if (meterRegistry != null) {
            meterRegistry.counter("ecommerce_kafka_idempotent_events_total",
                    "consumer_group", CONSUMER_GROUP,
                    "outcome", processed ? "PROCESSED" : "DUPLICATE_SKIPPED").increment();
        }
    }
}
