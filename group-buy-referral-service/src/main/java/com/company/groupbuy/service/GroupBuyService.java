package com.company.groupbuy.service;

import com.company.groupbuy.domain.GroupBuySquad;
import com.company.groupbuy.dto.JoinGroupBuyRequest;
import com.company.groupbuy.repository.GroupBuySquadRepository;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class GroupBuyService {

    private final GroupBuySquadRepository squadRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @PostConstruct
    public void seedSquadsIfEmpty() {
        if (squadRepository.count() == 0) {
            log.info("Seeding initial Social Group Buy squads...");
            List<GroupBuySquad> seeds = List.of(
                    GroupBuySquad.builder()
                            .squadCode("SQUAD-DYSON-V15")
                            .skuCode("HOME-DYSON-V15")
                            .productName("Dyson V15 Detect Absolute Laser Vacuum")
                            .imageUrl("https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80")
                            .regularPrice(BigDecimal.valueOf(3190.00))
                            .squadPrice(BigDecimal.valueOf(2290.00))
                            .discountPercent(28)
                            .targetParticipants(10)
                            .currentParticipants(8)
                            .status("OPEN")
                            .referralCode("REF-NEXUS-DYSON")
                            .affiliateRewardPoints(BigDecimal.valueOf(120.0))
                            .expiresAt(Instant.now().plus(14, ChronoUnit.HOURS))
                            .participantNames(new ArrayList<>(List.of("עידן ק.", "נועה ל.", "יונתן מ.", "מאיה ש.", "אלון ב.", "שירה ד.", "גיא ר.", "תמר כ.")))
                            .build(),
                    GroupBuySquad.builder()
                            .squadCode("SQUAD-BREVILLE-BARISTA")
                            .skuCode("COFFEE-BREVILLE-PRO")
                            .productName("Breville Barista Touch Impress Espresso Machine")
                            .imageUrl("https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80")
                            .regularPrice(BigDecimal.valueOf(4490.00))
                            .squadPrice(BigDecimal.valueOf(3290.00))
                            .discountPercent(27)
                            .targetParticipants(6)
                            .currentParticipants(5)
                            .status("OPEN")
                            .referralCode("REF-NEXUS-COFFEE")
                            .affiliateRewardPoints(BigDecimal.valueOf(165.0))
                            .expiresAt(Instant.now().plus(9, ChronoUnit.HOURS))
                            .participantNames(new ArrayList<>(List.of("איתי ג.", "רוני פ.", "עומר ח.", "ליאור ס.", "דנה א.")))
                            .build(),
                    GroupBuySquad.builder()
                            .squadCode("SQUAD-LG-OLED-C4")
                            .skuCode("TV-LG-OLED65")
                            .productName("LG OLED evo C4 65-inch 4K Smart Gaming TV")
                            .imageUrl("https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80")
                            .regularPrice(BigDecimal.valueOf(7990.00))
                            .squadPrice(BigDecimal.valueOf(5890.00))
                            .discountPercent(26)
                            .targetParticipants(8)
                            .currentParticipants(8)
                            .status("UNLOCKED")
                            .referralCode("REF-NEXUS-OLED")
                            .affiliateRewardPoints(BigDecimal.valueOf(295.0))
                            .expiresAt(Instant.now().plus(18, ChronoUnit.HOURS))
                            .participantNames(new ArrayList<>(List.of("ניר ק.", "מיכל ז.", "אביב ת.", "שני ו.", "ברק ה.", "הדס מ.", "יובל נ.", "קורל צ.")))
                            .build()
            );
            squadRepository.saveAll(seeds);
        }
    }

    public List<GroupBuySquad> getAllSquads() {
        return squadRepository.findAll();
    }

    public synchronized GroupBuySquad joinSquad(String idOrCode, JoinGroupBuyRequest request) {
        GroupBuySquad squad = squadRepository.findById(idOrCode)
                .or(() -> squadRepository.findBySquadCode(idOrCode))
                .orElseThrow(() -> new IllegalArgumentException("Group Buy Squad not found: " + idOrCode));

        squad.setCurrentParticipants(squad.getCurrentParticipants() + 1);
        if (squad.getParticipantNames() == null) {
            squad.setParticipantNames(new ArrayList<>());
        }
        String displayName = request.getCustomerName() != null && !request.getCustomerName().isBlank()
                ? request.getCustomerName()
                : "חבר VIP (" + request.getCustomerId() + ")";
        squad.getParticipantNames().add(displayName);

        if (squad.getCurrentParticipants() >= squad.getTargetParticipants()) {
            squad.setStatus("UNLOCKED");
        }

        GroupBuySquad saved = squadRepository.save(squad);
        try {
            kafkaTemplate.send("group-buy-events", saved.getSquadCode(),
                    "SQUAD_JOINED:" + request.getCustomerId() + ":STATUS=" + saved.getStatus());
        } catch (Exception e) {
            log.warn("Kafka group-buy event skipped: {}", e.getMessage());
        }
        return saved;
    }
}
