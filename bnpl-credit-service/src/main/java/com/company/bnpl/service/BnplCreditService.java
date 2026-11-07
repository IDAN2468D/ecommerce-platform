package com.company.bnpl.service;

import com.company.bnpl.domain.BnplInstallmentPlan;
import com.company.bnpl.dto.CreateBnplPlanRequest;
import com.company.bnpl.repository.BnplInstallmentPlanRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BnplCreditService {

    private final BnplInstallmentPlanRepository planRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @PostConstruct
    public void seedInitialPlansIfEmpty() {
        if (planRepository.count() == 0) {
            log.info("Seeding initial BNPL 4-Pay installment plans...");
            CreateBnplPlanRequest seedReq = CreateBnplPlanRequest.builder()
                    .customerId("usr_demo")
                    .orderId("ORD-BNPL-9082")
                    .productSummary("Sony WH-1000XM5 + Apple MagSafe Duo Bundle")
                    .totalAmount(BigDecimal.valueOf(1960.00))
                    .installmentsCount(4)
                    .build();
            createPlan(seedReq);
        }
    }

    public Map<String, Object> evaluateCreditLine(String customerId) {
        List<BnplInstallmentPlan> existing = planRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        BigDecimal usedCredit = existing.stream()
                .filter(p -> "ACTIVE".equals(p.getStatus()))
                .map(BnplInstallmentPlan::getRemainingBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal maxCreditLimit = BigDecimal.valueOf(15000.00);
        BigDecimal availableCredit = maxCreditLimit.subtract(usedCredit).max(BigDecimal.ZERO);

        return Map.of(
                "customerId", customerId,
                "creditTier", "VIP_PLATINUM_ZERO_APR",
                "creditScore", 815,
                "maxCreditLimitILS", maxCreditLimit,
                "usedCreditILS", usedCredit,
                "availableCreditILS", availableCredit,
                "aprPercent", BigDecimal.ZERO,
                "supportedInstallments", List.of(2, 3, 4, 6),
                "activePlansCount", existing.stream().filter(p -> "ACTIVE".equals(p.getStatus())).count()
        );
    }

    public List<BnplInstallmentPlan> getCustomerPlans(String customerId) {
        return planRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    public BnplInstallmentPlan createPlan(CreateBnplPlanRequest request) {
        int count = request.getInstallmentsCount() > 0 ? request.getInstallmentsCount() : 4;
        BigDecimal trancheAmount = request.getTotalAmount()
                .divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);

        List<BnplInstallmentPlan.InstallmentTranche> schedule = new ArrayList<>();
        Instant now = Instant.now();

        for (int i = 1; i <= count; i++) {
            boolean isFirst = (i == 1);
            BigDecimal currentAmount = (i == count)
                    ? request.getTotalAmount().subtract(trancheAmount.multiply(BigDecimal.valueOf(count - 1)))
                    : trancheAmount;

            schedule.add(BnplInstallmentPlan.InstallmentTranche.builder()
                    .installmentNumber(i)
                    .amount(currentAmount)
                    .dueDate(isFirst ? now : now.plus(14L * (i - 1), ChronoUnit.DAYS))
                    .status(isFirst ? "PAID" : "SCHEDULED")
                    .paidAt(isFirst ? now : null)
                    .transactionRef(isFirst ? "TX-BNPL-INIT-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase() : null)
                    .build());
        }

        BigDecimal remaining = request.getTotalAmount().subtract(schedule.get(0).getAmount());

        BnplInstallmentPlan plan = BnplInstallmentPlan.builder()
                .planNumber("BNPL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .customerId(request.getCustomerId())
                .orderId(request.getOrderId() != null ? request.getOrderId() : "ORD-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .productSummary(request.getProductSummary() != null ? request.getProductSummary() : "הזמנת NEXUS PRO ב-4 תשלומים")
                .totalOrderAmount(request.getTotalAmount())
                .remainingBalance(remaining)
                .totalInstallments(count)
                .paidInstallments(1)
                .aprPercent(BigDecimal.ZERO)
                .status("ACTIVE")
                .createdAt(now)
                .schedule(schedule)
                .build();

        BnplInstallmentPlan saved = planRepository.save(plan);
        try {
            kafkaTemplate.send("bnpl-events", saved.getPlanNumber(), "BNPL_PLAN_CREATED:" + saved.getCustomerId() + ":₪" + saved.getTotalOrderAmount());
        } catch (Exception e) {
            log.warn("Kafka BNPL event skipped: {}", e.getMessage());
        }
        return saved;
    }

    public BnplInstallmentPlan payNextInstallment(String idOrPlanNumber) {
        BnplInstallmentPlan plan = planRepository.findById(idOrPlanNumber)
                .or(() -> planRepository.findByPlanNumber(idOrPlanNumber))
                .orElseThrow(() -> new IllegalArgumentException("BNPL Plan not found: " + idOrPlanNumber));

        BnplInstallmentPlan.InstallmentTranche nextTranche = plan.getSchedule().stream()
                .filter(t -> "SCHEDULED".equals(t.getStatus()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("All installments are already paid"));

        nextTranche.setStatus("PAID");
        nextTranche.setPaidAt(Instant.now());
        nextTranche.setTransactionRef("TX-BNPL-PAY-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());

        plan.setPaidInstallments(plan.getPaidInstallments() + 1);
        plan.setRemainingBalance(plan.getRemainingBalance().subtract(nextTranche.getAmount()).max(BigDecimal.ZERO));

        if (plan.getPaidInstallments() >= plan.getTotalInstallments()) {
            plan.setStatus("COMPLETED");
        }

        BnplInstallmentPlan saved = planRepository.save(plan);
        try {
            kafkaTemplate.send("bnpl-events", saved.getPlanNumber(), "BNPL_TRANCHE_PAID:" + nextTranche.getInstallmentNumber());
        } catch (Exception e) {
            log.warn("Kafka BNPL payment event skipped: {}", e.getMessage());
        }
        return saved;
    }
}
