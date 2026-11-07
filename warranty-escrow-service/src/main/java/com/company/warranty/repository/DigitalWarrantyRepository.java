package com.company.warranty.repository;

import com.company.warranty.domain.DigitalWarrantyCertificate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DigitalWarrantyRepository extends MongoRepository<DigitalWarrantyCertificate, String> {
    List<DigitalWarrantyCertificate> findByCustomerIdOrderByIssuedAtDesc(String customerId);
    Optional<DigitalWarrantyCertificate> findByCertificateNumber(String certificateNumber);
}
