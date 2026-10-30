package com.company.orderservice.kafka;

import com.company.common.events.OrderCancelledEvent;
import com.company.common.events.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventPublisher {

    public static final String TOPIC_ORDER_EVENTS = "order-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishOrderCreated(OrderCreatedEvent event) {
        log.info("Publishing OrderCreatedEvent to Kafka topic '{}': orderId={}", TOPIC_ORDER_EVENTS, event.orderId());
        kafkaTemplate.send(TOPIC_ORDER_EVENTS, event.orderId().toString(), event);
    }

    public void publishOrderCancelled(OrderCancelledEvent event) {
        log.info("Publishing OrderCancelledEvent to Kafka topic '{}': orderId={}", TOPIC_ORDER_EVENTS, event.orderId());
        kafkaTemplate.send(TOPIC_ORDER_EVENTS, event.orderId().toString(), event);
    }
}
