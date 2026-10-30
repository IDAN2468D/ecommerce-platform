package com.company.cartwishlistservice.repository;

import com.company.cartwishlistservice.domain.entity.WishlistEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WishlistRepository extends MongoRepository<WishlistEntity, UUID> {
    Optional<WishlistEntity> findByCustomerId(String customerId);
}
