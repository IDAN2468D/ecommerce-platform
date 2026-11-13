package com.company.creator.service;

import com.company.creator.domain.CreatorLiveCampaign;
import com.company.creator.dto.CreateCreatorCampaignRequest;
import com.company.creator.repository.CreatorLiveCampaignRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CreatorAffiliateLiveService {

    private final CreatorLiveCampaignRepository campaignRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @PostConstruct
    public void seedCampaignsIfEmpty() {
        if (campaignRepository.count() == 0) {
            log.info("Seeding initial Creator Live Shopping & Affiliate campaigns...");
            createCampaign(CreateCreatorCampaignRequest.builder()
                    .creatorHandle("@IdanTechStudio")
                    .streamTitle("סקירה חיה: אוזניות האולפן והביטול רעשים הטובות ל-2026")
                    .pinnedSkuCode("AUDIO-SONY-XM5")
                    .pinnedProductName("Sony WH-1000XM5 Wireless ANC")
                    .retailPriceILS(BigDecimal.valueOf(1690.00))
                    .build());
        }
    }

    public List<CreatorLiveCampaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    public CreatorLiveCampaign createCampaign(CreateCreatorCampaignRequest request) {
        int buyerDiscountPct = 15;
        int creatorCommissionPct = 10;

        BigDecimal retail = request.getRetailPriceILS().setScale(2, RoundingMode.HALF_UP);
        BigDecimal livePrice = retail.multiply(BigDecimal.valueOf(0.85)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal commission = livePrice.multiply(BigDecimal.valueOf(0.10)).setScale(2, RoundingMode.HALF_UP);

        String cleanHandle = request.getCreatorHandle().replaceAll("[^A-Za-z0-9]", "").toUpperCase();
        if (cleanHandle.isEmpty()) {
            cleanHandle = "CREATOR";
        }
        String promoCode = cleanHandle.substring(0, Math.min(cleanHandle.length(), 6)) + "LIVE15";

        CreatorLiveCampaign campaign = CreatorLiveCampaign.builder()
                .campaignCode("LIVE-CR-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .creatorHandle(request.getCreatorHandle())
                .streamTitle(request.getStreamTitle())
                .pinnedSkuCode(request.getPinnedSkuCode())
                .pinnedProductName(request.getPinnedProductName())
                .creatorPromoCode(promoCode)
                .buyerDiscountPct(buyerDiscountPct)
                .creatorCommissionPct(creatorCommissionPct)
                .retailPriceILS(retail)
                .liveDropPriceILS(livePrice)
                .estimatedCreatorPayoutPerSaleILS(commission)
                .liveViewersCount(420)
                .status("LIVE_ON_AIR")
                .createdAt(Instant.now())
                .build();

        CreatorLiveCampaign saved = campaignRepository.save(campaign);
        try {
            kafkaTemplate.send("creator-affiliate-events", saved.getCampaignCode(),
                    "CREATOR_LIVE_STARTED:" + saved.getCreatorHandle() + ":PROMO:" + saved.getCreatorPromoCode());
        } catch (Exception e) {
            log.warn("Kafka creator campaign event skipped: {}", e.getMessage());
        }
        return saved;
    }
}
