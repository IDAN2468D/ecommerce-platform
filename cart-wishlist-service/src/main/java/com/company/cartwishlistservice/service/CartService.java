package com.company.cartwishlistservice.service;

import com.company.cartwishlistservice.domain.entity.SavedCartEntity;
import com.company.cartwishlistservice.domain.model.CartItem;
import com.company.cartwishlistservice.dto.CartDtos.*;
import com.company.cartwishlistservice.repository.SavedCartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final SavedCartRepository savedCartRepository;

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
            // Fallback to MongoDB if Redis expired/cleared
            Optional<SavedCartEntity> savedOpt = savedCartRepository.findByCustomerId(customerId);
            if (savedOpt.isPresent()) {
                items = savedOpt.get().getItems();
                // Repopulate Redis
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

        // Sync to MongoDB
        syncToMongoAsync(customerId);

        return getCart(customerId);
    }

    public CartResponse removeItem(String customerId, String skuCode) {
        log.info("Removing cart item for customer: {}, sku: {}", customerId, skuCode);
        String key = getCartKey(customerId);
        redisTemplate.opsForHash().delete(key, skuCode);

        // Sync to MongoDB
        syncToMongoAsync(customerId);

        return getCart(customerId);
    }

    public void clearCart(String customerId) {
        log.info("Clearing cart for customer: {}", customerId);
        String key = getCartKey(customerId);
        redisTemplate.delete(key);
        savedCartRepository.deleteByCustomerId(customerId);
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
        return getCart(customerId);
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
