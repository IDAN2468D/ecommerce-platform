package com.company.orderservice.service;

import com.company.common.events.CartAbandonedEvent;
import com.company.common.events.EventIdempotencyKeyResolver;
import com.company.common.events.InboxIdempotencyTracker;
import com.company.common.events.NotificationSentEvent;
import com.company.orderservice.domain.entity.CouponEntity;
import com.company.orderservice.domain.enums.CouponType;
import com.company.orderservice.dto.request.ValidateCouponRequest;
import com.company.orderservice.dto.response.CouponValidationResponse;
import com.company.orderservice.repository.CouponRepository;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class CouponService {

    private static final String CONSUMER_GROUP = "order-service-abandoned-cart-group";

    private final CouponRepository couponRepository;
    private KafkaTemplate<String, Object> kafkaTemplate;
    private MeterRegistry meterRegistry;
    private final InboxIdempotencyTracker inboxTracker = new InboxIdempotencyTracker(CONSUMER_GROUP);

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @Autowired(required = false)
    public void setKafkaTemplate(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Autowired(required = false)
    public void setMeterRegistry(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    public record CouponApplicationResult(
            String couponCode,
            BigDecimal discountAmount,
            BigDecimal finalAmount) {
    }

    @KafkaListener(topics = "cart-events", groupId = CONSUMER_GROUP)
    public void handleCartAbandoned(
            Object rawEvent,
            @Header(name = EventIdempotencyKeyResolver.HEADER_EVENT_ID, required = false) String eventIdHeader) {
        if (!(rawEvent instanceof CartAbandonedEvent event)) {
            log.debug("CouponService: ignoring non-abandoned event on cart-events: {}",
                    rawEvent != null ? rawEvent.getClass().getSimpleName() : "null");
            return;
        }
        if (event.customerId() == null) {
            return;
        }
        if (!inboxTracker.tryAcquire(event, eventIdHeader, null)) {
            log.info("Inbox Idempotency: Skipping duplicate CartAbandonedEvent for customer={}", event.customerId());
            return;
        }
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 4).toUpperCase();
        String dynamicCode = "SAVE15-" + suffix;

        CouponEntity coupon = CouponEntity.builder()
                .id(UUID.randomUUID())
                .code(dynamicCode)
                .discountType(CouponType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(15))
                .minOrderAmount(BigDecimal.ZERO)
                .maxDiscountCap(BigDecimal.valueOf(1000))
                .maxUses(1)
                .currentUses(0)
                .validFrom(Instant.now())
                .validUntil(Instant.now().plus(Duration.ofMinutes(30)))
                .isActive(true)
                .createdAt(Instant.now())
                .build();

        couponRepository.save(coupon);
        if (meterRegistry != null) {
            meterRegistry.counter("ecommerce_abandoned_cart_coupons_generated_total").increment();
        }
        log.info("Created dynamic 30-min abandoned cart recovery coupon {} for customer {}", dynamicCode,
                event.customerId());

        if (kafkaTemplate != null) {
            NotificationSentEvent notificationEvent = new NotificationSentEvent(
                    UUID.randomUUID().toString(),
                    event.customerId(),
                    "SSE",
                    "🎁 קופון אישי 15% הנחה לסל שלך!",
                    "שמנו לב שהשארת פריטים בסל! קבל 15% הנחה ל-30 הדקות הקרובות עם הקופון: " + dynamicCode,
                    dynamicCode,
                    "SENT",
                    Instant.now());
            kafkaTemplate.send("notification-events", event.customerId(), notificationEvent);
        }
    }

    public void handleCartAbandoned(CartAbandonedEvent event) {
        handleCartAbandoned(event, null);
    }

    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(ValidateCouponRequest request) {
        String code = request.couponCode().trim().toUpperCase();
        BigDecimal orderAmount = request.orderAmount();

        Optional<CouponEntity> couponOpt = couponRepository.findByCodeIgnoreCase(code);
        if (couponOpt.isEmpty()) {
            recordValidationMetric("INVALID_NOT_FOUND");
            return new CouponValidationResponse(
                    false, code, null, BigDecimal.ZERO, BigDecimal.ZERO, orderAmount,
                    "קוד קופון זה אינו קיים במערכת");
        }

        CouponEntity coupon = couponOpt.get();
        Instant now = Instant.now();

        if (!Boolean.TRUE.equals(coupon.getIsActive())) {
            recordValidationMetric("INVALID_INACTIVE");
            return new CouponValidationResponse(
                    false, code, coupon.getDiscountType(), coupon.getDiscountValue(), BigDecimal.ZERO, orderAmount,
                    "קופון זה אינו פעיל כעת");
        }

        if (now.isBefore(coupon.getValidFrom()) || now.isAfter(coupon.getValidUntil())) {
            recordValidationMetric("INVALID_EXPIRED");
            return new CouponValidationResponse(
                    false, code, coupon.getDiscountType(), coupon.getDiscountValue(), BigDecimal.ZERO, orderAmount,
                    "תוקף הקופון פג או שטרם החל");
        }

        if (coupon.getCurrentUses() >= coupon.getMaxUses()) {
            recordValidationMetric("INVALID_EXHAUSTED");
            return new CouponValidationResponse(
                    false, code, coupon.getDiscountType(), coupon.getDiscountValue(), BigDecimal.ZERO, orderAmount,
                    "מכסת השימושים בקופון זה אזלה");
        }

        if (coupon.getMinOrderAmount() != null && orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            recordValidationMetric("INVALID_MIN_AMOUNT");
            return new CouponValidationResponse(
                    false, code, coupon.getDiscountType(), coupon.getDiscountValue(), BigDecimal.ZERO, orderAmount,
                    "קופון זה דורש רכישה מינימלית בסך ₪" + coupon.getMinOrderAmount());
        }

        BigDecimal discountAmount = calculateDiscount(coupon, orderAmount);
        BigDecimal finalAmount = orderAmount.subtract(discountAmount).max(BigDecimal.ZERO);

        String msg = coupon.getDiscountType() == CouponType.PERCENTAGE
                ? "קופון " + coupon.getDiscountValue().stripTrailingZeros().toPlainString()
                        + "% הנחה הוחל בהצלחה! חיסכון של ₪" + discountAmount
                : "קופון הנחה בסך ₪" + discountAmount + " הוחל בהצלחה!";

        recordValidationMetric("VALID");
        return new CouponValidationResponse(
                true, code, coupon.getDiscountType(), coupon.getDiscountValue(), discountAmount, finalAmount, msg);
    }

    @Transactional
    public CouponApplicationResult applyAndConsumeCoupon(String couponCode, BigDecimal orderAmount) {
        if (couponCode == null || couponCode.isBlank()) {
            return new CouponApplicationResult(null, BigDecimal.ZERO, orderAmount);
        }

        ValidateCouponRequest valReq = new ValidateCouponRequest(couponCode, orderAmount);
        CouponValidationResponse valRes = validateCoupon(valReq);

        if (!valRes.valid()) {
            log.warn("Coupon {} could not be applied: {}", couponCode, valRes.message());
            return new CouponApplicationResult(null, BigDecimal.ZERO, orderAmount);
        }

        CouponEntity coupon = couponRepository.findByCodeIgnoreCase(couponCode.trim().toUpperCase())
                .orElseThrow();
        coupon.setCurrentUses(coupon.getCurrentUses() + 1);
        couponRepository.save(coupon);

        if (meterRegistry != null) {
            meterRegistry.counter("ecommerce_coupons_redeemed_total",
                    "coupon_code", coupon.getCode(),
                    "discount_type", coupon.getDiscountType().name()).increment();
        }

        log.info("Applied and consumed coupon: {} with discount: {}", coupon.getCode(), valRes.discountAmount());
        return new CouponApplicationResult(coupon.getCode(), valRes.discountAmount(), valRes.finalAmount());
    }

    private void recordValidationMetric(String result) {
        if (meterRegistry != null) {
            meterRegistry.counter("ecommerce_coupons_validation_total", "result", result).increment();
        }
    }

    private BigDecimal calculateDiscount(CouponEntity coupon, BigDecimal orderAmount) {
        BigDecimal discount;
        if (coupon.getDiscountType() == CouponType.PERCENTAGE) {
            discount = orderAmount.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountCap() != null && discount.compareTo(coupon.getMaxDiscountCap()) > 0) {
                discount = coupon.getMaxDiscountCap();
            }
        } else {
            discount = coupon.getDiscountValue();
        }
        return discount.min(orderAmount);
    }
}
