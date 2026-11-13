package com.company.sustainability.service;

import com.company.sustainability.domain.CarbonFootprintAssessment;
import com.company.sustainability.dto.AssessSustainabilityRequest;
import com.company.sustainability.repository.CarbonFootprintAssessmentRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CarbonSustainabilityService {

    private final CarbonFootprintAssessmentRepository sustainabilityRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @PostConstruct
    public void seedAssessmentsIfEmpty() {
        if (sustainabilityRepository.count() == 0) {
            log.info("Seeding initial Green Logistics & Carbon Footprint ESG assessments...");
            assessFootprint(AssessSustainabilityRequest.builder()
                    .customerId("cust_vip_idan")
                    .skuCode("COMP-MACBOOK-M3")
                    .productName("Apple MacBook Pro 16 M3 Max (100% Recycled Aluminum)")
                    .weightKg(2.15)
                    .ecoConsolidatedDelivery(true)
                    .build());
        }
    }

    public List<CarbonFootprintAssessment> getAllAssessments() {
        return sustainabilityRepository.findAll();
    }

    public CarbonFootprintAssessment assessFootprint(AssessSustainabilityRequest request) {
        BigDecimal standardCo2 = BigDecimal.valueOf(request.getWeightKg() * 2.40)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal reductionFactor = request.isEcoConsolidatedDelivery()
                ? BigDecimal.valueOf(0.55)
                : BigDecimal.ONE;
        BigDecimal netCo2 = standardCo2.multiply(reductionFactor).setScale(2, RoundingMode.HALF_UP);
        BigDecimal savedCo2 = standardCo2.subtract(netCo2).setScale(2, RoundingMode.HALF_UP);

        String grade = request.isEcoConsolidatedDelivery() ? "A+ (EV Zero-Emission Route)" : "B (Standard Courier)";
        int ecoPoints = request.isEcoConsolidatedDelivery() ? 180 : 40;

        CarbonFootprintAssessment assessment = CarbonFootprintAssessment.builder()
                .certificateNumber("ESG-CO2-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .customerId(request.getCustomerId())
                .skuCode(request.getSkuCode())
                .productName(request.getProductName())
                .weightKg(request.getWeightKg())
                .ecoConsolidatedDelivery(request.isEcoConsolidatedDelivery())
                .standardEmissionsKgCo2e(standardCo2)
                .netEmissionsKgCo2e(netCo2)
                .savedEmissionsKgCo2e(savedCo2)
                .ecoScoreGrade(grade)
                .awardedVipEcoPoints(ecoPoints)
                .status("CARBON_OFFSET_CERTIFIED")
                .createdAt(Instant.now())
                .build();

        CarbonFootprintAssessment saved = sustainabilityRepository.save(assessment);
        try {
            kafkaTemplate.send("carbon-sustainability-events", saved.getCertificateNumber(),
                    "ECO_REWARD_GRANTED:" + saved.getCustomerId() + ":+" + saved.getAwardedVipEcoPoints() + "_PTS");
        } catch (Exception e) {
            log.warn("Kafka sustainability event skipped: {}", e.getMessage());
        }
        return saved;
    }
}
