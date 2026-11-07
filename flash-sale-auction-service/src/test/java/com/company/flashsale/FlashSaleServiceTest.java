package com.company.flashsale;

import com.company.flashsale.domain.FlashSaleCampaign;
import com.company.flashsale.dto.ClaimFlashDropRequest;
import com.company.flashsale.dto.PlaceBidRequest;
import com.company.flashsale.repository.FlashSaleCampaignRepository;
import com.company.flashsale.service.FlashSaleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FlashSaleServiceTest {

    @Mock
    private FlashSaleCampaignRepository campaignRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private FlashSaleService flashSaleService;

    @BeforeEach
    void setUp() {
        flashSaleService = new FlashSaleService(campaignRepository, kafkaTemplate);
    }

    @Test
    void claimFlashDrop_DecrementsStockAndMarksSoldOutWhenZero() {
        FlashSaleCampaign campaign = FlashSaleCampaign.builder()
                .id("camp_1")
                .campaignCode("FLASH-TEST")
                .status("ACTIVE")
                .remainingStock(1)
                .totalBidsCount(4)
                .build();

        when(campaignRepository.findById("camp_1")).thenReturn(Optional.of(campaign));
        when(campaignRepository.save(any(FlashSaleCampaign.class))).thenAnswer(inv -> inv.getArgument(0));

        ClaimFlashDropRequest req = ClaimFlashDropRequest.builder()
                .customerId("usr_demo")
                .quantity(1)
                .build();

        FlashSaleCampaign updated = flashSaleService.claimFlashDrop("camp_1", req);
        assertEquals(0, updated.getRemainingStock());
        assertEquals("SOLD_OUT", updated.getStatus());
        assertEquals(5, updated.getTotalBidsCount());
    }

    @Test
    void placeAuctionBid_ValidatesMinimumIncrementAndUpdatesHighestBidder() {
        FlashSaleCampaign auction = FlashSaleCampaign.builder()
                .id("auc_1")
                .campaignCode("AUC-TEST")
                .status("ACTIVE")
                .currentHighestBid(BigDecimal.valueOf(1000.00))
                .minBidIncrement(BigDecimal.valueOf(100.00))
                .totalBidsCount(2)
                .bidHistory(new ArrayList<>())
                .build();

        when(campaignRepository.findById("auc_1")).thenReturn(Optional.of(auction));
        when(campaignRepository.save(any(FlashSaleCampaign.class))).thenAnswer(inv -> inv.getArgument(0));

        PlaceBidRequest validBid = PlaceBidRequest.builder()
                .customerId("usr_demo")
                .customerName("עידן קזם")
                .bidAmount(BigDecimal.valueOf(1150.00))
                .build();

        FlashSaleCampaign updated = flashSaleService.placeAuctionBid("auc_1", validBid);
        assertEquals(BigDecimal.valueOf(1150.00), updated.getCurrentHighestBid());
        assertEquals("usr_demo", updated.getHighestBidderId());
        assertEquals(3, updated.getTotalBidsCount());
        assertEquals(1, updated.getBidHistory().size());
    }
}
