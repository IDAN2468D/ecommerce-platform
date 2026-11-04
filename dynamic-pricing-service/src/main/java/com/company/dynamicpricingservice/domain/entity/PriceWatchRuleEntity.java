package com.company.dynamicpricingservice.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "price_watch_rules")
public class PriceWatchRuleEntity {
    @Id
    private String id;
    private String ruleId;
    private String customerId;
    private String skuCode;
    private BigDecimal targetPrice;
    private boolean autoBuyEnabled;
    private String status; // ACTIVE, EXECUTED, CANCELLED
    private Instant createdAt;
    private Instant executedAt;
}
