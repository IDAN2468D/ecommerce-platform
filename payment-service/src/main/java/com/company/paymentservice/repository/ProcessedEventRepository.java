package com.company.paymentservice.repository;

import com.company.paymentservice.domain.entity.ProcessedEventEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessedEventRepository extends MongoRepository<ProcessedEventEntity, String> {
}

