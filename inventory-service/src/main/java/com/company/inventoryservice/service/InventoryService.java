package com.company.inventoryservice.service;

import com.company.inventoryservice.domain.entity.InventoryEntity;
import com.company.inventoryservice.domain.entity.InventoryReservationEntity;
import com.company.inventoryservice.dto.InventoryDtos.*;
import com.company.inventoryservice.repository.InventoryRepository;
import com.company.inventoryservice.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.company.common.events.StockReleasedEvent;
import com.company.common.events.StockReservationFailedEvent;
import com.company.common.events.StockReservedEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    public static final String TOPIC_INVENTORY_EVENTS = "inventory-events";

    private final InventoryRepository inventoryRepository;
    private final ReservationRepository reservationRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final MongoTemplate mongoTemplate;
    private final OutboxService outboxService;

    @Caching(evict = {
        @CacheEvict(value = "inventory_stock", allEntries = true),
        @CacheEvict(value = "products_catalog", allEntries = true)
    })
    @Transactional
    public ReservationResponse reserveStock(List<StockCheckItem> items) {
        log.info("Checking and reserving stock for {} items", items.size());
        String reservationId = "res_" + UUID.randomUUID();

        // 1. First Pass: Lock each item with PESSIMISTIC_WRITE and verify stock
        for (StockCheckItem item : items) {
            Optional<InventoryEntity> invOpt = inventoryRepository.findBySkuCodeForUpdate(item.skuCode());
            if (invOpt.isEmpty()) {
                log.warn("SKU {} not found in inventory", item.skuCode());
                return new ReservationResponse(false, null, "Product SKU " + item.skuCode() + " does not exist");
            }

            InventoryEntity inv = invOpt.get();
            if (inv.getAvailableQuantity() < item.quantity()) {
                log.warn("Insufficient stock for SKU {}. Available: {}, Requested: {}",
                        item.skuCode(), inv.getAvailableQuantity(), item.quantity());
                return new ReservationResponse(false, null,
                        "Product " + item.skuCode() + " is out of stock (Requested: " + item.quantity() + ", Available: " + inv.getAvailableQuantity() + ")");
            }
        }

        // 2. Second Pass: Deduct available stock, increment reserved stock, record reservation
        for (StockCheckItem item : items) {
            InventoryEntity inv = inventoryRepository.findBySkuCodeForUpdate(item.skuCode()).orElseThrow();
            inv.setAvailableQuantity(inv.getAvailableQuantity() - item.quantity());
            inv.setReservedQuantity(inv.getReservedQuantity() + item.quantity());
            inv.setUpdatedAt(Instant.now());
            inventoryRepository.save(inv);

            InventoryReservationEntity reservation = InventoryReservationEntity.builder()
                    .id(UUID.randomUUID())
                    .reservationId(reservationId)
                    .skuCode(item.skuCode())
                    .quantity(item.quantity())
                    .status("ACTIVE")
                    .build();
            reservationRepository.save(reservation);
        }

        log.info("Stock reservation {} completed successfully", reservationId);

        // Publish to Kafka topic 'inventory-events' and record in Outbox
        StockReservedEvent reservedEvent = new StockReservedEvent(
                null,
                reservationId,
                Instant.now()
        );
        com.company.inventoryservice.domain.entity.OutboxEventEntity outboxEvent =
                outboxService.saveEvent("INVENTORY", reservationId, "StockReservedEvent", TOPIC_INVENTORY_EVENTS, reservedEvent);

        try {
            log.info("Publishing StockReservedEvent to Kafka topic '{}': resId={}", TOPIC_INVENTORY_EVENTS, reservationId);
            kafkaTemplate.send(TOPIC_INVENTORY_EVENTS, reservationId, reservedEvent);
            if (outboxEvent != null) {
                outboxService.markPublished(outboxEvent.getId());
            }
        } catch (Exception ex) {
            log.warn("Failed to publish StockReservedEvent to Kafka (outbox will retry): {}", ex.getMessage());
        }

        return new ReservationResponse(true, reservationId, null);
    }

    @Caching(evict = {
        @CacheEvict(value = "inventory_stock", allEntries = true),
        @CacheEvict(value = "products_catalog", allEntries = true)
    })
    @Transactional
    public void releaseStock(InventoryReleaseRequest request) {
        log.info("Processing stock release for reservation: {}", request.reservationId());

        if (request.reservationId() != null) {
            List<InventoryReservationEntity> reservations = reservationRepository.findByReservationId(request.reservationId());
            for (InventoryReservationEntity res : reservations) {
                if ("ACTIVE".equals(res.getStatus())) {
                    inventoryRepository.findBySkuCodeForUpdate(res.getSkuCode()).ifPresent(inv -> {
                        inv.setAvailableQuantity(inv.getAvailableQuantity() + res.getQuantity());
                        inv.setReservedQuantity(Math.max(0, inv.getReservedQuantity() - res.getQuantity()));
                        inventoryRepository.save(inv);
                    });
                    res.setStatus("RELEASED");
                    reservationRepository.save(res);
                }
            }
        } else if (request.items() != null) {
            for (StockCheckItem item : request.items()) {
                inventoryRepository.findBySkuCodeForUpdate(item.skuCode()).ifPresent(inv -> {
                    inv.setAvailableQuantity(inv.getAvailableQuantity() + item.quantity());
                    inv.setReservedQuantity(Math.max(0, inv.getReservedQuantity() - item.quantity()));
                    inventoryRepository.save(inv);
                });
            }
        }

        // Publish to Kafka topic 'inventory-events' and record in Outbox
        StockReleasedEvent releasedEvent = new StockReleasedEvent(
                request.reservationId(),
                "Compensating action / Order cancelled",
                Instant.now()
        );
        com.company.inventoryservice.domain.entity.OutboxEventEntity outboxEvent =
                outboxService.saveEvent("INVENTORY", request.reservationId() != null ? request.reservationId() : "global", "StockReleasedEvent", TOPIC_INVENTORY_EVENTS, releasedEvent);

        try {
            log.info("Publishing StockReleasedEvent to Kafka topic '{}': resId={}", TOPIC_INVENTORY_EVENTS, request.reservationId());
            kafkaTemplate.send(TOPIC_INVENTORY_EVENTS, request.reservationId() != null ? request.reservationId() : "global", releasedEvent);
            if (outboxEvent != null) {
                outboxService.markPublished(outboxEvent.getId());
            }
        } catch (Exception ex) {
            log.warn("Failed to publish StockReleasedEvent to Kafka (outbox will retry): {}", ex.getMessage());
        }
    }

    @Cacheable(value = "inventory_stock", key = "#skuCode")
    @Transactional(readOnly = true)
    public Optional<InventoryItemResponse> getStock(String skuCode) {
        return inventoryRepository.findBySkuCode(skuCode)
                .map(this::mapToResponse);
    }

    @Cacheable(value = "products_catalog", key = "#category != null ? #category : 'ALL'")
    @Transactional(readOnly = true)
    public ProductCatalogResponse getAllProductsCatalog(String category) {
        List<InventoryEntity> list;
        if (category != null && !category.trim().isEmpty() && !"ALL".equalsIgnoreCase(category)) {
            list = inventoryRepository.findByCategoryIgnoreCase(category.trim());
        } else {
            list = inventoryRepository.findAllByOrderByProductNameAsc();
        }
        return new ProductCatalogResponse(list.stream().map(this::mapToResponse).toList());
    }

    @Caching(evict = {
        @CacheEvict(value = "inventory_stock", allEntries = true),
        @CacheEvict(value = "products_catalog", allEntries = true)
    })
    @Transactional
    public InventoryItemResponse addOrUpdateStock(CreateInventoryItemRequest request) {
        Optional<InventoryEntity> existing = inventoryRepository.findBySkuCode(request.skuCode());
        InventoryEntity entity;
        if (existing.isPresent()) {
            entity = existing.get();
            entity.setAvailableQuantity(entity.getAvailableQuantity() + request.quantity());
            entity.setUnitPrice(request.unitPrice());
            entity.setProductName(request.productName());
            if (request.description() != null) entity.setDescription(request.description());
            if (request.category() != null) entity.setCategory(request.category());
            if (request.imageUrl() != null) entity.setImageUrl(request.imageUrl());
            entity.setUpdatedAt(Instant.now());
        } else {
            entity = InventoryEntity.builder()
                    .id(UUID.randomUUID())
                    .skuCode(request.skuCode())
                    .productName(request.productName())
                    .availableQuantity(request.quantity())
                    .reservedQuantity(0)
                    .unitPrice(request.unitPrice())
                    .description(request.description())
                    .category(request.category())
                    .imageUrl(request.imageUrl())
                    .build();
        }
        InventoryEntity saved = inventoryRepository.save(entity);
        return mapToResponse(saved);
    }

    @Caching(evict = {
        @CacheEvict(value = "inventory_stock", allEntries = true),
        @CacheEvict(value = "products_catalog", allEntries = true)
    })
    @Transactional
    public void updateProductRating(String skuCode, double averageRating, int reviewCount) {
        log.info("Updating product rating in inventory: skuCode={}, rating={}, count={}", skuCode, averageRating, reviewCount);
        inventoryRepository.findBySkuCode(skuCode).ifPresent(entity -> {
            entity.setAverageRating(averageRating);
            entity.setReviewCount(reviewCount);
            entity.setUpdatedAt(Instant.now());
            inventoryRepository.save(entity);
            log.info("Successfully updated rating for product {}", skuCode);
        });
    }

    public StockReservationTtlResponse getReservationTtl(String reservationId) {
        log.info("Checking reservation TTL for reservationId: {}", reservationId);
        List<InventoryReservationEntity> reservations = reservationRepository.findByReservationId(reservationId);
        if (reservations.isEmpty()) {
            return new StockReservationTtlResponse(reservationId, 0, Instant.now(), false);
        }
        InventoryReservationEntity first = reservations.get(0);
        Instant expiresAt = first.getCreatedAt().plus(Duration.ofMinutes(10));
        long remaining = Math.max(0, Duration.between(Instant.now(), expiresAt).getSeconds());
        boolean active = remaining > 0 && "ACTIVE".equals(first.getStatus());
        return new StockReservationTtlResponse(reservationId, remaining, expiresAt, active);
    }

    @Transactional(readOnly = true)
    public FilteredCatalogResponse searchProducts(
            String searchQuery,
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean inStockOnly,
            Double minRating,
            String sortOption,
            int page,
            int size) {

        log.info("Searching products with query='{}', category='{}', price=[{}-{}], inStock={}, minRating={}, sort={}, page={}, size={}",
                searchQuery, category, minPrice, maxPrice, inStockOnly, minRating, sortOption, page, size);

        Query query = new Query();

        if (searchQuery != null && !searchQuery.trim().isEmpty()) {
            String q = searchQuery.trim();
            query.addCriteria(new Criteria().orOperator(
                    Criteria.where("productName").regex(q, "i"),
                    Criteria.where("description").regex(q, "i"),
                    Criteria.where("skuCode").regex(q, "i")
            ));
        }

        if (category != null && !category.trim().isEmpty() && !"ALL".equalsIgnoreCase(category)) {
            query.addCriteria(Criteria.where("category").is(category.trim()));
        }

        if (minPrice != null && maxPrice != null) {
            query.addCriteria(Criteria.where("unitPrice").gte(minPrice).lte(maxPrice));
        } else if (minPrice != null) {
            query.addCriteria(Criteria.where("unitPrice").gte(minPrice));
        } else if (maxPrice != null) {
            query.addCriteria(Criteria.where("unitPrice").lte(maxPrice));
        }

        if (Boolean.TRUE.equals(inStockOnly)) {
            query.addCriteria(Criteria.where("availableQuantity").gt(0));
        }

        if (minRating != null && minRating > 0) {
            query.addCriteria(Criteria.where("averageRating").gte(minRating));
        }

        Sort sort = switch (sortOption != null ? sortOption.toLowerCase() : "") {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "unitPrice");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "unitPrice");
            case "rating_desc", "popularity" -> Sort.by(Sort.Direction.DESC, "averageRating");
            case "newest" -> Sort.by(Sort.Direction.DESC, "updatedAt");
            default -> Sort.by(Sort.Direction.ASC, "productName");
        };

        long totalElements = mongoTemplate.count(query, InventoryEntity.class);
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), sort);
        query.with(pageable);

        List<InventoryEntity> entities = mongoTemplate.find(query, InventoryEntity.class);
        List<InventoryItemResponse> items = entities.stream().map(this::mapToResponse).toList();
        int totalPages = (int) Math.ceil((double) totalElements / size);

        return new FilteredCatalogResponse(items, totalElements, totalPages, page, size);
    }

    private InventoryItemResponse mapToResponse(InventoryEntity entity) {
        return new InventoryItemResponse(
                entity.getId(),
                entity.getSkuCode(),
                entity.getProductName(),
                entity.getAvailableQuantity(),
                entity.getReservedQuantity(),
                entity.getUnitPrice(),
                entity.getDescription(),
                entity.getCategory(),
                entity.getImageUrl(),
                entity.getAverageRating() != null ? entity.getAverageRating() : 4.9,
                entity.getReviewCount() != null ? entity.getReviewCount() : 12
        );
    }
}
