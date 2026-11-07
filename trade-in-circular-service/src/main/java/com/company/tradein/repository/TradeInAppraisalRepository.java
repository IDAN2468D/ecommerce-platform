package com.company.tradein.repository;

import com.company.tradein.domain.TradeInAppraisal;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradeInAppraisalRepository extends MongoRepository<TradeInAppraisal, String> {
    List<TradeInAppraisal> findByCustomerIdOrderByCreatedAtDesc(String customerId);
}
