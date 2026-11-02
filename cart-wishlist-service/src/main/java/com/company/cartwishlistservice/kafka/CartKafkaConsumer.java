package com.company.cartwishlistservice.kafka;

import com.company.cartwishlistservice.service.CartService;
import com.company.common.events.EventIdempotencyKeyResolver;
import com.company.common.events.InboxIdempotencyTracker;
import com.company.common.events.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@KafkaListener(topics = {"order-events", "inventory-events"}, groupId = "cart-wishlist-service-group")
public class CartKafkaConsumer {

    private static final String CONSUMER_GROUP = "cart-wishlist-service-group";
    private final CartService cartService;
    private final InboxIdempotencyTracker inboxTracker = new InboxIdempotencyTracker(CONSUMER_GROUP);

    @KafkaHandler
    public void handleOrderCreated(
            OrderCreatedEvent event,
            @Header(name = EventIdempotencyKeyResolver.HEADER_EVENT_ID, required = false) String eventIdHeader) {
        if (!inboxTracker.tryAcquire(event, eventIdHeader, null)) {
            log.info("Inbox Idempotency: Skipping duplicate OrderCreatedEvent in Cart consumer for orderId={}", event.orderId());
            return;
        }
        log.info("Cart service consumed OrderCreatedEvent for orderId={}, customerId={}. Clearing server-side cart.",
                event.orderId(), event.customerId());
        if (event.customerId() != null && !event.customerId().isBlank()) {
            cartService.clearCart(event.customerId());
        }
    }

    @KafkaHandler(isDefault = true)
    public void handleDefault(Object event) {
        log.debug("Cart service ignored event: {}", event);
    }
}
