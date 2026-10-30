package com.company.reviewratingservice.repository;

import com.company.reviewratingservice.domain.entity.ProductReviewEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductReviewRepository extends MongoRepository<ProductReviewEntity, UUID> {
    List<ProductReviewEntity> findBySkuCodeOrderByCreatedAtDesc(String skuCode);
    boolean existsByCustomerIdAndSkuCode(String customerId, String skuCode);
    long countBySkuCode(String skuCode);
}
