package com.company.cartwishlistservice.service;

import com.company.cartwishlistservice.domain.model.CartItem;
import com.company.cartwishlistservice.dto.CartDtos.*;
import com.company.cartwishlistservice.repository.SavedCartRepository;
import com.company.common.events.CartUpdatedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private HashOperations<String, Object, Object> hashOperations;

    @Mock
    private SavedCartRepository savedCartRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private CartService cartService;

    @BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForHash()).thenReturn(hashOperations);
        cartService = new CartService(redisTemplate, savedCartRepository, kafkaTemplate);
    }

    @Test
    void upsertItem_publishesCartUpdatedEventToKafka() {
        String customerId = "usr_test123";
        UpdateCartItemRequest request = new UpdateCartItemRequest(
                "SKU-100",
                "Wireless Mouse",
                2,
                new BigDecimal("99.90"),
                "https://example.com/mouse.jpg"
        );

        CartItem itemInRedis = CartItem.builder()
                .skuCode(request.skuCode())
                .productName(request.productName())
                .quantity(request.quantity())
                .unitPrice(request.unitPrice())
                .imageUrl(request.imageUrl())
                .addedAt(Instant.now())
                .build();

        when(hashOperations.entries("cart:" + customerId)).thenReturn(Map.of(request.skuCode(), itemInRedis));
        when(kafkaTemplate.send(anyString(), anyString(), any())).thenReturn(CompletableFuture.completedFuture(null));

        CartResponse response = cartService.upsertItem(customerId, request);

        assertNotNull(response);
        assertEquals(1, response.items().size());
        assertEquals(2, response.totalItems());

        ArgumentCaptor<CartUpdatedEvent> eventCaptor = ArgumentCaptor.forClass(CartUpdatedEvent.class);
        verify(kafkaTemplate, times(1)).send(eq(CartService.TOPIC_CART_EVENTS), eq(customerId), eventCaptor.capture());

        CartUpdatedEvent capturedEvent = eventCaptor.getValue();
        assertEquals(customerId, capturedEvent.customerId());
        assertEquals("ITEM_UPSERTED", capturedEvent.updateType());
        assertEquals(2, capturedEvent.totalItems());
        assertEquals(new BigDecimal("199.80"), capturedEvent.subtotalAmount());
        assertEquals(1, capturedEvent.items().size());
        assertEquals("SKU-100", capturedEvent.items().get(0).skuCode());
    }

    @Test
    void removeItem_publishesCartUpdatedEvent() {
        String customerId = "usr_test123";
        String skuCode = "SKU-100";

        when(hashOperations.entries("cart:" + customerId)).thenReturn(Collections.emptyMap());
        when(kafkaTemplate.send(anyString(), anyString(), any())).thenReturn(CompletableFuture.completedFuture(null));

        CartResponse response = cartService.removeItem(customerId, skuCode);

        assertNotNull(response);
        assertEquals(0, response.totalItems());

        ArgumentCaptor<CartUpdatedEvent> eventCaptor = ArgumentCaptor.forClass(CartUpdatedEvent.class);
        verify(kafkaTemplate, times(1)).send(eq(CartService.TOPIC_CART_EVENTS), eq(customerId), eventCaptor.capture());

        CartUpdatedEvent capturedEvent = eventCaptor.getValue();
        assertEquals("ITEM_REMOVED", capturedEvent.updateType());
        assertEquals(0, capturedEvent.totalItems());
    }

    @Test
    void upsertItem_gracefullyHandlesKafkaFailureWithoutFailingApi() {
        String customerId = "usr_test123";
        UpdateCartItemRequest request = new UpdateCartItemRequest(
                "SKU-200",
                "Keyboard",
                1,
                new BigDecimal("150.00"),
                null
        );

        when(hashOperations.entries("cart:" + customerId)).thenReturn(Collections.emptyMap());
        // Simulate Kafka sending throwing a runtime exception
        when(kafkaTemplate.send(anyString(), anyString(), any())).thenThrow(new RuntimeException("Kafka broker unreachable"));

        // Must succeed without throwing
        CartResponse response = assertDoesNotThrow(() -> cartService.upsertItem(customerId, request));
        assertNotNull(response);
    }
}
