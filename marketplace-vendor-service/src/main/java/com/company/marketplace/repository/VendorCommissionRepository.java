package com.company.marketplace.repository;

import com.company.marketplace.domain.VendorCommission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorCommissionRepository extends MongoRepository<VendorCommission, String> {
    List<VendorCommission> findByVendorIdOrderByCreatedAtDesc(String vendorId);
}
