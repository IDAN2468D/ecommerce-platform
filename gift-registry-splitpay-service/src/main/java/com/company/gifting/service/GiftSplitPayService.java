package com.company.gifting.service;

import com.company.gifting.domain.SocialGiftCampaign;
import com.company.gifting.dto.ContributeGiftRequest;
import com.company.gifting.repository.SocialGiftRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GiftSplitPayService {

    private final SocialGiftRepository giftRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @PostConstruct
    public void seedCampaignsIfEmpty() {
        if (giftRepository.count() == 0) {
            log.info("Seeding initial Social Gifting & Split-Pay campaigns...");
            giftRepository.saveAll(List.of(
                    SocialGiftCampaign.builder()
                            .campaignCode("GIFT-PS5-PRO-BDAY")
                            .recipientName("עומר לוי")
                            .occasionTitle("מתנת יום הולדת 30 מהחבר'ה")
                            .skuCode("GAME-PS5-PRO-30")
                            .productName("PlayStation 5 Pro + 2 DualSense Controllers")
                            .imageUrl("https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80")
                            .targetAmountILS(BigDecimal.valueOf(3800.00))
                            .raisedAmountILS(BigDecimal.valueOf(3100.00))
                            .status("COLLECTING")
                            .contributions(new ArrayList<>(List.of(
                                    SocialGiftCampaign.GiftContribution.builder()
                                            .contributorName("עידן ק.")
                                            .amountILS(BigDecimal.valueOf(800.00))
                                            .greetingMessage("מזל טוב אח יקר! שתהנה מכל רגע 🎮")
                                            .timestamp(Instant.now())
                                            .build(),
                                    SocialGiftCampaign.GiftContribution.builder()
                                            .contributorName("נועה וגיא")
                                            .amountILS(BigDecimal.valueOf(1200.00))
                                            .greetingMessage("יום הולדת 30 שמח! מחכים לטורניר פיפ״א")
                                            .timestamp(Instant.now())
                                            .build()
                            )))
                            .build(),
                    SocialGiftCampaign.builder()
                            .campaignCode("GIFT-BREVILLE-WEDDING")
                            .recipientName("מאיה ויונתן")
                            .occasionTitle("מתנת חתונה מצוות הפיתוח")
                            .skuCode("COFFEE-BREVILLE-PRO")
                            .productName("Breville Barista Touch Impress Espresso Machine")
                            .imageUrl("https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80")
                            .targetAmountILS(BigDecimal.valueOf(4200.00))
                            .raisedAmountILS(BigDecimal.valueOf(3650.00))
                            .status("COLLECTING")
                            .contributions(new ArrayList<>())
                            .build()
            ));
        }
    }

    public List<SocialGiftCampaign> getAllCampaigns() {
        return giftRepository.findAll();
    }

    public synchronized SocialGiftCampaign contribute(String idOrCode, ContributeGiftRequest request) {
        SocialGiftCampaign camp = giftRepository.findById(idOrCode)
                .or(() -> giftRepository.findByCampaignCode(idOrCode))
                .orElseThrow(() -> new IllegalArgumentException("Gift campaign not found: " + idOrCode));

        camp.setRaisedAmountILS(camp.getRaisedAmountILS().add(request.getAmountILS()));
        if (camp.getContributions() == null) {
            camp.setContributions(new ArrayList<>());
        }
        camp.getContributions().add(0, SocialGiftCampaign.GiftContribution.builder()
                .contributorName(request.getContributorName())
                .amountILS(request.getAmountILS())
                .greetingMessage(request.getGreetingMessage() != null ? request.getGreetingMessage() : "מזל טוב! 🎁")
                .timestamp(Instant.now())
                .build());

        if (camp.getRaisedAmountILS().compareTo(camp.getTargetAmountILS()) >= 0) {
            camp.setStatus("FUNDED_ORDER_DISPATCHED");
        }

        SocialGiftCampaign saved = giftRepository.save(camp);
        try {
            kafkaTemplate.send("gifting-events", saved.getCampaignCode(),
                    "GIFT_CONTRIBUTION:" + request.getContributorName() + ":₪" + request.getAmountILS());
        } catch (Exception e) {
            log.warn("Kafka gifting event skipped: {}", e.getMessage());
        }
        return saved;
    }
}
