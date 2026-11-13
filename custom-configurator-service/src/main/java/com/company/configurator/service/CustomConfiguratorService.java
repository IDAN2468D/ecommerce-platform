package com.company.configurator.service;

import com.company.configurator.domain.CustomRigBuild;
import com.company.configurator.dto.CreateCustomBuildRequest;
import com.company.configurator.repository.CustomRigBuildRepository;
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
public class CustomConfiguratorService {

    private final CustomRigBuildRepository buildRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @PostConstruct
    public void seedBuildsIfEmpty() {
        if (buildRepository.count() == 0) {
            log.info("Seeding initial AI Custom Studio & Workstation Rig Builds...");
            createBuild(CreateCustomBuildRequest.builder()
                    .customerId("cust_vip_idan")
                    .rigProfileType("AI_WORKSTATION_AND_PODCAST_STUDIO")
                    .selectedSkus(List.of("COMP-MACBOOK-M3", "MON-LG-OLED42", "AUDIO-SONY-XM5", "ACC-KEYCHRON-Q1"))
                    .baseComponentsTotalILS(BigDecimal.valueOf(21450.00))
                    .build());
        }
    }

    public List<CustomRigBuild> getAllBuilds() {
        return buildRepository.findAll();
    }

    public CustomRigBuild createBuild(CreateCustomBuildRequest request) {
        int count = request.getSelectedSkus().size();
        int discountPct = count >= 4 ? 14 : (count >= 3 ? 10 : 6);
        int estimatedWattage = 120 + (count * 85);

        BigDecimal factor = BigDecimal.valueOf(100 - discountPct)
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal finalPrice = request.getBaseComponentsTotalILS()
                .multiply(factor)
                .setScale(2, RoundingMode.HALF_UP);

        CustomRigBuild build = CustomRigBuild.builder()
                .buildCode("RIG-AI-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .customerId(request.getCustomerId())
                .rigProfileType(request.getRigProfileType())
                .selectedSkus(request.getSelectedSkus())
                .componentCount(count)
                .compatibilityScorePct(100)
                .estimatedWattage(estimatedWattage)
                .zeroBottleneckVerified(true)
                .baseComponentsTotalILS(request.getBaseComponentsTotalILS().setScale(2, RoundingMode.HALF_UP))
                .assemblyDiscountPct(discountPct)
                .finalBuildPriceILS(finalPrice)
                .status("COMPATIBILITY_VERIFIED_100")
                .createdAt(Instant.now())
                .build();

        CustomRigBuild saved = buildRepository.save(build);
        try {
            kafkaTemplate.send("custom-configurator-events", saved.getBuildCode(),
                    "CUSTOM_RIG_VERIFIED:" + saved.getBuildCode() + ":₪" + saved.getFinalBuildPriceILS());
        } catch (Exception e) {
            log.warn("Kafka configurator event skipped: {}", e.getMessage());
        }
        return saved;
    }
}
