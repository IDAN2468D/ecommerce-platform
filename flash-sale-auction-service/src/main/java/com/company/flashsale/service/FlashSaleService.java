package com.company.flashsale.service;

import com.company.flashsale.domain.FlashSaleCampaign;
import com.company.flashsale.dto.ClaimFlashDropRequest;
import com.company.flashsale.dto.PlaceBidRequest;
import com.company.flashsale.repository.FlashSaleCampaignRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FlashSaleService {

    private final FlashSaleCampaignRepository campaignRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @PostConstruct
    public void seedCampaignsIfEmpty() {
        if (campaignRepository.count() == 0) {
            log.info("Seeding initial Flash Drops & Live Auctions...");
            List<FlashSaleCampaign> seeds = List.of(
                    FlashSaleCampaign.builder()
                            .campaignCode("FLASH-SONY-XM5-GOLD")
                            .skuCode("AUDIO-SONY-XM5")
                            .productName("Sony WH-1000XM5 Limited Midnight Gold Edition")
                            .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80")
                            .campaignType("FLASH_DROP")
                            .retailPrice(BigDecimal.valueOf(1690.00))
                            .flashOrStartingPrice(BigDecimal.valueOf(1099.00))
                            .currentHighestBid(BigDecimal.valueOf(1099.00))
                            .minBidIncrement(BigDecimal.ZERO)
                            .totalStock(25)
                            .remainingStock(7)
                            .totalBidsCount(18)
                            .status("ACTIVE")
                            .endsAt(Instant.now().plus(4, ChronoUnit.HOURS))
                            .bidHistory(new ArrayList<>())
                            .build(),
                    FlashSaleCampaign.builder()
                            .campaignCode("AUC-MACBOOK-M3-MAX")
                            .skuCode("COMP-MACBOOK-M3")
                            .productName("Apple MacBook Pro 16 M3 Max 64GB Collector's Bundle")
                            .imageUrl("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80")
                            .campaignType("LIVE_AUCTION")
                            .retailPrice(BigDecimal.valueOf(14990.00))
                            .flashOrStartingPrice(BigDecimal.valueOf(9500.00))
                            .currentHighestBid(BigDecimal.valueOf(10450.00))
                            .minBidIncrement(BigDecimal.valueOf(150.00))
                            .highestBidderId("usr_vip_88")
                            .highestBidderName("דניאל כ.")
                            .totalStock(1)
                            .remainingStock(1)
                            .totalBidsCount(9)
                            .status("ACTIVE")
                            .endsAt(Instant.now().plus(2, ChronoUnit.HOURS))
                            .bidHistory(new ArrayList<>(List.of(
                                    FlashSaleCampaign.AuctionBidRecord.builder()
                                            .bidId("BID-901")
                                            .customerId("usr_vip_88")
                                            .customerName("דניאל כ.")
                                            .amount(BigDecimal.valueOf(10450.00))
                                            .timestamp(Instant.now().minus(8, ChronoUnit.MINUTES))
                                            .build()
                            )))
                            .build(),
                    FlashSaleCampaign.builder()
                            .campaignCode("AUC-PS5-PRO-30TH")
                            .skuCode("GAME-PS5-PRO-30")
                            .productName("PlayStation 5 Pro 30th Anniversary Limited Bundle")
                            .imageUrl("https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80")
                            .campaignType("LIVE_AUCTION")
                            .retailPrice(BigDecimal.valueOf(4890.00))
                            .flashOrStartingPrice(BigDecimal.valueOf(3100.00))
                            .currentHighestBid(BigDecimal.valueOf(3550.00))
                            .minBidIncrement(BigDecimal.valueOf(100.00))
                            .highestBidderId("usr_vip_19")
                            .highestBidderName("רועי א.")
                            .totalStock(1)
                            .remainingStock(1)
                            .totalBidsCount(6)
                            .status("ACTIVE")
                            .endsAt(Instant.now().plus(6, ChronoUnit.HOURS))
                            .bidHistory(new ArrayList<>())
                            .build()
            );
            campaignRepository.saveAll(seeds);
        }
    }

    public List<FlashSaleCampaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    public FlashSaleCampaign getCampaign(String idOrCode) {
        return campaignRepository.findById(idOrCode)
                .or(() -> campaignRepository.findByCampaignCode(idOrCode))
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found: " + idOrCode));
    }

    public synchronized FlashSaleCampaign claimFlashDrop(String idOrCode, ClaimFlashDropRequest request) {
        FlashSaleCampaign campaign = getCampaign(idOrCode);
        if (!"ACTIVE".equals(campaign.getStatus()) || campaign.getRemainingStock() < request.getQuantity()) {
            throw new IllegalStateException("Flash Drop sold out or insufficient remaining units");
        }

        campaign.setRemainingStock(campaign.getRemainingStock() - request.getQuantity());
        campaign.setTotalBidsCount(campaign.getTotalBidsCount() + request.getQuantity());
        if (campaign.getRemainingStock() == 0) {
            campaign.setStatus("SOLD_OUT");
        }

        FlashSaleCampaign saved = campaignRepository.save(campaign);
        try {
            kafkaTemplate.send("flash-sale-events", saved.getCampaignCode(),
                    "FLASH_DROP_CLAIMED:" + request.getCustomerId() + ":QTY=" + request.getQuantity());
        } catch (Exception e) {
            log.warn("Kafka flash drop event skipped: {}", e.getMessage());
        }
        return saved;
    }

    public synchronized FlashSaleCampaign placeAuctionBid(String idOrCode, PlaceBidRequest request) {
        FlashSaleCampaign campaign = getCampaign(idOrCode);
        if (!"ACTIVE".equals(campaign.getStatus())) {
            throw new IllegalStateException("Auction is no longer active");
        }

        BigDecimal minRequired = campaign.getCurrentHighestBid().add(
                campaign.getMinBidIncrement() != null ? campaign.getMinBidIncrement() : BigDecimal.valueOf(50));
        if (request.getBidAmount().compareTo(minRequired) < 0) {
            throw new IllegalArgumentException("Bid must be at least ₪" + minRequired);
        }

        campaign.setCurrentHighestBid(request.getBidAmount());
        campaign.setHighestBidderId(request.getCustomerId());
        campaign.setHighestBidderName(request.getCustomerName() != null ? request.getCustomerName() : "חבר מועדון VIP");
        campaign.setTotalBidsCount(campaign.getTotalBidsCount() + 1);

        if (campaign.getBidHistory() == null) {
            campaign.setBidHistory(new ArrayList<>());
        }
        campaign.getBidHistory().add(0, FlashSaleCampaign.AuctionBidRecord.builder()
                .bidId("BID-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .customerId(request.getCustomerId())
                .customerName(campaign.getHighestBidderName())
                .amount(request.getBidAmount())
                .timestamp(Instant.now())
                .build());

        FlashSaleCampaign saved = campaignRepository.save(campaign);
        try {
            kafkaTemplate.send("flash-sale-events", saved.getCampaignCode(),
                    "AUCTION_BID_PLACED:" + request.getCustomerId() + ":₪" + request.getBidAmount());
        } catch (Exception e) {
            log.warn("Kafka auction bid event skipped: {}", e.getMessage());
        }
        return saved;
    }
}
