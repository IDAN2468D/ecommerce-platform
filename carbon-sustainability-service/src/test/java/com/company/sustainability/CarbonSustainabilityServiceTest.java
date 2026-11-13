package com.company.sustainability;

import com.company.sustainability.domain.CarbonFootprintAssessment;
import com.company.sustainability.dto.AssessSustainabilityRequest;
import com.company.sustainability.repository.CarbonFootprintAssessmentRepository;
import com.company.sustainability.service.CarbonSustainabilityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CarbonSustainabilityServiceTest {

    @Mock
    private CarbonFootprintAssessmentRepository sustainabilityRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private CarbonSustainabilityService sustainabilityService;

    @BeforeEach
    void setUp() {
        sustainabilityService = new CarbonSustainabilityService(sustainabilityRepository, kafkaTemplate);
    }

    @Test
    void assessFootprint_ReducesCo2By45PercentAndAwards180EcoPoints() {
        when(sustainabilityRepository.save(any(CarbonFootprintAssessment.class))).thenAnswer(inv -> inv.getArgument(0));

        AssessSustainabilityRequest req = AssessSustainabilityRequest.builder()
                .customerId("cust_eco")
                .skuCode("AUDIO-SONY-XM5")
                .productName("Sony Headphones")
                .weightKg(1.0)
                .ecoConsolidatedDelivery(true)
                .build();

        CarbonFootprintAssessment res = sustainabilityService.assessFootprint(req);
        assertEquals(BigDecimal.valueOf(2.40).setScale(2), res.getStandardEmissionsKgCo2e());
        assertEquals(BigDecimal.valueOf(1.32).setScale(2), res.getNetEmissionsKgCo2e());
        assertEquals(BigDecimal.valueOf(1.08).setScale(2), res.getSavedEmissionsKgCo2e());
        assertEquals(180, res.getAwardedVipEcoPoints());
    }
}
