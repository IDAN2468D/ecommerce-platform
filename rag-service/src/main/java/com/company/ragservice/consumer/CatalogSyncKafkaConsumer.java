package com.company.ragservice.consumer;

import com.company.common.events.ProductRatingUpdatedEvent;
import com.company.ragservice.entity.CatalogVectorDocument;
import com.company.ragservice.repository.CatalogVectorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class CatalogSyncKafkaConsumer {

    private final CatalogVectorRepository catalogVectorRepository;

    @KafkaListener(
            topics = "${kafka.topics.product-rating-updated:product-rating-updated-topic}",
            groupId = "${spring.kafka.consumer.group-id:rag-service-group}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleProductRatingUpdated(ProductRatingUpdatedEvent event) {
        if (event == null || event.skuCode() == null) return;

        log.info("RAG Vector Consumer: Received ProductRatingUpdatedEvent for SKU: {}, new rating: {}",
                event.skuCode(), event.averageRating());

        Optional<CatalogVectorDocument> docOpt = catalogVectorRepository.findBySkuCode(event.skuCode());
        if (docOpt.isPresent()) {
            CatalogVectorDocument doc = docOpt.get();
            doc.setAverageRating(event.averageRating());
            doc.setIndexedAt(Instant.now());
            catalogVectorRepository.save(doc);
            log.info("Updated vector index rating for SKU: {}", event.skuCode());
        }
    }
}
