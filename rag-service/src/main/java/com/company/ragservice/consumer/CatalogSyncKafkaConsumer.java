package com.company.ragservice.consumer;

import com.company.common.events.*;
import com.company.ragservice.entity.CatalogVectorDocument;
import com.company.ragservice.repository.CatalogVectorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
@KafkaListener(
        topics = {"inventory-events", "review-events", "${kafka.topics.product-rating-updated:product-rating-updated-topic}"},
        groupId = "${spring.kafka.consumer.group-id:rag-service-group}"
)
public class CatalogSyncKafkaConsumer {

    private static final String CONSUMER_GROUP = "rag-service-group";
    private final CatalogVectorRepository catalogVectorRepository;
    private final InboxIdempotencyTracker inboxTracker = new InboxIdempotencyTracker(CONSUMER_GROUP);

    @KafkaHandler
    public void handleProductRatingUpdated(
            ProductRatingUpdatedEvent event,
            @Header(name = EventIdempotencyKeyResolver.HEADER_EVENT_ID, required = false) String eventIdHeader) {
        if (event == null || event.skuCode() == null) return;
        if (!inboxTracker.tryAcquire(event, eventIdHeader, null)) {
            return;
        }

        log.info("RAG Vector Consumer: Received ProductRatingUpdatedEvent for SKU: {}, new rating: {}",
                event.skuCode(), event.averageRating());

        Optional<CatalogVectorDocument> docOpt = catalogVectorRepository.findBySkuCode(event.skuCode());
        if (docOpt.isPresent()) {
            CatalogVectorDocument doc = docOpt.get();
            doc.setAverageRating(event.averageRating());
            doc.setIndexedAt(Instant.now());
            catalogVectorRepository.save(doc);
            log.info("Updated vector index rating for SKU: {} -> {}", event.skuCode(), event.averageRating());
        }
    }

    @KafkaHandler
    public void handleStockReserved(
            StockReservedEvent event,
            @Header(name = EventIdempotencyKeyResolver.HEADER_EVENT_ID, required = false) String eventIdHeader) {
        if (event == null) return;
        if (!inboxTracker.tryAcquire(event, eventIdHeader, null)) {
            return;
        }
        log.info("RAG Vector Consumer: Received StockReservedEvent for reservationId: {}", event.reservationId());

        if (event.updatedStockBySku() != null && !event.updatedStockBySku().isEmpty()) {
            for (Map.Entry<String, Integer> entry : event.updatedStockBySku().entrySet()) {
                updateSkuStockInVectorStore(entry.getKey(), entry.getValue());
            }
        } else if (event.skuCode() != null && event.availableQuantity() != null) {
            updateSkuStockInVectorStore(event.skuCode(), event.availableQuantity());
        }
    }

    @KafkaHandler
    public void handleStockReleased(
            StockReleasedEvent event,
            @Header(name = EventIdempotencyKeyResolver.HEADER_EVENT_ID, required = false) String eventIdHeader) {
        if (event == null) return;
        if (!inboxTracker.tryAcquire(event, eventIdHeader, null)) {
            return;
        }
        log.info("RAG Vector Consumer: Received StockReleasedEvent for reservationId: {}", event.reservationId());

        if (event.updatedStockBySku() != null && !event.updatedStockBySku().isEmpty()) {
            for (Map.Entry<String, Integer> entry : event.updatedStockBySku().entrySet()) {
                updateSkuStockInVectorStore(entry.getKey(), entry.getValue());
            }
        } else if (event.skuCode() != null && event.availableQuantity() != null) {
            updateSkuStockInVectorStore(event.skuCode(), event.availableQuantity());
        }
    }

    @KafkaHandler(isDefault = true)
    public void handleDefault(Object event) {
        log.debug("RAG Vector Consumer ignored unhandled payload: {}", event);
    }

    private void updateSkuStockInVectorStore(String skuCode, Integer availableQuantity) {
        if (skuCode == null || availableQuantity == null) return;
        catalogVectorRepository.findBySkuCode(skuCode).ifPresent(doc -> {
            doc.setAvailableQuantity(availableQuantity);
            doc.setInStock(availableQuantity > 0);
            doc.setIndexedAt(Instant.now());
            catalogVectorRepository.save(doc);
            log.info("Updated vector index stock for SKU: {} -> availableQuantity={}, inStock={}",
                    skuCode, availableQuantity, doc.getInStock());
        });
    }
}
