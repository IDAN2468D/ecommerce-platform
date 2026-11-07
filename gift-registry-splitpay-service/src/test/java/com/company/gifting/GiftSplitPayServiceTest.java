package com.company.gifting;

import com.company.gifting.domain.SocialGiftCampaign;
import com.company.gifting.dto.ContributeGiftRequest;
import com.company.gifting.repository.SocialGiftRepository;
import com.company.gifting.service.GiftSplitPayService;
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
class GiftSplitPayServiceTest {

    @Mock
    private SocialGiftRepository giftRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private GiftSplitPayService giftService;

    @BeforeEach
    void setUp() {
        giftService = new GiftSplitPayService(giftRepository, kafkaTemplate);
    }

    @Test
    void contribute_MarksCampaignFundedWhenTargetReached() {
        SocialGiftCampaign camp = SocialGiftCampaign.builder()
                .id("gift_1")
                .campaignCode("GIFT-TEST")
                .targetAmountILS(BigDecimal.valueOf(1000.00))
                .raisedAmountILS(BigDecimal.valueOf(800.00))
                .status("COLLECTING")
                .contributions(new ArrayList<>())
                .build();

        when(giftRepository.findById("gift_1")).thenReturn(Optional.of(camp));
        when(giftRepository.save(any(SocialGiftCampaign.class))).thenAnswer(inv -> inv.getArgument(0));

        ContributeGiftRequest req = ContributeGiftRequest.builder()
                .contributorName("עידן")
                .amountILS(BigDecimal.valueOf(250.00))
                .greetingMessage("מזל טוב!")
                .build();

        SocialGiftCampaign updated = giftService.contribute("gift_1", req);
        assertEquals(BigDecimal.valueOf(1050.00), updated.getRaisedAmountILS());
        assertEquals("FUNDED_ORDER_DISPATCHED", updated.getStatus());
        assertEquals(1, updated.getContributions().size());
    }
}
