package com.company.merchantanalyticsservice.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "analytics_daily_kpis")
public class AnalyticsDailyKpiEntity {
    @Id
    private String id;
    @Indexed(unique = true)
    private LocalDate date;
    private BigDecimal grossMerchandiseValueIls;
    private BigDecimal netRevenueIls;
    private Long ordersCount;
    private Long abandonedCartsRecovered;
    private Long returnsCount;
    private BigDecimal averageOrderValueIls;
}
