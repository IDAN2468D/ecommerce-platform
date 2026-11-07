package com.company.tradein;

import com.company.tradein.domain.TradeInAppraisal;
import com.company.tradein.dto.CreateTradeInRequest;
import com.company.tradein.repository.TradeInAppraisalRepository;
import com.company.tradein.service.TradeInService;
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
class TradeInServiceTest {

    @Mock
    private TradeInAppraisalRepository appraisalRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private TradeInService tradeInService;

    @BeforeEach
    void setUp() {
        tradeInService = new TradeInService(appraisalRepository, kafkaTemplate);
    }

    @Test
    void appraiseDevice_MintConditionCalculates60PercentCreditAndIssuesVoucher() {
        when(appraisalRepository.save(any(TradeInAppraisal.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateTradeInRequest req = CreateTradeInRequest.builder()
                .customerId("usr_demo")
                .deviceModel("Apple iPad Pro M2")
                .conditionGrade("MINT_A_PLUS")
                .originalRetailPriceILS(BigDecimal.valueOf(4000.00))
                .build();

        TradeInAppraisal res = tradeInService.appraiseDevice(req);
        assertEquals(BigDecimal.valueOf(2400.00).setScale(2), res.getApprovedCreditILS());
        assertTrue(res.getTradeInVoucherCode().startsWith("TRD-IL-"));
        assertEquals("APPROVED_VOUCHER_ISSUED", res.getStatus());
    }
}
