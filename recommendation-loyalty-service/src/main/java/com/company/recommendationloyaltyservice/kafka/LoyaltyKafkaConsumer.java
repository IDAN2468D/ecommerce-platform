package com.company.recommendationloyaltyservice.kafka;

import com.company.common.events.*;
import com.company.recommendationloyaltyservice.domain.entity.ProcessedEventEntity;
import com.company.recommendationloyaltyservice.repository.ProcessedEventRepository;
import com.company.recommendationloyaltyservice.service.LoyaltyService;
import com.company.recommendationloyaltyservice.service.RecommendationService;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@KafkaListener(topics = {"payment-events", "order-events"}, groupId = "recommendation-loyalty-service-group")
public class LoyaltyKafkaConsumer {

    private static final String CONSUMER_GROUP = "recommendation-loyalty-service-group";
    private static final Duration INBOX_TTL = Duration.ofHours(24);

    private final LoyaltyService loyaltyService;
    private final RecommendationService recommendationService;

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
            log.info("Inbox Idempotency: Skipping duplicate OrderCreatedEvent in Loyalty consumer for orderId={}", event.orderId());
            return;
        }
        log.info("Loyalty & Rec service consumed OrderCreatedEvent for orderId={}, items={}",
                event.orderId(), event.items() != null ? event.items().size() : 0);

        if (event.items() != null && event.items().size() >= 2) {
            List<String> skus = event.items().stream()
                    .map(OrderCreatedEvent.OrderItemPayload::skuCode)
                    .toList();
            recommendationService.recordCoPurchase(skus);
        }
    }

    @KafkaHandler
    public void handlePaymentCaptured(
            PaymentCapturedEvent event,
            @Header(name = EventIdempotencyKeyResolver.HEADER_EVENT_ID, required = false) String eventIdHeader) {
        if (!tryAcquireIdempotentLock(event, eventIdHeader)) {
            log.info("Inbox Idempotency: Skipping duplicate PaymentCapturedEvent in Loyalty consumer for orderId={}, txId={}",
                    event.orderId(), event.transactionId());
            return;
        }
        log.info("Loyalty service consumed PaymentCapturedEvent for orderId={}, amount={} {}",
                event.orderId(), event.amount(), event.currency());
        String customer = (event.customerId() != null && !event.customerId().isBlank()) ? event.customerId() : "usr_demo";
        loyaltyService.creditCashback(customer, event.orderId(), event.transactionId(), event.amount());
    }

    @KafkaHandler
    public void handlePaymentRefunded(
            PaymentRefundedEvent event,
            @Header(name = EventIdempotencyKeyResolver.HEADER_EVENT_ID, required = false) String eventIdHeader) {
        if (!tryAcquireIdempotentLock(event, eventIdHeader)) {
            log.info("Inbox Idempotency: Skipping duplicate PaymentRefundedEvent in Loyalty consumer for txId={}", event.transactionId());
            return;
        }
        log.info("Loyalty service consumed PaymentRefundedEvent for txId={}, amount={}",
                event.transactionId(), event.amount());
        loyaltyService.compensateRefund("usr_demo", null, event.transactionId() != null ? event.transactionId().toString() : null, event.amount());
    }

    @KafkaHandler(isDefault = true)
    public void handleDefault(Object event) {
        log.debug("Loyalty service ignored event: {}", event);
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
