package com.company.fraudriskservice.repository;

import com.company.fraudriskservice.domain.entity.FraudAssessmentEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FraudAssessmentRepository extends MongoRepository<FraudAssessmentEntity, String> {
    Optional<FraudAssessmentEntity> findByOrderId(UUID orderId);
    List<FraudAssessmentEntity> findByRiskScoreGreaterThanEqualOrderByEvaluatedAtDesc(Integer riskScore);
    List<FraudAssessmentEntity> findTop20ByOrderByEvaluatedAtDesc();
}
