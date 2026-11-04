package com.company.fraudriskservice.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "fraud_audit_logs")
public class FraudAuditLogEntity {
    @Id
    private String id;
    private String customerId;
    private String action;
    private String details;
    private Instant loggedAt;
}
