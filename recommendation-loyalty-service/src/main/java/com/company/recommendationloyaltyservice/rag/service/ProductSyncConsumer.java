package com.company.recommendationloyaltyservice.rag.service;

import com.company.common.events.ProductRatingUpdatedEvent;
import com.company.recommendationloyaltyservice.rag.model.ProductVectorDocument;
import com.company.recommendationloyaltyservice.rag.repository.ProductVectorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class ProductSyncConsumer {

    private static final Logger log = LoggerFactory.getLogger(ProductSyncConsumer.class);

    private final ProductVectorRepository vectorRepository;

    public ProductSyncConsumer(ProductVectorRepository vectorRepository) {
        this.vectorRepository = vectorRepository;
    }

    @KafkaListener(
            topics = "${kafka.topic.product-rating-updated:product-rating-updated-topic}",
            groupId = "${spring.kafka.consumer.group-id:recommendation-loyalty-service-group}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleRatingUpdate(ProductRatingUpdatedEvent event) {
        if (event == null || event.skuCode() == null) return;
        log.info("Received ProductRatingUpdatedEvent for SKU: {}, new rating: {}", event.skuCode(), event.averageRating());

        vectorRepository.findBySkuCode(event.skuCode()).ifPresent(doc -> {
            doc.setAverageRating(event.averageRating());
            doc.setLastIndexedAt(Instant.now());
            vectorRepository.save(doc);
            log.debug("Updated vector document rating for SKU {}", event.skuCode());
        });
    }
}
