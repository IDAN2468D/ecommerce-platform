package com.company.shippingservice.kafka;

import com.company.common.events.OrderDispatchedEvent;
import com.company.common.events.ShipmentCancelledEvent;
import com.company.common.events.ShipmentScheduledEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ShippingEventPublisher {

    public static final String TOPIC_SHIPPING_EVENTS = "shipping-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishShipmentScheduled(ShipmentScheduledEvent event) {
        log.info("Publishing ShipmentScheduledEvent for orderId={} trackingNumber={}", event.orderId(), event.trackingNumber());
        kafkaTemplate.send(TOPIC_SHIPPING_EVENTS, event.orderId().toString(), event);
    }

    public void publishOrderDispatched(OrderDispatchedEvent event) {
        log.info("Publishing OrderDispatchedEvent for orderId={} status={}", event.orderId(), event.status());
        kafkaTemplate.send(TOPIC_SHIPPING_EVENTS, event.orderId().toString(), event);
    }

    public void publishShipmentCancelled(ShipmentCancelledEvent event) {
        log.info("Publishing ShipmentCancelledEvent for orderId={} reason={}", event.orderId(), event.reason());
        kafkaTemplate.send(TOPIC_SHIPPING_EVENTS, event.orderId().toString(), event);
    }
}
