package com.company.reviewratingservice.repository;

import com.company.reviewratingservice.domain.entity.VerifiedBuyerEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VerifiedBuyerRepository extends MongoRepository<VerifiedBuyerEntity, UUID> {
    boolean existsByCustomerIdAndSkuCode(String customerId, String skuCode);
    List<VerifiedBuyerEntity> findByCustomerId(String customerId);
}
