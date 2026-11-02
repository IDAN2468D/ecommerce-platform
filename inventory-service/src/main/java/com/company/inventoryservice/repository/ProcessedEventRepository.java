package com.company.inventoryservice.repository;

import com.company.inventoryservice.domain.entity.ProcessedEventEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessedEventRepository extends MongoRepository<ProcessedEventEntity, String> {
}
