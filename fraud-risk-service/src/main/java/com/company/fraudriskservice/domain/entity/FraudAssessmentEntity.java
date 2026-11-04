package com.company.fraudriskservice.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "fraud_assessments")
public class FraudAssessmentEntity {
    @Id
    private String id;
    @Indexed(unique = true)
    private String assessmentId;
    private UUID orderId;
    private String customerId;
    private BigDecimal amount;
    private Integer riskScore; // 0 - 100
    private String riskLevel;  // LOW_RISK, MEDIUM_RISK, HIGH_RISK_BLOCKED
    private String decision;   // APPROVE, HOLD_REVIEW, BLOCK
    private List<String> triggeredRules;
    private List<String> signalsChecked;
    private Instant evaluatedAt;
}
