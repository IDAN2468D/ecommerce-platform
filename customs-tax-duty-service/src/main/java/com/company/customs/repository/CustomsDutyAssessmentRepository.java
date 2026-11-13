package com.company.customs.repository;

import com.company.customs.domain.CustomsDutyAssessment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomsDutyAssessmentRepository extends MongoRepository<CustomsDutyAssessment, String> {
}
