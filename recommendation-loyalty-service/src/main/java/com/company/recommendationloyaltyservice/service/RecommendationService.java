package com.company.recommendationloyaltyservice.service;

import com.company.recommendationloyaltyservice.dto.RecommendationDtos.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String CO_BOUGHT_PREFIX = "recommendations:co_bought:";

    @Value("${rag.service.url:http://localhost:8092}")
    private String ragServiceUrl;

    private final RestClient restClient = RestClient.create();

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

        // 2. Query canonical rag-service via HTTP/REST for vector similarity matches
        if (results.size() < 4) {
            List<RecommendedProductDto> vectorMatches = fetchVectorRecommendationsFromRagService(skuCode);
            for (RecommendedProductDto match : vectorMatches) {
                if (results.size() >= 4) break;
                if (match.skuCode().equalsIgnoreCase(skuCode)) continue;
                boolean alreadyAdded = results.stream().anyMatch(r -> r.skuCode().equalsIgnoreCase(match.skuCode()));
                if (!alreadyAdded) {
                    results.add(match);
                }
            }
        }

        // 3. If still fewer than 4, fill with domain-specific curated complementary items
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

    @SuppressWarnings("unchecked")
    private List<RecommendedProductDto> fetchVectorRecommendationsFromRagService(String skuCode) {
        try {
            Map<String, Object> reqBody = Map.of(
                    "query", "מוצרים משלימים ודומים עבור " + skuCode,
                    "onlyInStock", true,
                    "topK", 5
            );
            Map<String, Object> response = restClient.post()
                    .uri(ragServiceUrl + "/api/v1/rag/query")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(reqBody)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.get("citations") instanceof List<?> citations) {
                List<RecommendedProductDto> list = new ArrayList<>();
                for (Object item : citations) {
                    if (item instanceof Map<?, ?> map) {
                        String cSku = String.valueOf(map.get("skuCode"));
                        String title = map.get("title") != null ? String.valueOf(map.get("title")) : cSku;
                        String category = map.get("category") != null ? String.valueOf(map.get("category")) : "מומלצים";
                        double priceVal = map.get("price") instanceof Number n ? n.doubleValue() : 199.0;
                        double scoreVal = map.get("relevanceScore") instanceof Number n ? n.doubleValue() * 10.0 : 9.0;
                        list.add(new RecommendedProductDto(
                                cSku,
                                title,
                                category,
                                BigDecimal.valueOf(priceVal),
                                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
                                Math.round(scoreVal * 10.0) / 10.0,
                                "התאמה וקטורית חכמה מ-RAG Service"
                        ));
                    }
                }
                return list;
            }
        } catch (Exception ex) {
            log.debug("RAG service vector lookup skipped or unavailable ({}): using curated fallback", ex.getMessage());
        }
        return Collections.emptyList();
    }

    private List<RecommendedProductDto> getCuratedRecommendations(String skuCode) {
        String lower = (skuCode != null) ? skuCode.toLowerCase() : "";

        if (lower.contains("iphone") || lower.contains("apple") || lower.contains("macbook")) {
            return List.of(
                    new RecommendedProductDto("AIRPODS-PRO-2", "אוזניות Apple AirPods Pro 2 עם ביטול רעשים", "אודיו", new BigDecimal("899.00"), "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80", 9.8, "משלים מושלם לאקוסיסטם של אפל"),
                    new RecommendedProductDto("CASE-CLEAR-MAGSAFE", "כיסוי סיליקון שקוף מגנטי מוגן נפילות MagSafe", "אביזרים", new BigDecimal("150.00"), "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&q=80", 8.9, "הגנה מרבית למכשיר החדש שלך"),
                    new RecommendedProductDto("WATCH-ULTRA-2", "שעון חכם Apple Watch Ultra 2 טיטניום", "שעונים חכמים", new BigDecimal("3499.00"), "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80", 8.4, "שילוב אולטימטיבי לחיים פעילים"),
                    new RecommendedProductDto("AIRPODS-MAX", "אוזניות Apple AirPods Max USB-C", "אודיו", new BigDecimal("2199.00"), "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80", 7.9, "חוויית שמע מרחבי עילאית")
            );
        } else if (lower.contains("samsung") || lower.contains("galaxy")) {
            return List.of(
                    new RecommendedProductDto("SONY-WH-1000XM5", "אוזניות אלחוטיות Sony WH-1000XM5 ביטול רעשים", "אודיו", new BigDecimal("1499.00"), "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80", 9.4, "סאונד Hi-Res וסינון רעשים מוביל"),
                    new RecommendedProductDto("SKU-MOUSE-WIRELESS", "Logitech MX Master 3S Wireless Mouse", "אביזרים", new BigDecimal("250.00"), "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80", 9.1, "נוחות עבודה ופרודוקטיביות שיא"),
                    new RecommendedProductDto("AIRPODS-PRO-2", "Apple AirPods Pro (2nd generation) USB-C", "אודיו", new BigDecimal("899.00"), "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80", 8.5, "אוזניות TWS עם חיבור USB-C"),
                    new RecommendedProductDto("WATCH-ULTRA-2", "Apple Watch Ultra 2 GPS + Cellular", "שעונים חכמים", new BigDecimal("3499.00"), "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80", 7.8, "מדדי בריאות ודופק מתקדמים")
            );
        } else {
            return List.of(
                    new RecommendedProductDto("SKU-MOUSE-WIRELESS", "Logitech MX Master 3S Wireless Mouse", "אביזרים", new BigDecimal("250.00"), "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80", 9.5, "עכבר פרימיום ארגונומי שקט"),
                    new RecommendedProductDto("SONY-WH-1000XM5", "Sony WH-1000XM5 Wireless Noise Canceling Headphones", "אודיו", new BigDecimal("1499.00"), "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80", 9.2, "אוזניות ביטול רעשים לעבודה וטיסות"),
                    new RecommendedProductDto("AIRPODS-PRO-2", "Apple AirPods Pro (2nd generation) USB-C", "אודיו", new BigDecimal("899.00"), "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80", 8.8, "נוחות אלחוטית וביטול רעשים אקטיבי"),
                    new RecommendedProductDto("CASE-CLEAR-MAGSAFE", "Clear Case with MagSafe for iPhone 16", "אביזרים", new BigDecimal("150.00"), "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&q=80", 8.1, "כיסוי מגן שקוף תואם MagSafe")
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
