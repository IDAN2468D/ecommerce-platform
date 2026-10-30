package com.company.recommendationloyaltyservice.service;

import com.company.recommendationloyaltyservice.dto.RecommendationDtos.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String CO_BOUGHT_PREFIX = "recommendations:co_bought:";

    public void recordCoPurchase(List<String> skuCodes) {
        if (skuCodes == null || skuCodes.size() < 2) {
            return;
        }

        log.info("Recording product co-purchase in Redis for {} items: {}", skuCodes.size(), skuCodes);
        for (int i = 0; i < skuCodes.size(); i++) {
            String skuA = skuCodes.get(i);
            String key = CO_BOUGHT_PREFIX + skuA;
            for (int j = 0; j < skuCodes.size(); j++) {
                if (i != j) {
                    String skuB = skuCodes.get(j);
                    try {
                        redisTemplate.opsForZSet().incrementScore(key, skuB, 1.0);
                    } catch (Exception ex) {
                        log.warn("Failed to increment co-occurrence score in Redis: {}", ex.getMessage());
                    }
                }
            }
        }
    }

    public RecommendationResponse getRecommendationsForSku(String skuCode) {
        log.info("Fetching smart product recommendations for skuCode: {}", skuCode);

        List<RecommendedProductDto> results = new ArrayList<>();
        String key = CO_BOUGHT_PREFIX + skuCode;

        // 1. Try reading top co-occurring items from Redis Sorted Set
        try {
            Set<ZSetOperations.TypedTuple<Object>> topItems = redisTemplate.opsForZSet().reverseRangeWithScores(key, 0, 3);
            if (topItems != null && !topItems.isEmpty()) {
                for (ZSetOperations.TypedTuple<Object> tuple : topItems) {
                    if (tuple.getValue() != null) {
                        String coSku = tuple.getValue().toString();
                        double score = tuple.getScore() != null ? tuple.getScore() : 1.0;
                        results.add(buildCatalogProduct(coSku, score, "נרכש יחד לעיתים קרובות עם מוצר זה"));
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("Redis co-occurrence lookup exception: {}", ex.getMessage());
        }

        // 2. If fewer than 4, fill with domain-specific curated complementary items
        if (results.size() < 4) {
            List<RecommendedProductDto> fallbackItems = getCuratedRecommendations(skuCode);
            for (RecommendedProductDto fallback : fallbackItems) {
                if (results.size() >= 4) break;
                boolean alreadyAdded = results.stream().anyMatch(r -> r.skuCode().equalsIgnoreCase(fallback.skuCode()));
                if (!alreadyAdded) {
                    results.add(fallback);
                }
            }
        }

        return new RecommendationResponse(skuCode, results);
    }

    private List<RecommendedProductDto> getCuratedRecommendations(String skuCode) {
        String lower = (skuCode != null) ? skuCode.toLowerCase() : "";

        if (lower.contains("iphone") || lower.contains("apple") || lower.contains("macbook")) {
            return List.of(
                    new RecommendedProductDto("AIRPODS-PRO-2", "אוזניות Apple AirPods Pro 2 עם ביטול רעשים", "אוזניות", new BigDecimal("899.00"), "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80", 9.8, "משלים מושלם לאקוסיסטם של אפל"),
                    new RecommendedProductDto("MAGSAFE-CHARGER", "מטען אלחוטי מגנטי מהיר MagSafe 25W", "אביזרים", new BigDecimal("199.00"), "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=500&q=80", 8.9, "92% מהרוכשים הוסיפו מטען מהיר תואם"),
                    new RecommendedProductDto("CASE-PRO-CLEAR", "כיסוי סיליקון שקוף מגנטי מוגן נפילות", "כיסויים", new BigDecimal("149.00"), "https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=500&q=80", 8.4, "הגנה מרבית למכשיר החדש שלך"),
                    new RecommendedProductDto("APPLE-WATCH-U2", "שעון חכם Apple Watch Ultra 2 טיטניום", "שעונים חכמים", new BigDecimal("3299.00"), "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80", 7.6, "שילוב אולטימטיבי לחיים פעילים")
            );
        } else if (lower.contains("samsung") || lower.contains("galaxy")) {
            return List.of(
                    new RecommendedProductDto("GALAXY-BUDS-3", "אוזניות אלחוטיות Samsung Galaxy Buds 3 Pro", "אוזניות", new BigDecimal("799.00"), "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80", 9.4, "התאמה מושלמת למכשירי סמסונג"),
                    new RecommendedProductDto("SAMSUNG-45W-CHARGER", "מטען סמסונג מקורי Super Fast Charging 45W", "מטענים", new BigDecimal("139.00"), "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80", 9.1, "טעינה מ-0 ל-100% בחצי שעה בלבד"),
                    new RecommendedProductDto("SMARTTAG-2", "תג איתור חכם Samsung Galaxy SmartTag 2 (מארז)", "אביזרים", new BigDecimal("129.00"), "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80", 8.0, "איתור קל למפתחות ולתיק האישי"),
                    new RecommendedProductDto("GALAXY-WATCH-6", "שעון ספורט חכם Galaxy Watch 6 Classic", "שעונים", new BigDecimal("1199.00"), "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&q=80", 7.8, "מדדי בריאות ודופק מתקדמים")
            );
        } else {
            return List.of(
                    new RecommendedProductDto("ANKER-65W-GAN", "מטען מהיר Anker 65W GaN קומפקטי רב-יציאות", "מטענים", new BigDecimal("179.00"), "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80", 9.5, "מתאים לטעינת כל המכשירים והמחשבים"),
                    new RecommendedProductDto("POWERBANK-20000", "סוללת גיבוי ניידת מהירה 20,000mAh עם צג דיגיטלי", "סוללות", new BigDecimal("229.00"), "https://images.unsplash.com/photo-1609592426507-285627685958?w=500&q=80", 8.8, "אנרגיה ל-4 טעינות מלאות בכל מקום"),
                    new RecommendedProductDto("CABLE-USBC-BRAIDED", "כבל טעינה וסנכרון משוריין USB-C ל-USB-C באורך 2 מטר", "כבלים", new BigDecimal("69.00"), "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80", 8.6, "עמידות גבוהה נגד שחיקה וכיפופים"),
                    new RecommendedProductDto("CLEANING-KIT-PRO", "ערכת ניקוי מקצועית למסכים ועדשות אופטיות", "טיפוח", new BigDecimal("49.00"), "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80", 7.9, "שמירה על מסך צלול וללא טביעות אצבע")
            );
        }
    }

    private RecommendedProductDto buildCatalogProduct(String sku, double score, String reason) {
        return new RecommendedProductDto(
                sku,
                "מוצר נלווה " + sku,
                "אביזרים משלימים",
                new BigDecimal("199.00"),
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
                score,
                reason
        );
    }
}
