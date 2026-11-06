package com.company.marketplace.repository;

import com.company.marketplace.domain.Vendor;
import com.company.marketplace.domain.VendorStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorRepository extends MongoRepository<Vendor, String> {
    Optional<Vendor> findByVendorCode(String vendorCode);
    Optional<Vendor> findBySlug(String slug);
    List<Vendor> findByStatusOrderByRatingDesc(VendorStatus status);
}
