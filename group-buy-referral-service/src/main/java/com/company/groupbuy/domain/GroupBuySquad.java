package com.company.groupbuy.domain;

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
@Document(collection = "group_buy_squads")
public class GroupBuySquad {

    @Id
    private String id;

    @Indexed(unique = true)
    private String squadCode;

    private String skuCode;
    private String productName;
    private String imageUrl;

    private BigDecimal regularPrice;
    private BigDecimal squadPrice;
    private int discountPercent;

    private int targetParticipants;
    private int currentParticipants;

    @Builder.Default
    private String status = "OPEN"; // OPEN, UNLOCKED, EXPIRED

    private String referralCode;
    private BigDecimal affiliateRewardPoints;
    private Instant expiresAt;

    @Builder.Default
    private List<String> participantNames = new ArrayList<>();
}
