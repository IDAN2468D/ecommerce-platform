package com.company.subscription.service;

import com.company.subscription.domain.BillingInterval;
import com.company.subscription.domain.Subscription;
import com.company.subscription.domain.SubscriptionItem;
import com.company.subscription.domain.SubscriptionStatus;
import com.company.subscription.dto.CreateSubscriptionRequest;
import com.company.subscription.dto.SubscriptionResponse;
import com.company.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public SubscriptionResponse createSubscription(CreateSubscriptionRequest request) {
        log.info("Creating subscription for customer: {}", request.getCustomerId());

        int discountPercent = request.getBillingInterval().getDefaultDiscountPercent();
        BigDecimal discountMultiplier = BigDecimal.valueOf(100 - discountPercent)
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

        BigDecimal baseTotal = BigDecimal.ZERO;
        BigDecimal discountedTotal = BigDecimal.ZERO;

        for (SubscriptionItem item : request.getItems()) {
            BigDecimal itemBase = item.getBaseUnitPrice() != null ? item.getBaseUnitPrice() : BigDecimal.valueOf(100);
            BigDecimal itemDiscounted = itemBase.multiply(discountMultiplier).setScale(2, RoundingMode.HALF_UP);
            item.setBaseUnitPrice(itemBase);
            item.setDiscountedUnitPrice(itemDiscounted);

            BigDecimal qty = BigDecimal.valueOf(item.getQuantity() > 0 ? item.getQuantity() : 1);
            baseTotal = baseTotal.add(itemBase.multiply(qty));
            discountedTotal = discountedTotal.add(itemDiscounted.multiply(qty));
        }

        BigDecimal savingsPerCycle = baseTotal.subtract(discountedTotal).setScale(2, RoundingMode.HALF_UP);

        Instant now = Instant.now();
        Instant nextBilling = now.plus(request.getBillingInterval().getDays(), ChronoUnit.DAYS);
        String subNumber = "SUB-IL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Subscription subscription = Subscription.builder()
                .subscriptionNumber(subNumber)
                .customerId(request.getCustomerId())
                .customerEmail(request.getCustomerEmail() != null ? request.getCustomerEmail() : "idankzm@gmail.com")
                .planName(request.getPlanName() != null ? request.getPlanName() : "אספקה קבועה " + request.getBillingInterval().name())
                .billingInterval(request.getBillingInterval())
                .status(SubscriptionStatus.ACTIVE)
                .items(request.getItems())
                .recurringAmount(discountedTotal)
                .savingsPerCycle(savingsPerCycle)
                .discountPercent(discountPercent)
                .paymentMethodToken(request.getPaymentMethodToken() != null ? request.getPaymentMethodToken() : "pm_card_default")
                .shippingAddress(request.getShippingAddress() != null ? request.getShippingAddress() : "תל אביב, ישראל")
                .startDate(now)
                .nextBillingDate(nextBilling)
                .lastBillingDate(now)
                .totalCyclesBilled(1)
                .build();

        Subscription saved = subscriptionRepository.save(subscription);
        log.info("Subscription created: {} with recurring amount: ₪{}", saved.getSubscriptionNumber(), saved.getRecurringAmount());

        try {
            kafkaTemplate.send("subscription-events", saved.getSubscriptionNumber(), "SUBSCRIPTION_CREATED:" + saved.getId());
        } catch (Exception e) {
            log.warn("Kafka notification skipped: {}", e.getMessage());
        }

        return SubscriptionResponse.fromEntity(saved);
    }

    public List<SubscriptionResponse> getCustomerSubscriptions(String customerId) {
        return subscriptionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(SubscriptionResponse::fromEntity)
                .toList();
    }

    public SubscriptionResponse getSubscriptionById(String id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found: " + id));
        return SubscriptionResponse.fromEntity(sub);
    }

    public SubscriptionResponse pauseSubscription(String id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found: " + id));
        sub.setStatus(SubscriptionStatus.PAUSED);
        return SubscriptionResponse.fromEntity(subscriptionRepository.save(sub));
    }

    public SubscriptionResponse resumeSubscription(String id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found: " + id));
        sub.setStatus(SubscriptionStatus.ACTIVE);
        return SubscriptionResponse.fromEntity(subscriptionRepository.save(sub));
    }

    public SubscriptionResponse cancelSubscription(String id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found: " + id));
        sub.setStatus(SubscriptionStatus.CANCELLED);
        return SubscriptionResponse.fromEntity(subscriptionRepository.save(sub));
    }

    public SubscriptionResponse triggerRenewal(String id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found: " + id));

        Instant now = Instant.now();
        sub.setLastBillingDate(now);
        sub.setNextBillingDate(now.plus(sub.getBillingInterval().getDays(), ChronoUnit.DAYS));
        sub.setTotalCyclesBilled(sub.getTotalCyclesBilled() + 1);

        Subscription updated = subscriptionRepository.save(sub);
        log.info("Subscription {} renewed! Cycle #{}", updated.getSubscriptionNumber(), updated.getTotalCyclesBilled());

        try {
            kafkaTemplate.send("subscription-renewals", updated.getSubscriptionNumber(), "RENEWAL_COMPLETED:₪" + updated.getRecurringAmount());
        } catch (Exception e) {
            log.warn("Kafka renewal notification skipped: {}", e.getMessage());
        }

        return SubscriptionResponse.fromEntity(updated);
    }
}
