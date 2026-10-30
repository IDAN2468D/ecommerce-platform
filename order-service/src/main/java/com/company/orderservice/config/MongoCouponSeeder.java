package com.company.orderservice.config;

import com.company.orderservice.domain.entity.CouponEntity;
import com.company.orderservice.domain.enums.CouponType;
import com.company.orderservice.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class MongoCouponSeeder implements CommandLineRunner {

    private final CouponRepository couponRepository;

    @Override
    public void run(String... args) {
        Instant now = Instant.now();
        Instant tenYearsLater = now.plus(3650, ChronoUnit.DAYS);

        List<CouponEntity> initialCoupons = List.of(
                CouponEntity.builder()
                        .id(UUID.randomUUID())
                        .code("WELCOME10")
                        .discountType(CouponType.PERCENTAGE)
                        .discountValue(new BigDecimal("10.00"))
                        .minOrderAmount(new BigDecimal("0.00"))
                        .maxDiscountCap(new BigDecimal("500.00"))
                        .maxUses(10000)
                        .currentUses(0)
                        .validFrom(now.minus(1, ChronoUnit.DAYS))
                        .validUntil(tenYearsLater)
                        .isActive(true)
                        .createdAt(now)
                        .build(),

                CouponEntity.builder()
                        .id(UUID.randomUUID())
                        .code("SUPER500")
                        .discountType(CouponType.FIXED_AMOUNT)
                        .discountValue(new BigDecimal("500.00"))
                        .minOrderAmount(new BigDecimal("3000.00"))
                        .maxDiscountCap(null)
                        .maxUses(5000)
                        .currentUses(0)
                        .validFrom(now.minus(1, ChronoUnit.DAYS))
                        .validUntil(tenYearsLater)
                        .isActive(true)
                        .createdAt(now)
                        .build(),

                CouponEntity.builder()
                        .id(UUID.randomUUID())
                        .code("VIP20")
                        .discountType(CouponType.PERCENTAGE)
                        .discountValue(new BigDecimal("20.00"))
                        .minOrderAmount(new BigDecimal("5000.00"))
                        .maxDiscountCap(new BigDecimal("1500.00"))
                        .maxUses(2000)
                        .currentUses(0)
                        .validFrom(now.minus(1, ChronoUnit.DAYS))
                        .validUntil(tenYearsLater)
                        .isActive(true)
                        .createdAt(now)
                        .build()
        );

        int seededCount = 0;
        for (CouponEntity coupon : initialCoupons) {
            if (couponRepository.findByCodeIgnoreCase(coupon.getCode()).isEmpty()) {
                couponRepository.save(coupon);
                seededCount++;
            }
        }

        if (seededCount > 0) {
            log.info("MongoCouponSeeder: Seeded {} initial coupons into MongoDB 'coupons' collection", seededCount);
        }
    }
}
