package com.company.shippingservice.kafka;

import com.company.common.events.OrderCancelledEvent;
import com.company.common.events.PaymentCapturedEvent;
import com.company.shippingservice.service.ShippingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@KafkaListener(topics = {"payment-events", "order-events"}, groupId = "shipping-delivery-service-group")
public class ShippingKafkaConsumer {

    private final ShippingService shippingService;

    @KafkaHandler
    public void handlePaymentCaptured(PaymentCapturedEvent event) {
        log.info("Shipping service consumed PaymentCapturedEvent for orderId={} txId={}", event.orderId(), event.transactionId());
        if (event.orderId() != null) {
            shippingService.scheduleShipment(event.orderId(), event.customerId());
        } else {
            log.warn("PaymentCapturedEvent had no orderId, skipping automated shipment scheduling");
        }
    }

    @KafkaHandler
    public void handleOrderCancelled(OrderCancelledEvent event) {
        log.info("Shipping service consumed OrderCancelledEvent for orderId={}. Executing SAGA step 5 compensation.", event.orderId());
        shippingService.cancelShipmentForOrder(event.orderId(), "Order cancelled via SAGA compensation");
    }

    @KafkaHandler(isDefault = true)
    public void handleDefault(Object event) {
        log.debug("Shipping service ignored unrelated event: {}", event);
    }
}
