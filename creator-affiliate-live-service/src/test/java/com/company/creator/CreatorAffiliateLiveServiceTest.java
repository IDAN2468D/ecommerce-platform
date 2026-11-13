package com.company.creator;

import com.company.creator.domain.CreatorLiveCampaign;
import com.company.creator.dto.CreateCreatorCampaignRequest;
import com.company.creator.repository.CreatorLiveCampaignRepository;
import com.company.creator.service.CreatorAffiliateLiveService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CreatorAffiliateLiveServiceTest {

    @Mock
    private CreatorLiveCampaignRepository campaignRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private CreatorAffiliateLiveService creatorService;

    @BeforeEach
    void setUp() {
        creatorService = new CreatorAffiliateLiveService(campaignRepository, kafkaTemplate);
    }

    @Test
    void createCampaign_Calculates15PercentViewerDiscountAnd10PercentCreatorCommission() {
        when(campaignRepository.save(any(CreatorLiveCampaign.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateCreatorCampaignRequest req = CreateCreatorCampaignRequest.builder()
                .creatorHandle("@NoaStream")
                .streamTitle("Live Gaming Drop")
                .pinnedSkuCode("ACC-KEYCHRON-Q1")
                .pinnedProductName("Keychron Q1 Pro")
                .retailPriceILS(BigDecimal.valueOf(1000.00))
                .build();

        CreatorLiveCampaign res = creatorService.createCampaign(req);
        assertEquals(BigDecimal.valueOf(850.00).setScale(2), res.getLiveDropPriceILS());
        assertEquals(BigDecimal.valueOf(85.00).setScale(2), res.getEstimatedCreatorPayoutPerSaleILS());
        assertEquals("NOASTR" + "LIVE15", res.getCreatorPromoCode());
    }
}
