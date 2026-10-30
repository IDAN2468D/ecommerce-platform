package com.company.paymentservice.repository;

import com.company.paymentservice.domain.entity.PaymentTransactionEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends MongoRepository<PaymentTransactionEntity, UUID> {
    Optional<PaymentTransactionEntity> findByIdempotencyKey(String idempotencyKey);
}
