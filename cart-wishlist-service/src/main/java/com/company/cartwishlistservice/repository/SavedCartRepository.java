package com.company.cartwishlistservice.repository;

import com.company.cartwishlistservice.domain.entity.SavedCartEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedCartRepository extends MongoRepository<SavedCartEntity, UUID> {
    Optional<SavedCartEntity> findByCustomerId(String customerId);
    void deleteByCustomerId(String customerId);
    List<SavedCartEntity> findByUpdatedAtBeforeAndAbandonedNotificationSentFalse(Instant threshold);
}
