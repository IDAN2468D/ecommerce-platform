package com.company.fraudriskservice.repository;

import com.company.fraudriskservice.domain.entity.FraudAuditLogEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FraudAuditLogRepository extends MongoRepository<FraudAuditLogEntity, String> {
    List<FraudAuditLogEntity> findByCustomerIdOrderByLoggedAtDesc(String customerId);
}
