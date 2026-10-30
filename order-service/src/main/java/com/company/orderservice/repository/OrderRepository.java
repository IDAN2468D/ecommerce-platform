package com.company.orderservice.repository;

import com.company.orderservice.domain.entity.OrderEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends MongoRepository<OrderEntity, UUID> {

    Optional<OrderEntity> findByIdempotencyKey(String idempotencyKey);

    Page<OrderEntity> findByCustomerId(String customerId, Pageable pageable);

    Optional<OrderEntity> findByIdAndCustomerId(UUID id, String customerId);
}
