package com.company.ragservice.repository;

import com.company.ragservice.entity.CatalogVectorDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CatalogVectorRepository extends MongoRepository<CatalogVectorDocument, String> {
    Optional<CatalogVectorDocument> findBySkuCode(String skuCode);
    void deleteBySkuCode(String skuCode);
}
