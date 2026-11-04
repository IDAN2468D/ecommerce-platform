package com.company.merchantanalyticsservice.repository;

import com.company.merchantanalyticsservice.domain.entity.SkuDepletionForecastEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkuDepletionForecastRepository extends MongoRepository<SkuDepletionForecastEntity, String> {
    Optional<SkuDepletionForecastEntity> findBySkuCode(String skuCode);
    List<SkuDepletionForecastEntity> findAllByOrderByPredictedDaysUntilDepletionAsc();
    List<SkuDepletionForecastEntity> findByRestockUrgencyOrderByPredictedDaysUntilDepletionAsc(String urgency);
}
