package com.company.orderservice.service;

import com.company.orderservice.domain.entity.CouponEntity;
import com.company.orderservice.domain.enums.CouponType;
import com.company.orderservice.dto.request.ValidateCouponRequest;
import com.company.orderservice.dto.response.CouponValidationResponse;
import com.company.orderservice.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;

    public record CouponApplicationResult(
        String couponCode,
        BigDecimal discountAmount,
        BigDecimal finalAmount
    ) {}

    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(ValidateCouponRequest request) {
        String code = request.couponCode().trim().toUpperCase();
        BigDecimal orderAmount = request.orderAmount();

        Optional<CouponEntity> couponOpt = couponRepository.findByCodeIgnoreCase(code);
        if (couponOpt.isEmpty()) {
            return new CouponValidationResponse(
                    false, code, null, BigDecimal.ZERO, BigDecimal.ZERO, orderAmount,
                    "קוד קופון זה אינו קיים במערכת"
            );
        }

        CouponEntity coupon = couponOpt.get();
        Instant now = Instant.now();

        if (!Boolean.TRUE.equals(coupon.getIsActive())) {
            return new CouponValidationResponse(
                    false, code, coupon.getDiscountType(), coupon.getDiscountValue(), BigDecimal.ZERO, orderAmount,
                    "קופון זה אינו פעיל כעת"
            );
        }

        if (now.isBefore(coupon.getValidFrom()) || now.isAfter(coupon.getValidUntil())) {
            return new CouponValidationResponse(
                    false, code, coupon.getDiscountType(), coupon.getDiscountValue(), BigDecimal.ZERO, orderAmount,
                    "תוקף הקופון פג או שטרם החל"
            );
        }

        if (coupon.getCurrentUses() >= coupon.getMaxUses()) {
            return new CouponValidationResponse(
                    false, code, coupon.getDiscountType(), coupon.getDiscountValue(), BigDecimal.ZERO, orderAmount,
                    "מכסת השימושים בקופון זה אזלה"
            );
        }

        if (coupon.getMinOrderAmount() != null && orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            return new CouponValidationResponse(
                    false, code, coupon.getDiscountType(), coupon.getDiscountValue(), BigDecimal.ZERO, orderAmount,
                    "קופון זה דורש רכישה מינימלית בסך ₪" + coupon.getMinOrderAmount()
            );
        }

        BigDecimal discountAmount = calculateDiscount(coupon, orderAmount);
        BigDecimal finalAmount = orderAmount.subtract(discountAmount).max(BigDecimal.ZERO);

        String msg = coupon.getDiscountType() == CouponType.PERCENTAGE
                ? "קופון " + coupon.getDiscountValue().stripTrailingZeros().toPlainString() + "% הנחה הוחל בהצלחה! חיסכון של ₪" + discountAmount
                : "קופון הנחה בסך ₪" + discountAmount + " הוחל בהצלחה!";

        return new CouponValidationResponse(
                true, code, coupon.getDiscountType(), coupon.getDiscountValue(), discountAmount, finalAmount, msg
        );
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

        log.info("Applied and consumed coupon: {} with discount: {}", coupon.getCode(), valRes.discountAmount());
        return new CouponApplicationResult(coupon.getCode(), valRes.discountAmount(), valRes.finalAmount());
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
