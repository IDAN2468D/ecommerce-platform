package com.company.dynamicpricingservice.repository;

import com.company.dynamicpricingservice.domain.entity.PriceHistoryLedgerEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface PriceHistoryRepository extends MongoRepository<PriceHistoryLedgerEntity, String> {
    List<PriceHistoryLedgerEntity> findBySkuCodeAndRecordedAtAfterOrderByRecordedAtAsc(String skuCode, Instant after);
    List<PriceHistoryLedgerEntity> findBySkuCodeOrderByRecordedAtDesc(String skuCode);
}
