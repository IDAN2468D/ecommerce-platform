package com.company.dynamicpricingservice.kafka;

import com.company.common.events.AutoBuyTriggeredEvent;
import com.company.common.events.PriceDroppedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PricingKafkaPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishPriceDropped(PriceDroppedEvent event) {
        log.info("Publishing PriceDroppedEvent for SKU {}: oldPrice={}, newPrice={}", 
                event.skuCode(), event.oldPrice(), event.newPrice());
        kafkaTemplate.send("price-events", event.skuCode(), event);
    }

    public void publishAutoBuyTriggered(AutoBuyTriggeredEvent event) {
        log.info("Publishing AutoBuyTriggeredEvent for Rule {}: SKU={}, targetPrice={}, triggeredPrice={}",
                event.ruleId(), event.skuCode(), event.targetPrice(), event.triggeredPrice());
        kafkaTemplate.send("order-events", event.ruleId(), event);
    }
}
