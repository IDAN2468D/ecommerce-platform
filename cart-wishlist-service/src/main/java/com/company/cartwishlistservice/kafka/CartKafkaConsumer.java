package com.company.cartwishlistservice.kafka;

import com.company.cartwishlistservice.service.CartService;
import com.company.common.events.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@KafkaListener(topics = {"order-events", "inventory-events"}, groupId = "cart-wishlist-service-group")
public class CartKafkaConsumer {

    private final CartService cartService;

    @KafkaHandler
    public void handleOrderCreated(OrderCreatedEvent event) {
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
