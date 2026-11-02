package com.company.reviewratingservice.repository;

import com.company.reviewratingservice.domain.entity.ProductReviewAiSummaryEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductReviewAiSummaryRepository extends MongoRepository<ProductReviewAiSummaryEntity, UUID> {
    Optional<ProductReviewAiSummaryEntity> findBySkuCode(String skuCode);
}
