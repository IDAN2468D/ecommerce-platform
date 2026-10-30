package com.company.recommendationloyaltyservice.repository;

import com.company.recommendationloyaltyservice.domain.entity.LoyaltyWalletEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoyaltyWalletRepository extends MongoRepository<LoyaltyWalletEntity, UUID> {
    Optional<LoyaltyWalletEntity> findByCustomerId(String customerId);
}
