package com.company.dynamicpricingservice.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "price_history_ledgers")
@CompoundIndex(name = "sku_recorded_idx", def = "{'skuCode': 1, 'recordedAt': -1}")
public class PriceHistoryLedgerEntity {
    @Id
    private String id;
    private String skuCode;
    private BigDecimal price;
    private Instant recordedAt;
    private String triggerReason;
}
