package com.company.recommendationloyaltyservice.kafka;

import com.company.common.events.OrderCreatedEvent;
import com.company.common.events.PaymentCapturedEvent;
import com.company.common.events.PaymentRefundedEvent;
import com.company.recommendationloyaltyservice.service.LoyaltyService;
import com.company.recommendationloyaltyservice.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@KafkaListener(topics = {"payment-events", "order-events"}, groupId = "recommendation-loyalty-service-group")
public class LoyaltyKafkaConsumer {

    private final LoyaltyService loyaltyService;
    private final RecommendationService recommendationService;

    @KafkaHandler
    public void handleOrderCreated(OrderCreatedEvent event) {
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
    public void handlePaymentCaptured(PaymentCapturedEvent event) {
        log.info("Loyalty service consumed PaymentCapturedEvent for orderId={}, amount={} {}",
                event.orderId(), event.amount(), event.currency());
        String customer = (event.customerId() != null && !event.customerId().isBlank()) ? event.customerId() : "usr_demo";
        loyaltyService.creditCashback(customer, event.orderId(), event.transactionId(), event.amount());
    }

    @KafkaHandler
    public void handlePaymentRefunded(PaymentRefundedEvent event) {
        log.info("Loyalty service consumed PaymentRefundedEvent for txId={}, amount={}",
                event.transactionId(), event.amount());
        loyaltyService.compensateRefund("usr_demo", null, event.transactionId() != null ? event.transactionId().toString() : null, event.amount());
    }

    @KafkaHandler(isDefault = true)
    public void handleDefault(Object event) {
        log.debug("Loyalty service ignored event: {}", event);
    }
}
