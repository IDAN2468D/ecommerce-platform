package com.company.flashsale.domain;

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
@Document(collection = "flash_drops_auctions")
public class FlashSaleCampaign {

    @Id
    private String id;

    @Indexed(unique = true)
    private String campaignCode;

    private String skuCode;
    private String productName;
    private String imageUrl;
    private String campaignType; // FLASH_DROP or LIVE_AUCTION

    private BigDecimal retailPrice;
    private BigDecimal flashOrStartingPrice;
    private BigDecimal currentHighestBid;
    private BigDecimal minBidIncrement;
    private String highestBidderId;
    private String highestBidderName;

    private int totalStock;
    private int remainingStock;
    private int totalBidsCount;

    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, SOLD_OUT, ENDED

    private Instant endsAt;

    @Builder.Default
    private List<AuctionBidRecord> bidHistory = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuctionBidRecord {
        private String bidId;
        private String customerId;
        private String customerName;
        private BigDecimal amount;
        private Instant timestamp;
    }
}
