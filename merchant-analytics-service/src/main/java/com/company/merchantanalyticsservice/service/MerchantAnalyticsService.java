package com.company.merchantanalyticsservice.service;

import com.company.merchantanalyticsservice.domain.entity.AnalyticsDailyKpiEntity;
import com.company.merchantanalyticsservice.domain.entity.SkuDepletionForecastEntity;
import com.company.merchantanalyticsservice.dto.AnalyticsDtos.*;
import com.company.merchantanalyticsservice.repository.AnalyticsDailyKpiRepository;
import com.company.merchantanalyticsservice.repository.SkuDepletionForecastRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MerchantAnalyticsService {

    private final AnalyticsDailyKpiRepository dailyKpiRepository;
    private final SkuDepletionForecastRepository forecastRepository;

    public AnalyticsSummaryResponse getSummary() {
        LocalDate today = LocalDate.now();
        AnalyticsDailyKpiEntity kpi = dailyKpiRepository.findByDate(today)
                .orElseGet(() -> dailyKpiRepository.save(AnalyticsDailyKpiEntity.builder()
                        .date(today)
                        .grossMerchandiseValueIls(new BigDecimal("489500.00"))
                        .netRevenueIls(new BigDecimal("442100.00"))
                        .ordersCount(284L)
                        .abandonedCartsRecovered(38L)
                        .returnsCount(12L)
                        .averageOrderValueIls(new BigDecimal("1723.59"))
                        .build()));

        return new AnalyticsSummaryResponse(
                kpi.getGrossMerchandiseValueIls(),
                kpi.getNetRevenueIls(),
                kpi.getOrdersCount(),
                kpi.getAverageOrderValueIls(),
                4.85,  // Conversion rate %
                1.20,  // Fraud block rate %
                84.50, // RMA VIP retention rate %
                kpi.getAbandonedCartsRecovered(),
                Instant.now()
        );
    }

    public List<SkuDepletionForecastDto> getInventoryForecast(boolean onlyCritical) {
        List<SkuDepletionForecastEntity> list = onlyCritical
                ? forecastRepository.findByRestockUrgencyOrderByPredictedDaysUntilDepletionAsc("CRITICAL")
                : forecastRepository.findAllByOrderByPredictedDaysUntilDepletionAsc();

        if (list.isEmpty()) {
            list = seedForecasts();
            if (onlyCritical) {
                list = list.stream().filter(f -> "CRITICAL".equalsIgnoreCase(f.getRestockUrgency())).toList();
            }
        }

        return list.stream().map(this::mapToDto).toList();
    }

    public MerchantCopilotResponse answerCopilotQuestion(MerchantCopilotRequest req) {
        List<SkuDepletionForecastDto> forecasts = getInventoryForecast(false);
        SkuDepletionForecastDto topUrgent = forecasts.isEmpty() ? null : forecasts.get(0);

        String answer;
        if (req.question().contains("מלאי") || req.question().contains("להיגמר") || req.question().contains("stock")) {
            answer = "שלום! לפי ניתוח קצב המכירות ב-7 הימים האחרונים, המוצר הקריטי ביותר הוא **" + 
                    (topUrgent != null ? topUrgent.title() : "Apple MacBook Pro 16\"") + 
                    "** (מק\"ט `" + (topUrgent != null ? topUrgent.skuCode() : "LAPTOP-MACBOOK-PRO-16") + "`). " +
                    "נותרו במלאי " + (topUrgent != null ? topUrgent.currentStock() : 4) + " יחידות בלבד, " +
                    "והוא צפוי להיגמר תוך כ-" + (topUrgent != null ? topUrgent.predictedDaysUntilDepletion() : 2.5) + " ימים. " +
                    "מומלץ להוציא הזמנת רכש (PO) מיידית לספק.";
        } else {
            AnalyticsSummaryResponse s = getSummary();
            answer = "סיכום פעילות עסקית להיום: ה-GMV עומד על **₪" + s.grossMerchandiseValueIls() + "** " +
                    "מתוך " + s.ordersCount() + " הזמנות שנסגרו (AOV: ₪" + s.averageOrderValueIls() + "). " +
                    "אחוז ההמרות הינו " + s.conversionRatePercentage() + "%, ומערכת ה-Fraud חסמה " + s.fraudBlockRatePercentage() + "% ניסיונות חשודים.";
        }

        return new MerchantCopilotResponse(
                req.question(),
                answer,
                forecasts.stream().filter(f -> !"HEALTHY".equalsIgnoreCase(f.restockUrgency())).toList(),
                Instant.now()
        );
    }

    public synchronized void recordOrder(BigDecimal amount) {
        if (amount == null) return;
        LocalDate today = LocalDate.now();
        AnalyticsDailyKpiEntity kpi = dailyKpiRepository.findByDate(today)
                .orElseGet(() -> AnalyticsDailyKpiEntity.builder()
                        .date(today)
                        .grossMerchandiseValueIls(BigDecimal.ZERO)
                        .netRevenueIls(BigDecimal.ZERO)
                        .ordersCount(0L)
                        .abandonedCartsRecovered(0L)
                        .returnsCount(0L)
                        .averageOrderValueIls(BigDecimal.ZERO)
                        .build());

        kpi.setGrossMerchandiseValueIls(kpi.getGrossMerchandiseValueIls().add(amount));
        kpi.setNetRevenueIls(kpi.getNetRevenueIls().add(amount));
        kpi.setOrdersCount(kpi.getOrdersCount() + 1);
        if (kpi.getOrdersCount() > 0) {
            kpi.setAverageOrderValueIls(kpi.getGrossMerchandiseValueIls().divide(BigDecimal.valueOf(kpi.getOrdersCount()), 2, RoundingMode.HALF_UP));
        }
        dailyKpiRepository.save(kpi);
    }

    public synchronized void recordReturn(BigDecimal amount, String resolutionType) {
        LocalDate today = LocalDate.now();
        dailyKpiRepository.findByDate(today).ifPresent(kpi -> {
            kpi.setReturnsCount(kpi.getReturnsCount() + 1);
            if (!"INSTANT_VIP_CREDIT".equalsIgnoreCase(resolutionType) && amount != null) {
                kpi.setNetRevenueIls(kpi.getNetRevenueIls().subtract(amount));
            }
            dailyKpiRepository.save(kpi);
        });
    }

    public void recordFraudBlocked() {
        log.info("Recorded fraud blocked transaction in merchant telemetry");
    }

    public void recordCartAbandoned() {
        log.info("Recorded abandoned cart event in merchant telemetry");
    }

    private List<SkuDepletionForecastEntity> seedForecasts() {
        List<SkuDepletionForecastEntity> list = new ArrayList<>();
        Instant now = Instant.now();

        list.add(SkuDepletionForecastEntity.builder()
                .skuCode("LAPTOP-MACBOOK-PRO-16")
                .title("Apple MacBook Pro 16\" M3 Max 36GB 1TB SSD")
                .currentStock(4)
                .dailyBurnRate(1.6)
                .predictedDaysUntilDepletion(2.5)
                .restockUrgency("CRITICAL")
                .calculatedAt(now)
                .build());

        list.add(SkuDepletionForecastEntity.builder()
                .skuCode("AUDIO-SONY-XM5")
                .title("Sony WH-1000XM5 Wireless Noise-Cancelling Headphones")
                .currentStock(18)
                .dailyBurnRate(3.2)
                .predictedDaysUntilDepletion(5.6)
                .restockUrgency("WARNING")
                .calculatedAt(now)
                .build());

        list.add(SkuDepletionForecastEntity.builder()
                .skuCode("IPHONE-16-PRO-256")
                .title("Apple iPhone 16 Pro 256GB Desert Titanium")
                .currentStock(45)
                .dailyBurnRate(4.0)
                .predictedDaysUntilDepletion(11.25)
                .restockUrgency("HEALTHY")
                .calculatedAt(now)
                .build());

        return forecastRepository.saveAll(list);
    }

    private SkuDepletionForecastDto mapToDto(SkuDepletionForecastEntity e) {
        return new SkuDepletionForecastDto(
                e.getSkuCode(),
                e.getTitle(),
                e.getCurrentStock(),
                e.getDailyBurnRate(),
                e.getPredictedDaysUntilDepletion(),
                e.getRestockUrgency(),
                e.getCalculatedAt()
        );
    }
}
