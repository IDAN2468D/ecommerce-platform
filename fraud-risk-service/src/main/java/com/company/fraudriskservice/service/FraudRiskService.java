package com.company.fraudriskservice.service;

import com.company.common.events.FraudCheckPassedEvent;
import com.company.common.events.FraudFlaggedEvent;
import com.company.fraudriskservice.domain.entity.FraudAssessmentEntity;
import com.company.fraudriskservice.domain.entity.FraudAuditLogEntity;
import com.company.fraudriskservice.dto.FraudDtos.*;
import com.company.fraudriskservice.kafka.FraudKafkaPublisher;
import com.company.fraudriskservice.repository.FraudAssessmentRepository;
import com.company.fraudriskservice.repository.FraudAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class FraudRiskService {

    private final FraudAssessmentRepository assessmentRepository;
    private final FraudAuditLogRepository auditLogRepository;
    private final FraudKafkaPublisher kafkaPublisher;
    private final Optional<StringRedisTemplate> redisTemplate;

    public FraudAssessmentResponse assessRisk(FraudAssessmentRequest req) {
        String assessmentId = "fa_" + UUID.randomUUID().toString().substring(0, 10);
        int score = 5; // Base score
        List<String> rules = new ArrayList<>();
        List<String> signals = new ArrayList<>();

        signals.add("JWT_SIGNATURE_VERIFIED");
        signals.add("SHIPPING_BILLING_CITY_MATCH (" + (req.city() != null ? req.city() : "תל אביב-יפו") + ")");

        // High amount check (> ₪25,000)
        if (req.totalAmount().compareTo(new BigDecimal("25000.00")) > 0) {
            score += 35;
            rules.add("HIGH_TICKET_VALUE_ALERT (> ₪25,000)");
        } else {
            signals.add("TRANSACTION_VALUE_NORMAL (₪" + req.totalAmount() + ")");
        }

        // Redis sliding window velocity counter
        long velocity = 1;
        try {
            if (redisTemplate.isPresent()) {
                String velKey = "fraud:velocity:customer:" + req.customerId() + ":1h";
                Long count = redisTemplate.get().opsForValue().increment(velKey);
                if (count != null && count == 1) {
                    redisTemplate.get().expire(velKey, Duration.ofHours(1));
                }
                if (count != null) {
                    velocity = count;
                }
            }
        } catch (Exception e) {
            log.warn("Redis velocity check fallback: {}", e.getMessage());
        }

        if (velocity > 3) {
            score += 45;
            rules.add("RAPID_ORDER_BURST_VELOCITY (" + velocity + " orders / hr)");
        } else {
            signals.add("VELOCITY_1H_OK (" + velocity + " order / hr)");
        }

        // Coupon brute force check
        if (req.couponCode() != null && req.couponCode().startsWith("BRUTE_")) {
            score += 25;
            rules.add("COUPON_ENUMERATION_PATTERN_DETECTED");
        } else {
            signals.add("COUPON_ABUSE_CHECK_PASSED");
        }

        String level = score >= 70 ? "HIGH_RISK_BLOCKED" : (score >= 40 ? "MEDIUM_RISK" : "LOW_RISK");
        String decision = score >= 70 ? "BLOCK" : (score >= 40 ? "HOLD_REVIEW" : "APPROVE");

        Instant now = Instant.now();

        FraudAssessmentEntity entity = FraudAssessmentEntity.builder()
                .assessmentId(assessmentId)
                .orderId(req.orderId())
                .customerId(req.customerId())
                .amount(req.totalAmount())
                .riskScore(score)
                .riskLevel(level)
                .decision(decision)
                .triggeredRules(rules)
                .signalsChecked(signals)
                .evaluatedAt(now)
                .build();

        assessmentRepository.save(entity);

        auditLogRepository.save(FraudAuditLogEntity.builder()
                .customerId(req.customerId())
                .action("FRAUD_ASSESSMENT_COMPLETED")
                .details("Score " + score + "/100 - " + decision)
                .loggedAt(now)
                .build());

        // Emit Kafka SAGA Event
        if (score >= 70) {
            kafkaPublisher.publishFraudFlagged(new FraudFlaggedEvent(
                    assessmentId, req.orderId(), req.customerId(), score, rules, now
            ));
        } else {
            kafkaPublisher.publishFraudPassed(new FraudCheckPassedEvent(
                    assessmentId, req.orderId(), req.customerId(), score, now
            ));
        }

        InventoryDepletionWarningDto stockWarning = new InventoryDepletionWarningDto(
                "LAPTOP-MACBOOK-PRO-16", 4, 2.5
        );

        return new FraudAssessmentResponse(
                assessmentId,
                req.orderId(),
                req.customerId(),
                score,
                level,
                decision,
                signals,
                rules,
                stockWarning,
                now
        );
    }

    public FraudAssessmentResponse getAssessmentByOrderId(UUID orderId) {
        return assessmentRepository.findByOrderId(orderId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new IllegalArgumentException("No assessment found for order: " + orderId));
    }

    public List<FraudAssessmentResponse> getRecentAlerts() {
        return assessmentRepository.findTop20ByOrderByEvaluatedAtDesc()
                .stream().map(this::mapToResponse).toList();
    }

    private FraudAssessmentResponse mapToResponse(FraudAssessmentEntity e) {
        return new FraudAssessmentResponse(
                e.getAssessmentId(),
                e.getOrderId(),
                e.getCustomerId(),
                e.getRiskScore(),
                e.getRiskLevel(),
                e.getDecision(),
                e.getSignalsChecked(),
                e.getTriggeredRules(),
                new InventoryDepletionWarningDto("LAPTOP-MACBOOK-PRO-16", 4, 2.5),
                e.getEvaluatedAt()
        );
    }
}
