package com.company.merchantanalyticsservice.repository;

import com.company.merchantanalyticsservice.domain.entity.AnalyticsDailyKpiEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface AnalyticsDailyKpiRepository extends MongoRepository<AnalyticsDailyKpiEntity, String> {
    Optional<AnalyticsDailyKpiEntity> findByDate(LocalDate date);
}
