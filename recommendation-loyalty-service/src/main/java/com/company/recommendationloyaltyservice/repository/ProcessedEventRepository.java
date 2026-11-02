package com.company.recommendationloyaltyservice.repository;

import com.company.recommendationloyaltyservice.domain.entity.ProcessedEventEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessedEventRepository extends MongoRepository<ProcessedEventEntity, String> {
}

