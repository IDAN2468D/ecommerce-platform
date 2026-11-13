package com.company.customs.service;

import com.company.customs.domain.CustomsDutyAssessment;
import com.company.customs.dto.CalculateCustomsRequest;
import com.company.customs.repository.CustomsDutyAssessmentRepository;
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
public class CustomsTaxDutyService {

    private static final BigDecimal USD_EXCHANGE_RATE = BigDecimal.valueOf(3.70);
    private static final BigDecimal VAT_THRESHOLD_USD = BigDecimal.valueOf(75.00);
    private static final BigDecimal DUTY_THRESHOLD_USD = BigDecimal.valueOf(500.00);
    private static final BigDecimal ISRAEL_VAT_RATE = BigDecimal.valueOf(0.18);
    private static final BigDecimal CUSTOMS_DUTY_RATE = BigDecimal.valueOf(0.06);

    private final CustomsDutyAssessmentRepository customsRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @PostConstruct
    public void seedAssessmentsIfEmpty() {
        if (customsRepository.count() == 0) {
            log.info("Seeding initial Cross-Border Customs & DDP assessments...");
            calculateDuty(CalculateCustomsRequest.builder()
                    .originCountry("USA - Delaware Hub")
                    .hsCode("8518.30.00")
                    .productName("Sony WH-1000XM5 + Dual Accessories Pack")
                    .itemCount(2)
                    .subtotalILS(BigDecimal.valueOf(480.00))
                    .build());
        }
    }

    public List<CustomsDutyAssessment> getAllAssessments() {
        return customsRepository.findAll();
    }

    public CustomsDutyAssessment calculateDuty(CalculateCustomsRequest request) {
        BigDecimal subtotalILS = request.getSubtotalILS().setScale(2, RoundingMode.HALF_UP);
        BigDecimal valueUSD = subtotalILS.divide(USD_EXCHANGE_RATE, 2, RoundingMode.HALF_UP);

        boolean exemptUnder75 = valueUSD.compareTo(VAT_THRESHOLD_USD) <= 0;
        BigDecimal vatILS = exemptUnder75
                ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : subtotalILS.multiply(ISRAEL_VAT_RATE).setScale(2, RoundingMode.HALF_UP);

        BigDecimal dutyILS = valueUSD.compareTo(DUTY_THRESHOLD_USD) > 0
                ? subtotalILS.multiply(CUSTOMS_DUTY_RATE).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalLanded = subtotalILS.add(vatILS).add(dutyILS).setScale(2, RoundingMode.HALF_UP);

        // Check if splitting items into separate shipments keeps each parcel under $75 USD
        boolean canSplitToSave = !exemptUnder75 && request.getItemCount() >= 2
                && valueUSD.divide(BigDecimal.valueOf(request.getItemCount()), 2, RoundingMode.HALF_UP)
                        .compareTo(VAT_THRESHOLD_USD) <= 0;
        BigDecimal potentialSavings = canSplitToSave ? vatILS : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        CustomsDutyAssessment assessment = CustomsDutyAssessment.builder()
                .declarationNumber("CN23-IL-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .originCountry(request.getOriginCountry())
                .hsCode(request.getHsCode())
                .productName(request.getProductName())
                .itemCount(request.getItemCount())
                .subtotalILS(subtotalILS)
                .estimatedValueUSD(valueUSD)
                .vatExemptUnder75USD(exemptUnder75)
                .vatAmountILS(vatILS)
                .customsDutyAmountILS(dutyILS)
                .totalLandedCostILS(totalLanded)
                .smartSplitRecommended(canSplitToSave)
                .potentialSplitSavingsILS(potentialSavings)
                .incoterms("DDP_DELIVERED_DUTY_PAID")
                .createdAt(Instant.now())
                .build();

        CustomsDutyAssessment saved = customsRepository.save(assessment);
        try {
            kafkaTemplate.send("customs-duty-events", saved.getDeclarationNumber(),
                    "CUSTOMS_DDP_ASSESSED:" + saved.getDeclarationNumber() + ":₪" + saved.getTotalLandedCostILS());
        } catch (Exception e) {
            log.warn("Kafka customs duty event skipped: {}", e.getMessage());
        }
        return saved;
    }
}
