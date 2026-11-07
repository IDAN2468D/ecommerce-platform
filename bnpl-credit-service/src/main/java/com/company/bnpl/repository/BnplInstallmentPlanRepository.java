package com.company.bnpl.repository;

import com.company.bnpl.domain.BnplInstallmentPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BnplInstallmentPlanRepository extends MongoRepository<BnplInstallmentPlan, String> {
    List<BnplInstallmentPlan> findByCustomerIdOrderByCreatedAtDesc(String customerId);
    Optional<BnplInstallmentPlan> findByPlanNumber(String planNumber);
}
