package com.company.orderservice.service;

import com.company.common.events.CartAbandonedEvent;
import com.company.common.events.NotificationSentEvent;
import com.company.orderservice.domain.entity.CouponEntity;
import com.company.orderservice.dto.request.ValidateCouponRequest;
import com.company.orderservice.dto.response.CouponValidationResponse;
import com.company.orderservice.repository.CouponRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CouponAbandonedCartTest {

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private CouponService couponService;

    @BeforeEach
    void setUp() {
        couponService = new CouponService(couponRepository);
        couponService.setKafkaTemplate(kafkaTemplate);
    }

    @Test
    void handleCartAbandoned_createsDynamicCouponAndPublishesNotification() {
        CartAbandonedEvent event = new CartAbandonedEvent(
                "usr_demo",
                List.of(new CartAbandonedEvent.AbandonedCartItem("SONY-WH-1000XM5", "Sony WH-1000XM5", 1, new BigDecimal("1450.00"))),
                new BigDecimal("1450.00"),
                Instant.now()
        );

        when(couponRepository.save(any(CouponEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        couponService.handleCartAbandoned(event);

        ArgumentCaptor<CouponEntity> couponCaptor = ArgumentCaptor.forClass(CouponEntity.class);
        verify(couponRepository, times(1)).save(couponCaptor.capture());

        CouponEntity savedCoupon = couponCaptor.getValue();
        assertTrue(savedCoupon.getCode().startsWith("SAVE15-"));
        assertEquals(BigDecimal.valueOf(15), savedCoupon.getDiscountValue());
        assertTrue(savedCoupon.getValidUntil().isAfter(Instant.now()));

        ArgumentCaptor<NotificationSentEvent> notifCaptor = ArgumentCaptor.forClass(NotificationSentEvent.class);
        verify(kafkaTemplate, times(1)).send(eq("notification-events"), eq("usr_demo"), notifCaptor.capture());
        assertEquals(savedCoupon.getCode(), notifCaptor.getValue().referenceId());

        // Validate that the newly generated coupon validates cleanly
        when(couponRepository.findByCodeIgnoreCase(savedCoupon.getCode())).thenReturn(Optional.of(savedCoupon));
        CouponValidationResponse valRes = couponService.validateCoupon(
                new ValidateCouponRequest(savedCoupon.getCode(), new BigDecimal("1000.00"))
        );
        assertTrue(valRes.valid());
        assertEquals(new BigDecimal("150.00"), valRes.discountAmount());
        assertEquals(new BigDecimal("850.00"), valRes.finalAmount());
    }
}
