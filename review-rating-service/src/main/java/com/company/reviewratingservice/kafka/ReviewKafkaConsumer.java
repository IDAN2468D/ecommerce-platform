package com.company.reviewratingservice.kafka;

import com.company.common.events.EventIdempotencyKeyResolver;
import com.company.common.events.InboxIdempotencyTracker;
import com.company.common.events.OrderCreatedEvent;
import com.company.common.events.PaymentCapturedEvent;
import com.company.reviewratingservice.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@KafkaListener(topics = {"order-events", "payment-events"}, groupId = "review-rating-service-group")
public class ReviewKafkaConsumer {

    private static final String CONSUMER_GROUP = "review-rating-service-group";
    private final ReviewService reviewService;
    private final InboxIdempotencyTracker inboxTracker = new InboxIdempotencyTracker(CONSUMER_GROUP);

    @KafkaHandler
    public void handleOrderCreated(
            OrderCreatedEvent event,
            @Header(name = EventIdempotencyKeyResolver.HEADER_EVENT_ID, required = false) String eventIdHeader) {
        if (!inboxTracker.tryAcquire(event, eventIdHeader, null)) {
            log.info("Inbox Idempotency: Skipping duplicate OrderCreatedEvent in Review consumer for orderId={}", event.orderId());
            return;
        }
        log.info("Review service consumed OrderCreatedEvent for orderId={}, customerId={}, items={}",
                event.orderId(), event.customerId(), event.items() != null ? event.items().size() : 0);
        if (event.items() != null) {
            for (OrderCreatedEvent.OrderItemPayload item : event.items()) {
                reviewService.recordVerifiedPurchase(event.customerId(), item.skuCode(), event.orderId());
            }
        }
    }

    @KafkaHandler
    public void handlePaymentCaptured(
            PaymentCapturedEvent event,
            @Header(name = EventIdempotencyKeyResolver.HEADER_EVENT_ID, required = false) String eventIdHeader) {
        if (!inboxTracker.tryAcquire(event, eventIdHeader, null)) {
            return;
        }
        log.info("Review service consumed PaymentCapturedEvent for orderId={} txId={}", event.orderId(), event.transactionId());
    }

    @KafkaHandler(isDefault = true)
    public void handleDefault(Object event) {
        log.debug("Review service ignored unrelated event: {}", event);
    }
}
