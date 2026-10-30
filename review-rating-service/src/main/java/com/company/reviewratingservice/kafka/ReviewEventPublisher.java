package com.company.reviewratingservice.kafka;

import com.company.common.events.ProductRatingUpdatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReviewEventPublisher {

    public static final String TOPIC_REVIEW_EVENTS = "review-events";
    public static final String TOPIC_INVENTORY_EVENTS = "inventory-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishRatingUpdated(ProductRatingUpdatedEvent event) {
        log.info("Publishing ProductRatingUpdatedEvent for skuCode={} avgRating={} count={}",
                event.skuCode(), event.averageRating(), event.reviewCount());
        kafkaTemplate.send(TOPIC_REVIEW_EVENTS, event.skuCode(), event);
        kafkaTemplate.send(TOPIC_INVENTORY_EVENTS, event.skuCode(), event);
    }
}
