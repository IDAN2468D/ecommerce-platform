package com.company.gifting.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "social_gift_campaigns")
public class SocialGiftCampaign {

    @Id
    private String id;

    @Indexed(unique = true)
    private String campaignCode;

    private String recipientName;
    private String occasionTitle;
    private String skuCode;
    private String productName;
    private String imageUrl;

    private BigDecimal targetAmountILS;
    private BigDecimal raisedAmountILS;

    @Builder.Default
    private String status = "COLLECTING"; // COLLECTING, FUNDED_ORDER_DISPATCHED

    @Builder.Default
    private List<GiftContribution> contributions = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GiftContribution {
        private String contributorName;
        private BigDecimal amountILS;
        private String greetingMessage;
        private Instant timestamp;
    }
}
