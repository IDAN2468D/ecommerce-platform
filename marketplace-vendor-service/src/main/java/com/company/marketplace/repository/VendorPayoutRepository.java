package com.company.marketplace.repository;

import com.company.marketplace.domain.VendorPayout;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorPayoutRepository extends MongoRepository<VendorPayout, String> {
    List<VendorPayout> findByVendorIdOrderByRequestedAtDesc(String vendorId);
}
