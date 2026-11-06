package com.company.subscription.dto;

import com.company.subscription.domain.BillingInterval;
import com.company.subscription.domain.Subscription;
import com.company.subscription.domain.SubscriptionItem;
import com.company.subscription.domain.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponse {
    private String id;
    private String subscriptionNumber;
    private String customerId;
    private String customerEmail;
    private String planName;
    private BillingInterval billingInterval;
    private SubscriptionStatus status;
    private List<SubscriptionItem> items;
    private BigDecimal recurringAmount;
    private BigDecimal savingsPerCycle;
    private int discountPercent;
    private Instant startDate;
    private Instant nextBillingDate;
    private Instant lastBillingDate;
    private int totalCyclesBilled;
    private Instant createdAt;

    public static SubscriptionResponse fromEntity(Subscription s) {
        return SubscriptionResponse.builder()
                .id(s.getId())
                .subscriptionNumber(s.getSubscriptionNumber())
                .customerId(s.getCustomerId())
                .customerEmail(s.getCustomerEmail())
                .planName(s.getPlanName())
                .billingInterval(s.getBillingInterval())
                .status(s.getStatus())
                .items(s.getItems())
                .recurringAmount(s.getRecurringAmount())
                .savingsPerCycle(s.getSavingsPerCycle())
                .discountPercent(s.getDiscountPercent())
                .startDate(s.getStartDate())
                .nextBillingDate(s.getNextBillingDate())
                .lastBillingDate(s.getLastBillingDate())
                .totalCyclesBilled(s.getTotalCyclesBilled())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
