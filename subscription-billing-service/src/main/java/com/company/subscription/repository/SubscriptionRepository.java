package com.company.subscription.repository;

import com.company.subscription.domain.Subscription;
import com.company.subscription.domain.SubscriptionStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends MongoRepository<Subscription, String> {
    List<Subscription> findByCustomerIdOrderByCreatedAtDesc(String customerId);
    Optional<Subscription> findBySubscriptionNumber(String subscriptionNumber);
    List<Subscription> findByStatusAndNextBillingDateBefore(SubscriptionStatus status, Instant cutoff);
}
