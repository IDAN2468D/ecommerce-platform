package com.company.dynamicpricingservice.repository;

import com.company.dynamicpricingservice.domain.entity.PriceWatchRuleEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PriceWatchRuleRepository extends MongoRepository<PriceWatchRuleEntity, String> {
    List<PriceWatchRuleEntity> findByCustomerIdOrderByCreatedAtDesc(String customerId);
    List<PriceWatchRuleEntity> findBySkuCodeAndStatus(String skuCode, String status);
    Optional<PriceWatchRuleEntity> findByRuleId(String ruleId);
}
