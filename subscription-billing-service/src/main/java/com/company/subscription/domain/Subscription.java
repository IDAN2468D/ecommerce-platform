package com.company.subscription.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "subscriptions")
public class Subscription {

    @Id
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
    private String paymentMethodToken;
    private String shippingAddress;
    private Instant startDate;
    private Instant nextBillingDate;
    private Instant lastBillingDate;
    private int totalCyclesBilled;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
