package com.company.bnpl;

import com.company.bnpl.domain.BnplInstallmentPlan;
import com.company.bnpl.dto.CreateBnplPlanRequest;
import com.company.bnpl.repository.BnplInstallmentPlanRepository;
import com.company.bnpl.service.BnplCreditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BnplCreditServiceTest {

    @Mock
    private BnplInstallmentPlanRepository planRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private BnplCreditService bnplCreditService;

    @BeforeEach
    void setUp() {
        bnplCreditService = new BnplCreditService(planRepository, kafkaTemplate);
    }

    @Test
    void createPlan_SplitsInto4ZeroAprInstallmentsWithFirstPaidImmediately() {
        when(planRepository.save(any(BnplInstallmentPlan.class))).thenAnswer(inv -> {
            BnplInstallmentPlan p = inv.getArgument(0);
            p.setId("plan_123");
            return p;
        });

        CreateBnplPlanRequest req = CreateBnplPlanRequest.builder()
                .customerId("usr_demo")
                .orderId("ORD-100")
                .productSummary("MacBook Air M3")
                .totalAmount(BigDecimal.valueOf(4000.00))
                .installmentsCount(4)
                .build();

        BnplInstallmentPlan plan = bnplCreditService.createPlan(req);

        assertNotNull(plan);
        assertEquals(4, plan.getTotalInstallments());
        assertEquals(1, plan.getPaidInstallments());
        assertEquals(BigDecimal.valueOf(3000.00).setScale(2), plan.getRemainingBalance());
        assertEquals("PAID", plan.getSchedule().get(0).getStatus());
        assertEquals("SCHEDULED", plan.getSchedule().get(1).getStatus());
    }

    @Test
    void payNextInstallment_MarksNextTranchePaidAndReducesBalance() {
        when(planRepository.save(any(BnplInstallmentPlan.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateBnplPlanRequest req = CreateBnplPlanRequest.builder()
                .customerId("usr_demo")
                .totalAmount(BigDecimal.valueOf(1200.00))
                .installmentsCount(4)
                .build();

        BnplInstallmentPlan created = bnplCreditService.createPlan(req);
        created.setId("plan_456");

        when(planRepository.findById("plan_456")).thenReturn(Optional.of(created));

        BnplInstallmentPlan afterPay = bnplCreditService.payNextInstallment("plan_456");
        assertEquals(2, afterPay.getPaidInstallments());
        assertEquals(BigDecimal.valueOf(600.00).setScale(2), afterPay.getRemainingBalance());
        assertEquals("PAID", afterPay.getSchedule().get(1).getStatus());
    }
}
