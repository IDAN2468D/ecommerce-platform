package com.company.inventoryservice.repository;

import com.company.inventoryservice.domain.entity.OutboxEventEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OutboxEventRepository extends MongoRepository<OutboxEventEntity, UUID> {
    List<OutboxEventEntity> findByStatusOrderByCreatedAtAsc(String status);
    List<OutboxEventEntity> findTop50ByOrderByCreatedAtDesc();
}
