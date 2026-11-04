package com.company.rmareturnsservice.repository;

import com.company.rmareturnsservice.domain.entity.ReturnRequestEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReturnRequestRepository extends MongoRepository<ReturnRequestEntity, String> {
    Optional<ReturnRequestEntity> findByRmaNumber(String rmaNumber);
    List<ReturnRequestEntity> findByCustomerIdOrderByCreatedAtDesc(String customerId);
}
