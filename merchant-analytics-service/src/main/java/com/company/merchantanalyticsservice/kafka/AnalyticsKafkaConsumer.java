package com.company.merchantanalyticsservice.kafka;

import com.company.common.events.*;
import com.company.merchantanalyticsservice.service.MerchantAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AnalyticsKafkaConsumer {

    private final MerchantAnalyticsService analyticsService;

    @KafkaListener(topics = {"order-events", "return-events", "fraud-events", "cart-events"},
            groupId = "merchant-analytics-service-group",
            properties = {"spring.json.value.default.type=java.lang.Object"})
    public void handlePlatformEvent(Object event) {
        log.debug("Analytics consumer received event: {}", event);
        if (event instanceof OrderCreatedEvent order) {
            analyticsService.recordOrder(order.totalAmount());
        } else if (event instanceof ReturnApprovedEvent ret) {
            analyticsService.recordReturn(ret.refundAmount(), ret.resolutionType());
        } else if (event instanceof FraudFlaggedEvent fraud) {
            analyticsService.recordFraudBlocked();
        } else if (event instanceof CartAbandonedEvent cart) {
            analyticsService.recordCartAbandoned();
        }
    }
}
