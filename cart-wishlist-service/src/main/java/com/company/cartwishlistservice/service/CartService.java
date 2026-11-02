package com.company.cartwishlistservice.service;

import com.company.common.events.CartAbandonedEvent;
import com.company.common.events.CartUpdatedEvent;
import com.company.cartwishlistservice.domain.entity.SavedCartEntity;
import com.company.cartwishlistservice.domain.model.CartItem;
import com.company.cartwishlistservice.dto.CartDtos.*;
import com.company.cartwishlistservice.repository.SavedCartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    public static final String TOPIC_CART_EVENTS = "cart-events";

    private final RedisTemplate<String, Object> redisTemplate;
    private final SavedCartRepository savedCartRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private io.micrometer.core.instrument.MeterRegistry meterRegistry;

    @Value("${cart.abandoned.threshold-seconds:120}")
    private long abandonedThresholdSeconds;

    private static final String CART_KEY_PREFIX = "cart:";
    private static final Duration CART_TTL = Duration.ofDays(7);

    public CartResponse getCart(String customerId) {
        String key = getCartKey(customerId);
        Map<Object, Object> rawEntries = redisTemplate.opsForHash().entries(key);

        List<CartItem> items = new ArrayList<>();
        if (rawEntries != null && !rawEntries.isEmpty()) {
            for (Object val : rawEntries.values()) {
                if (val instanceof CartItem item) {
                    items.add(item);
                }
            }
        } else {
            Optional<SavedCartEntity> savedOpt = savedCartRepository.findByCustomerId(customerId);
            if (savedOpt.isPresent()) {
                items = savedOpt.get().getItems();
                for (CartItem item : items) {
                    redisTemplate.opsForHash().put(key, item.getSkuCode(), item);
                }
                redisTemplate.expire(key, CART_TTL);
            }
        }

        return buildResponse(customerId, items);
    }

    public CartResponse upsertItem(String customerId, UpdateCartItemRequest request) {
        log.info("Upserting cart item for customer: {}, sku: {}, qty: {}", customerId, request.skuCode(), request.quantity());
        String key = getCartKey(customerId);

        CartItem item = CartItem.builder()
                .skuCode(request.skuCode())
                .productName(request.productName() != null ? request.productName() : request.skuCode())
                .quantity(request.quantity())
                .unitPrice(request.unitPrice())
                .imageUrl(request.imageUrl())
                .addedAt(Instant.now())
                .build();

        redisTemplate.opsForHash().put(key, request.skuCode(), item);
        redisTemplate.expire(key, CART_TTL);

        syncToMongoAsync(customerId);

        CartResponse response = getCart(customerId);
        publishCartUpdatedEventAsync(customerId, "ITEM_UPSERTED", response);
        return response;
    }

    public CartResponse removeItem(String customerId, String skuCode) {
        log.info("Removing cart item for customer: {}, sku: {}", customerId, skuCode);
        String key = getCartKey(customerId);
        redisTemplate.opsForHash().delete(key, skuCode);

        syncToMongoAsync(customerId);

        CartResponse response = getCart(customerId);
        publishCartUpdatedEventAsync(customerId, "ITEM_REMOVED", response);
        return response;
    }

    public void clearCart(String customerId) {
        log.info("Clearing cart for customer: {}", customerId);
        String key = getCartKey(customerId);
        redisTemplate.delete(key);
        savedCartRepository.deleteByCustomerId(customerId);
        publishCartUpdatedEventAsync(customerId, "CART_CLEARED", buildResponse(customerId, Collections.emptyList()));
    }

    public CartResponse mergeGuestCart(String customerId, MergeCartRequest request) {
        log.info("Merging guest cart for customer: {}, items count: {}", customerId, request.items() != null ? request.items().size() : 0);
        if (request.items() != null) {
            String key = getCartKey(customerId);
            for (UpdateCartItemRequest guestItem : request.items()) {
                Object existing = redisTemplate.opsForHash().get(key, guestItem.skuCode());
                int newQty = guestItem.quantity();
                if (existing instanceof CartItem cur) {
                    newQty += cur.getQuantity();
                }
                CartItem merged = CartItem.builder()
                        .skuCode(guestItem.skuCode())
                        .productName(guestItem.productName())
                        .quantity(newQty)
                        .unitPrice(guestItem.unitPrice())
                        .imageUrl(guestItem.imageUrl())
                        .addedAt(Instant.now())
                        .build();
                redisTemplate.opsForHash().put(key, guestItem.skuCode(), merged);
            }
            redisTemplate.expire(key, CART_TTL);
            syncToMongoAsync(customerId);
        }
        CartResponse response = getCart(customerId);
        publishCartUpdatedEventAsync(customerId, "CART_MERGED", response);
        return response;
    }

    /**
     * Feature 4: Scheduled detection of abandoned saved carts in MongoDB.
     */
    @Scheduled(fixedDelayString = "${cart.abandoned.scan-interval-ms:30000}")
    public void detectAbandonedCarts() {
        Instant threshold = Instant.now().minusSeconds(abandonedThresholdSeconds);
        try {
            List<SavedCartEntity> candidates = savedCartRepository
                    .findByUpdatedAtBeforeAndAbandonedNotificationSentFalse(threshold);

            for (SavedCartEntity cart : candidates) {
                if (cart.getItems() != null && !cart.getItems().isEmpty()) {
                    publishCartAbandonedEvent(cart);
                }
            }
        } catch (Exception ex) {
            log.debug("Abandoned cart scan warning: {}", ex.getMessage());
        }
    }

    /**
     * On-demand trigger for Abandoned Cart Recovery (used by E2E tests and manual demo triggers).
     */
    public Map<String, Object> triggerAbandonedCartForCustomer(String customerId) {
        String effectiveCustomer = (customerId != null && !customerId.isBlank()) ? customerId : "usr_demo";
        Optional<SavedCartEntity> savedOpt = savedCartRepository.findByCustomerId(effectiveCustomer);

        SavedCartEntity cart;
        if (savedOpt.isPresent() && savedOpt.get().getItems() != null && !savedOpt.get().getItems().isEmpty()) {
            cart = savedOpt.get();
        } else {
            CartResponse current = getCart(effectiveCustomer);
            List<CartItem> items = new ArrayList<>();
            if (current.items() != null && !current.items().isEmpty()) {
                for (CartItemDto dto : current.items()) {
                    items.add(CartItem.builder()
                            .skuCode(dto.skuCode())
                            .productName(dto.productName())
                            .quantity(dto.quantity())
                            .unitPrice(dto.unitPrice())
                            .imageUrl(dto.imageUrl())
                            .addedAt(Instant.now())
                            .build());
                }
            } else {
                items.add(CartItem.builder()
                        .skuCode("IPHONE-16-PRO-256")
                        .productName("Apple iPhone 16 Pro 256GB")
                        .quantity(1)
                        .unitPrice(new BigDecimal("4899.00"))
                        .addedAt(Instant.now())
                        .build());
            }
            cart = savedOpt.orElseGet(() -> SavedCartEntity.builder()
                    .id(UUID.randomUUID())
                    .customerId(effectiveCustomer)
                    .build());
            cart.setItems(items);
            cart.setUpdatedAt(Instant.now().minusSeconds(abandonedThresholdSeconds + 10));
            savedCartRepository.save(cart);
        }

        CartAbandonedEvent published = publishCartAbandonedEvent(cart);
        return Map.of(
                "status", "ABANDONED_EVENT_PUBLISHED",
                "userId", published.userId(),
                "itemsCount", published.items().size(),
                "totalAmount", published.totalAmount(),
                "timestamp", published.timestamp().toString()
        );
    }

    private CartAbandonedEvent publishCartAbandonedEvent(SavedCartEntity cart) {
        BigDecimal total = BigDecimal.ZERO;
        List<CartAbandonedEvent.AbandonedCartItem> eventItems = new ArrayList<>();

        for (CartItem item : cart.getItems()) {
            BigDecimal price = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;
            total = total.add(price.multiply(BigDecimal.valueOf(item.getQuantity())));
            eventItems.add(new CartAbandonedEvent.AbandonedCartItem(
                    item.getSkuCode(),
                    item.getProductName(),
                    item.getQuantity(),
                    price
            ));
        }

        CartAbandonedEvent event = new CartAbandonedEvent(
                cart.getCustomerId(),
                eventItems,
                total,
                Instant.now()
        );

        cart.setAbandonedNotificationSent(true);
        savedCartRepository.save(cart);

        if (meterRegistry != null) {
            meterRegistry.counter("ecommerce_cart_abandoned_total").increment();
        }

        log.info("Publishing CartAbandonedEvent to Kafka topic '{}' for userId={}, total=₪{}",
                TOPIC_CART_EVENTS, cart.getCustomerId(), total);
        kafkaTemplate.send(TOPIC_CART_EVENTS, cart.getCustomerId(), event);
        return event;
    }

    private void publishCartUpdatedEventAsync(String customerId, String updateType, CartResponse cart) {
        try {
            List<CartUpdatedEvent.CartItemPayload> payloads = (cart != null && cart.items() != null)
                    ? cart.items().stream()
                            .map(item -> new CartUpdatedEvent.CartItemPayload(
                                    item.skuCode(),
                                    item.productName(),
                                    item.quantity(),
                                    item.unitPrice(),
                                    item.lineTotal(),
                                    item.imageUrl()
                            ))
                            .toList()
                    : Collections.emptyList();

            int totalItems = cart != null ? cart.totalItems() : 0;
            BigDecimal subtotal = cart != null ? cart.subtotalAmount() : BigDecimal.ZERO;
            String currency = (cart != null && cart.currency() != null) ? cart.currency() : "ILS";

            CartUpdatedEvent event = new CartUpdatedEvent(
                    customerId,
                    updateType,
                    payloads,
                    totalItems,
                    subtotal,
                    currency,
                    Instant.now()
            );

            if (meterRegistry != null) {
                meterRegistry.counter("ecommerce_cart_updated_total", "type", updateType).increment();
            }

            log.info("Publishing CartUpdatedEvent [{}] to Kafka topic '{}' for customerId={}, items={}, total=₪{}",
                    updateType, TOPIC_CART_EVENTS, customerId, totalItems, subtotal);

            // Asynchronous non-blocking dispatch with callback handling
            kafkaTemplate.send(TOPIC_CART_EVENTS, customerId, event)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.warn("Asynchronous Kafka publish failed for CartUpdatedEvent (customerId={}): {}",
                                    customerId, ex.getMessage());
                        } else {
                            log.debug("CartUpdatedEvent [{}] successfully published to Kafka topic '{}' for customerId={}",
                                    updateType, TOPIC_CART_EVENTS, customerId);
                        }
                    });
        } catch (Exception ex) {
            log.warn("Could not dispatch CartUpdatedEvent to Kafka topic '{}' for customer {}: {}",
                    TOPIC_CART_EVENTS, customerId, ex.getMessage());
        }
    }

    private void syncToMongoAsync(String customerId) {
        try {
            String key = getCartKey(customerId);
            Map<Object, Object> rawEntries = redisTemplate.opsForHash().entries(key);
            List<CartItem> items = new ArrayList<>();
            if (rawEntries != null) {
                for (Object val : rawEntries.values()) {
                    if (val instanceof CartItem item) {
                        items.add(item);
                    }
                }
            }
            Optional<SavedCartEntity> existing = savedCartRepository.findByCustomerId(customerId);
            SavedCartEntity entity = existing.orElseGet(() -> SavedCartEntity.builder()
                    .id(UUID.randomUUID())
                    .customerId(customerId)
                    .build());
            entity.setItems(items);
            entity.setUpdatedAt(Instant.now());
            entity.setAbandonedNotificationSent(false);
            savedCartRepository.save(entity);
        } catch (Exception ex) {
            log.warn("Failed to backup cart to MongoDB for customer {}: {}", customerId, ex.getMessage());
        }
    }

    private CartResponse buildResponse(String customerId, List<CartItem> items) {
        BigDecimal subtotal = BigDecimal.ZERO;
        int totalQuantity = 0;
        List<CartItemDto> dtoList = new ArrayList<>();

        for (CartItem item : items) {
            BigDecimal line = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(line);
            totalQuantity += item.getQuantity();
            dtoList.add(new CartItemDto(
                    item.getSkuCode(),
                    item.getProductName(),
                    item.getQuantity(),
                    item.getUnitPrice(),
                    line,
                    item.getImageUrl()
            ));
        }

        return new CartResponse(
                customerId,
                dtoList,
                totalQuantity,
                subtotal,
                "ILS",
                Instant.now()
        );
    }

    private String getCartKey(String customerId) {
        return CART_KEY_PREFIX + (customerId != null ? customerId : "guest");
    }
}
