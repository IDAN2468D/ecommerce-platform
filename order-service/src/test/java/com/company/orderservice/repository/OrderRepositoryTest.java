package com.company.orderservice.repository;

import com.company.orderservice.config.MongoConfig;
import com.company.orderservice.domain.entity.OrderEntity;
import com.company.orderservice.domain.entity.OrderItemEntity;
import com.company.orderservice.domain.enums.OrderStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataMongoTest
@Import(MongoConfig.class)
@ActiveProfiles("test")
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
    }

    @Test
    @DisplayName("Save and find order by idempotency key with embedded items")
    void saveAndFindByIdempotencyKey() {
        OrderEntity order = OrderEntity.builder()
                .customerId("usr_test_1")
                .idempotencyKey("idemp_unique_key_1")
                .status(OrderStatus.CONFIRMED)
                .totalAmount(new BigDecimal("1200.00"))
                .currency("ILS")
                .build();

        OrderItemEntity item = OrderItemEntity.builder()
                .skuCode("IPHONE-16")
                .quantity(1)
                .unitPrice(new BigDecimal("1200.00"))
                .build();

        order.addItem(item);

        OrderEntity saved = orderRepository.save(order);

        Optional<OrderEntity> found = orderRepository.findByIdempotencyKey("idemp_unique_key_1");
        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(saved.getId());
        assertThat(found.get().getCustomerId()).isEqualTo("usr_test_1");
        assertThat(found.get().getItems()).hasSize(1);
        assertThat(found.get().getItems().getFirst().getSkuCode()).isEqualTo("IPHONE-16");
    }

    @Test
    @DisplayName("Unique idempotency key constraint violation")
    void duplicateIdempotencyKey_ThrowsException() {
        OrderEntity order1 = OrderEntity.builder()
                .customerId("usr_test_1")
                .idempotencyKey("duplicate_key")
                .status(OrderStatus.CONFIRMED)
                .totalAmount(new BigDecimal("100.00"))
                .currency("ILS")
                .build();
        orderRepository.save(order1);

        OrderEntity order2 = OrderEntity.builder()
                .customerId("usr_test_2")
                .idempotencyKey("duplicate_key")
                .status(OrderStatus.CONFIRMED)
                .totalAmount(new BigDecimal("200.00"))
                .currency("ILS")
                .build();

        assertThatThrownBy(() -> orderRepository.save(order2))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("Pagination by customerId returns correct page slice")
    void findByCustomerId_Paginated() {
        for (int i = 0; i < 5; i++) {
            OrderEntity order = OrderEntity.builder()
                    .customerId("usr_paginated")
                    .idempotencyKey("key_page_" + i)
                    .status(OrderStatus.CONFIRMED)
                    .totalAmount(new BigDecimal("100.00"))
                    .currency("ILS")
                    .build();
            orderRepository.save(order);
        }

        Page<OrderEntity> page = orderRepository.findByCustomerId("usr_paginated", PageRequest.of(0, 2));

        assertThat(page.getTotalElements()).isEqualTo(5);
        assertThat(page.getContent()).hasSize(2);
        assertThat(page.getTotalPages()).isEqualTo(3);
    }

    @Test
    @DisplayName("Optimistic locking: version starts at 0 and increments on update")
    void optimisticLocking_VersionIncrements() {
        OrderEntity order = OrderEntity.builder()
                .customerId("usr_opt_lock")
                .idempotencyKey("key_opt_1")
                .status(OrderStatus.PENDING)
                .totalAmount(new BigDecimal("50.00"))
                .currency("ILS")
                .build();

        OrderEntity saved = orderRepository.save(order);
        assertThat(saved.getVersion()).isEqualTo(0L);

        saved.setStatus(OrderStatus.CONFIRMED);
        OrderEntity updated = orderRepository.save(saved);
        assertThat(updated.getVersion()).isEqualTo(1L);
    }
}
