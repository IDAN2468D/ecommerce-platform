package com.company.sustainability.repository;

import com.company.sustainability.domain.CarbonFootprintAssessment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarbonFootprintAssessmentRepository extends MongoRepository<CarbonFootprintAssessment, String> {
}
