package com.company.customs;

import com.company.customs.domain.CustomsDutyAssessment;
import com.company.customs.dto.CalculateCustomsRequest;
import com.company.customs.repository.CustomsDutyAssessmentRepository;
import com.company.customs.service.CustomsTaxDutyService;
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
class CustomsTaxDutyServiceTest {

    @Mock
    private CustomsDutyAssessmentRepository customsRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private CustomsTaxDutyService customsService;

    @BeforeEach
    void setUp() {
        customsService = new CustomsTaxDutyService(customsRepository, kafkaTemplate);
    }

    @Test
    void calculateDuty_RecommendsSmartParcelSplitWhenEachItemIsUnder75USD() {
        when(customsRepository.save(any(CustomsDutyAssessment.class))).thenAnswer(inv -> inv.getArgument(0));

        CalculateCustomsRequest req = CalculateCustomsRequest.builder()
                .originCountry("USA")
                .hsCode("8518.30.00")
                .productName("2x Gaming Mice Pack")
                .itemCount(2)
                .subtotalILS(BigDecimal.valueOf(370.00)) // $100 USD total ($50 each)
                .build();

        CustomsDutyAssessment res = customsService.calculateDuty(req);
        assertFalse(res.isVatExemptUnder75USD());
        assertEquals(BigDecimal.valueOf(66.60).setScale(2), res.getVatAmountILS());
        assertTrue(res.isSmartSplitRecommended());
        assertEquals(BigDecimal.valueOf(66.60).setScale(2), res.getPotentialSplitSavingsILS());
    }
}
