package com.company.inventoryservice.repository;

import com.company.inventoryservice.domain.entity.InventoryEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends MongoRepository<InventoryEntity, UUID> {

    default Optional<InventoryEntity> findBySkuCodeForUpdate(String skuCode) {
        return findBySkuCode(skuCode);
    }

    Optional<InventoryEntity> findBySkuCode(String skuCode);

    List<InventoryEntity> findAllByOrderByProductNameAsc();

    List<InventoryEntity> findByCategoryIgnoreCase(String category);
}
