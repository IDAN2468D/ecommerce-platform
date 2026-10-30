package com.company.paymentservice.repository;

import com.company.paymentservice.domain.entity.PaymentRefundEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RefundRepository extends MongoRepository<PaymentRefundEntity, UUID> {
    List<PaymentRefundEntity> findByTransactionId(UUID transactionId);
}
