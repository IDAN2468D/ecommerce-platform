package com.company.configurator.domain;

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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "custom_rig_builds")
public class CustomRigBuild {

    @Id
    private String id;

    @Indexed(unique = true)
    private String buildCode;

    private String customerId;
    private String rigProfileType;
    private List<String> selectedSkus;
    private int componentCount;

    private int compatibilityScorePct;
    private int estimatedWattage;
    private boolean zeroBottleneckVerified;

    private BigDecimal baseComponentsTotalILS;
    private int assemblyDiscountPct;
    private BigDecimal finalBuildPriceILS;

    @Builder.Default
    private String status = "COMPATIBILITY_VERIFIED_100";

    @Builder.Default
    private Instant createdAt = Instant.now();
}
