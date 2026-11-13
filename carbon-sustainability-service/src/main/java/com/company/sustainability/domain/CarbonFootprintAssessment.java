package com.company.sustainability.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "carbon_footprint_ledgers")
public class CarbonFootprintAssessment {

    @Id
    private String id;

    @Indexed(unique = true)
    private String certificateNumber;

    private String customerId;
    private String skuCode;
    private String productName;
    private double weightKg;
    private boolean ecoConsolidatedDelivery;

    private BigDecimal standardEmissionsKgCo2e;
    private BigDecimal netEmissionsKgCo2e;
    private BigDecimal savedEmissionsKgCo2e;
    private String ecoScoreGrade;
    private int awardedVipEcoPoints;

    @Builder.Default
    private String status = "CARBON_OFFSET_CERTIFIED";

    @Builder.Default
    private Instant createdAt = Instant.now();
}
