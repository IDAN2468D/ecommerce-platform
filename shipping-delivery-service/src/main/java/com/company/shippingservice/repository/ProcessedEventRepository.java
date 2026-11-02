package com.company.shippingservice.repository;

import com.company.shippingservice.domain.entity.ProcessedEventEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessedEventRepository extends MongoRepository<ProcessedEventEntity, String> {
}

