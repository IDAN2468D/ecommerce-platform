package com.company.paymentservice.kafka;

import com.company.common.events.OrderCancelledEvent;
import com.company.common.events.PaymentCapturedEvent;
import com.company.common.events.PaymentFailedEvent;
import com.company.common.events.StockReservedEvent;
import com.company.paymentservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
@KafkaListener(topics = {"inventory-events", "order-events"}, groupId = "payment-service-group")
public class PaymentKafkaConsumer {

    public static final String TOPIC_PAYMENT_EVENTS = "payment-events";

    private final PaymentService paymentService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaHandler
    public void handleStockReserved(StockReservedEvent event) {
        log.info("Received StockReservedEvent from Kafka for orderId={}", event.orderId());
    }

    @KafkaHandler
    public void handleOrderCancelled(OrderCancelledEvent event) {
        log.info("Received OrderCancelledEvent from Kafka for orderId={}, processing refund", event.orderId());
    }

    @KafkaHandler(isDefault = true)
    public void handleUnknown(Object object) {
        log.debug("Received unhandled event in payment listener: {}", object);
    }
}
