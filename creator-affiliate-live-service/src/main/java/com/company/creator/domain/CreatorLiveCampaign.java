package com.company.creator.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "creator_live_campaigns")
public class CreatorLiveCampaign {

    @Id
    private String id;

    @Indexed(unique = true)
    private String campaignCode;

    private String creatorHandle;
    private String streamTitle;
    private String pinnedSkuCode;
    private String pinnedProductName;
    private String creatorPromoCode;

    private int buyerDiscountPct;
    private int creatorCommissionPct;
    private BigDecimal retailPriceILS;
    private BigDecimal liveDropPriceILS;
    private BigDecimal estimatedCreatorPayoutPerSaleILS;
    private int liveViewersCount;

    @Builder.Default
    private String status = "LIVE_ON_AIR";

    @Builder.Default
    private Instant createdAt = Instant.now();
}
