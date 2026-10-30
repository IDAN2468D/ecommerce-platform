package com.company.shippingservice.repository;

import com.company.shippingservice.domain.entity.ShipmentEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShipmentRepository extends MongoRepository<ShipmentEntity, UUID> {
    Optional<ShipmentEntity> findByOrderId(UUID orderId);
    Optional<ShipmentEntity> findByTrackingNumber(String trackingNumber);
    List<ShipmentEntity> findByCustomerIdOrderByCreatedAtDesc(String customerId);
}
