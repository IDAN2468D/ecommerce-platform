package com.company.merchantanalyticsservice.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "sku_depletion_forecasts")
public class SkuDepletionForecastEntity {
    @Id
    private String id;
    @Indexed(unique = true)
    private String skuCode;
    private String title;
    private Integer currentStock;
    private Double dailyBurnRate;
    private Double predictedDaysUntilDepletion;
    private String restockUrgency; // CRITICAL, WARNING, HEALTHY
    private Instant calculatedAt;
}
