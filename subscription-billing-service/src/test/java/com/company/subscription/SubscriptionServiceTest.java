package com.company.subscription;

import com.company.subscription.domain.BillingInterval;
import com.company.subscription.domain.Subscription;
import com.company.subscription.domain.SubscriptionItem;
import com.company.subscription.domain.SubscriptionStatus;
import com.company.subscription.dto.CreateSubscriptionRequest;
import com.company.subscription.dto.SubscriptionResponse;
import com.company.subscription.repository.SubscriptionRepository;
import com.company.subscription.service.SubscriptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubscriptionServiceTest {

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private SubscriptionService subscriptionService;

    @BeforeEach
    void setUp() {
        subscriptionService = new SubscriptionService(subscriptionRepository, kafkaTemplate);
    }

    @Test
    void createSubscription_Success_AppliesRecurringDiscount() {
        CreateSubscriptionRequest request = CreateSubscriptionRequest.builder()
                .customerId("usr_test_1")
                .customerEmail("test@example.com")
                .billingInterval(BillingInterval.MONTHLY)
                .items(List.of(
                        SubscriptionItem.builder()
                                .skuCode("COFFEE-BEANS-1KG")
                                .productName("פולי קפה אספרסו פרימיום")
                                .baseUnitPrice(BigDecimal.valueOf(100.00))
                                .quantity(2)
                                .build()
                ))
                .build();

        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(invocation -> {
            Subscription s = invocation.getArgument(0);
            s.setId("sub_123");
            return s;
        });

        SubscriptionResponse response = subscriptionService.createSubscription(request);

        assertNotNull(response);
        assertEquals("sub_123", response.getId());
        assertEquals(SubscriptionStatus.ACTIVE, response.getStatus());
        assertEquals(15, response.getDiscountPercent()); // 15% discount for monthly
        assertEquals(BigDecimal.valueOf(170.00).setScale(2), response.getRecurringAmount()); // 200 - 15% = 170
        assertEquals(BigDecimal.valueOf(30.00).setScale(2), response.getSavingsPerCycle());
        verify(subscriptionRepository).save(any(Subscription.class));
    }

    @Test
    void pauseAndResumeSubscription_Success() {
        Subscription sub = Subscription.builder()
                .id("sub_abc")
                .status(SubscriptionStatus.ACTIVE)
                .build();

        when(subscriptionRepository.findById("sub_abc")).thenReturn(Optional.of(sub));
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(inv -> inv.getArgument(0));

        SubscriptionResponse paused = subscriptionService.pauseSubscription("sub_abc");
        assertEquals(SubscriptionStatus.PAUSED, paused.getStatus());

        SubscriptionResponse resumed = subscriptionService.resumeSubscription("sub_abc");
        assertEquals(SubscriptionStatus.ACTIVE, resumed.getStatus());
    }

    @Test
    void triggerRenewal_Success_IncrementsCycle() {
        Subscription sub = Subscription.builder()
                .id("sub_renew")
                .subscriptionNumber("SUB-IL-100")
                .billingInterval(BillingInterval.MONTHLY)
                .recurringAmount(BigDecimal.valueOf(150))
                .totalCyclesBilled(1)
                .startDate(Instant.now())
                .nextBillingDate(Instant.now())
                .status(SubscriptionStatus.ACTIVE)
                .build();

        when(subscriptionRepository.findById("sub_renew")).thenReturn(Optional.of(sub));
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(inv -> inv.getArgument(0));

        SubscriptionResponse renewed = subscriptionService.triggerRenewal("sub_renew");
        assertEquals(2, renewed.getTotalCyclesBilled());
    }
}
