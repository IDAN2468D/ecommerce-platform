package com.company.dynamicpricingservice.kafka;

import com.company.common.events.StockReleasedEvent;
import com.company.common.events.StockReservedEvent;
import com.company.dynamicpricingservice.service.DynamicPricingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PricingKafkaConsumer {

    private final DynamicPricingService pricingService;

    @KafkaListener(topics = "inventory-events", groupId = "dynamic-pricing-service-group",
            properties = {"spring.json.value.default.type=java.lang.Object"})
    public void handleInventoryEvent(Object event) {
        log.debug("Received inventory event in dynamic pricing service: {}", event);
        if (event instanceof StockReservedEvent reserved) {
            if (reserved.skuCode() != null) {
                pricingService.onInventoryShift(reserved.skuCode(), -1);
            }
        } else if (event instanceof StockReleasedEvent released) {
            if (released.skuCode() != null) {
                pricingService.onInventoryShift(released.skuCode(), 1);
            }
        }
    }
}
