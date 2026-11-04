package com.company.dynamicpricingservice.service;

import com.company.common.events.AutoBuyTriggeredEvent;
import com.company.common.events.PriceDroppedEvent;
import com.company.dynamicpricingservice.domain.entity.PriceHistoryLedgerEntity;
import com.company.dynamicpricingservice.domain.entity.PriceWatchRuleEntity;
import com.company.dynamicpricingservice.dto.PricingDtos.*;
import com.company.dynamicpricingservice.kafka.PricingKafkaPublisher;
import com.company.dynamicpricingservice.repository.PriceHistoryRepository;
import com.company.dynamicpricingservice.repository.PriceWatchRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DynamicPricingService {

    private final PriceHistoryRepository priceHistoryRepository;
    private final PriceWatchRuleRepository priceWatchRuleRepository;
    private final PricingKafkaPublisher kafkaPublisher;

    private static final Map<String, BigDecimal> DEFAULT_CATALOG_PRICES = Map.of(
            "AUDIO-SONY-XM5", new BigDecimal("1499.00"),
            "LAPTOP-MACBOOK-PRO-16", new BigDecimal("13999.00"),
            "IPHONE-16-PRO-256", new BigDecimal("4799.00"),
            "CASE-CLEAR-MAGSAFE", new BigDecimal("199.00"),
            "WATCH-ULTRA-2", new BigDecimal("3299.00")
    );

    private static final Map<String, String> DEFAULT_CATALOG_TITLES = Map.of(
            "AUDIO-SONY-XM5", "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
            "LAPTOP-MACBOOK-PRO-16", "Apple MacBook Pro 16\" M3 Max 36GB 1TB SSD",
            "IPHONE-16-PRO-256", "Apple iPhone 16 Pro 256GB Desert Titanium",
            "CASE-CLEAR-MAGSAFE", "Apple MagSafe Clear Protective Case",
            "WATCH-ULTRA-2", "Apple Watch Ultra 2 GPS + Cellular 49mm"
    );

    public PriceHistoryResponse getPriceHistory(String skuCode) {
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        List<PriceHistoryLedgerEntity> history = priceHistoryRepository
                .findBySkuCodeAndRecordedAtAfterOrderByRecordedAtAsc(skuCode, thirtyDaysAgo);

        if (history.isEmpty()) {
            history = seedDefaultLedger(skuCode);
        }

        BigDecimal currentPrice = history.get(history.size() - 1).getPrice();
        BigDecimal thirtyDayLow = history.stream().map(PriceHistoryLedgerEntity::getPrice).min(BigDecimal::compareTo).orElse(currentPrice);
        BigDecimal thirtyDayHigh = history.stream().map(PriceHistoryLedgerEntity::getPrice).max(BigDecimal::compareTo).orElse(currentPrice);

        String forecast = "STABLE";
        double dropProb = 0.50;
        if (currentPrice.compareTo(thirtyDayLow.multiply(new BigDecimal("1.08"))) > 0) {
            forecast = "LIKELY_TO_DROP";
            dropProb = 0.78;
        } else if (currentPrice.compareTo(thirtyDayLow) <= 0) {
            forecast = "HISTORIC_LOW_BUY_NOW";
            dropProb = 0.15;
        }

        List<PricePointDto> points = history.stream()
                .map(h -> new PricePointDto(h.getPrice(), h.getRecordedAt(), h.getTriggerReason()))
                .toList();

        return new PriceHistoryResponse(skuCode, currentPrice, thirtyDayLow, thirtyDayHigh, forecast, dropProb, points);
    }

    public AutoBuyRuleResponse createAutoBuyRule(CreateAutoBuyRuleRequest req) {
        String ruleId = "ab_rule_" + UUID.randomUUID().toString().substring(0, 8);
        PriceHistoryResponse history = getPriceHistory(req.skuCode());

        PriceWatchRuleEntity entity = PriceWatchRuleEntity.builder()
                .ruleId(ruleId)
                .customerId(req.customerId())
                .skuCode(req.skuCode())
                .targetPrice(req.targetPrice())
                .autoBuyEnabled(req.autoBuyEnabled())
                .status("ACTIVE")
                .createdAt(Instant.now())
                .build();

        priceWatchRuleRepository.save(entity);

        // Immediate trigger check
        if (req.autoBuyEnabled() && history.currentPrice().compareTo(req.targetPrice()) <= 0) {
            entity.setStatus("EXECUTED");
            entity.setExecutedAt(Instant.now());
            priceWatchRuleRepository.save(entity);

            kafkaPublisher.publishAutoBuyTriggered(new AutoBuyTriggeredEvent(
                    ruleId, req.customerId(), req.skuCode(), history.currentPrice(), req.targetPrice()
            ));
        }

        return new AutoBuyRuleResponse(
                ruleId, req.customerId(), req.skuCode(), history.currentPrice(),
                history.thirtyDayLow(), req.targetPrice(), req.autoBuyEnabled(),
                entity.getStatus(), entity.getCreatedAt()
        );
    }

    public List<AutoBuyRuleResponse> getCustomerRules(String customerId) {
        List<PriceWatchRuleEntity> list = priceWatchRuleRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        return list.stream().map(e -> {
            PriceHistoryResponse h = getPriceHistory(e.getSkuCode());
            return new AutoBuyRuleResponse(
                    e.getRuleId(), e.getCustomerId(), e.getSkuCode(), h.currentPrice(),
                    h.thirtyDayLow(), e.getTargetPrice(), e.isAutoBuyEnabled(),
                    e.getStatus(), e.getCreatedAt()
            );
        }).toList();
    }

    public BundleQuoteResponse calculateBundle(BundleCalculationRequest req) {
        List<String> skus = req.skuCodes() != null && !req.skuCodes().isEmpty() 
                ? req.skuCodes() 
                : List.of("LAPTOP-MACBOOK-PRO-16", "AUDIO-SONY-XM5");

        List<BundleItemDto> items = new ArrayList<>();
        BigDecimal originalTotal = BigDecimal.ZERO;

        for (String sku : skus) {
            BigDecimal price = DEFAULT_CATALOG_PRICES.getOrDefault(sku, new BigDecimal("1499.00"));
            String title = DEFAULT_CATALOG_TITLES.getOrDefault(sku, "מוצר איכותי " + sku);
            items.add(new BundleItemDto(sku, title, price));
            originalTotal = originalTotal.add(price);
        }

        double discountPct = items.size() >= 2 ? 12.0 : 5.0;
        BigDecimal discountFactor = BigDecimal.valueOf(discountPct).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal discountAmount = originalTotal.multiply(discountFactor).setScale(2, RoundingMode.HALF_UP);
        BigDecimal finalPrice = originalTotal.subtract(discountAmount).setScale(2, RoundingMode.HALF_UP);

        return new BundleQuoteResponse(
                "bnd_creator_pro_2026",
                "Pro Creator & Audio Workstation Bundle",
                0.99,
                items,
                originalTotal,
                discountPct,
                discountAmount,
                finalPrice
        );
    }

    public void onInventoryShift(String skuCode, int delta) {
        log.info("Inventory shift for SKU {}: delta={}", skuCode, delta);
        if (delta > 0) {
            // Surplus restock -> slight promotional drop
            PriceHistoryResponse current = getPriceHistory(skuCode);
            BigDecimal discounted = current.currentPrice().multiply(new BigDecimal("0.95")).setScale(2, RoundingMode.HALF_UP);
            recordNewPrice(skuCode, discounted, "SURPLUS_RESTOCK_DISCOUNT");
            kafkaPublisher.publishPriceDropped(new PriceDroppedEvent(
                    skuCode, current.currentPrice(), discounted, current.thirtyDayLow(), 5.0
            ));

            // Check auto-buy targets
            List<PriceWatchRuleEntity> rules = priceWatchRuleRepository.findBySkuCodeAndStatus(skuCode, "ACTIVE");
            for (PriceWatchRuleEntity rule : rules) {
                if (rule.isAutoBuyEnabled() && discounted.compareTo(rule.getTargetPrice()) <= 0) {
                    rule.setStatus("EXECUTED");
                    rule.setExecutedAt(Instant.now());
                    priceWatchRuleRepository.save(rule);
                    kafkaPublisher.publishAutoBuyTriggered(new AutoBuyTriggeredEvent(
                            rule.getRuleId(), rule.getCustomerId(), skuCode, discounted, rule.getTargetPrice()
                    ));
                }
            }
        }
    }

    public void recordNewPrice(String skuCode, BigDecimal newPrice, String reason) {
        PriceHistoryLedgerEntity entity = PriceHistoryLedgerEntity.builder()
                .skuCode(skuCode)
                .price(newPrice)
                .recordedAt(Instant.now())
                .triggerReason(reason)
                .build();
        priceHistoryRepository.save(entity);
    }

    private List<PriceHistoryLedgerEntity> seedDefaultLedger(String skuCode) {
        BigDecimal base = DEFAULT_CATALOG_PRICES.getOrDefault(skuCode, new BigDecimal("1499.00"));
        List<PriceHistoryLedgerEntity> list = new ArrayList<>();
        Instant now = Instant.now();

        // 30 days of synthetic price points
        list.add(new PriceHistoryLedgerEntity(null, skuCode, base.add(new BigDecimal("150.00")), now.minus(28, ChronoUnit.DAYS), "BASE_CATALOG_LAUNCH"));
        list.add(new PriceHistoryLedgerEntity(null, skuCode, base.subtract(new BigDecimal("179.00")), now.minus(20, ChronoUnit.DAYS), "WEEKEND_PROMO"));
        list.add(new PriceHistoryLedgerEntity(null, skuCode, base.add(new BigDecimal("90.00")), now.minus(12, ChronoUnit.DAYS), "HIGH_DEMAND_SURGE"));
        list.add(new PriceHistoryLedgerEntity(null, skuCode, base, now.minus(1, ChronoUnit.DAYS), "STANDARD_PRICING"));

        return priceHistoryRepository.saveAll(list);
    }
}
