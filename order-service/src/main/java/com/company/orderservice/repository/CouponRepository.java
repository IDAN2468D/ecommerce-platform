package com.company.orderservice.repository;

import com.company.orderservice.domain.entity.CouponEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CouponRepository extends MongoRepository<CouponEntity, UUID> {
    Optional<CouponEntity> findByCodeIgnoreCase(String code);
}
