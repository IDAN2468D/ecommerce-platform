package com.company.tradein.service;

import com.company.tradein.domain.TradeInAppraisal;
import com.company.tradein.dto.CreateTradeInRequest;
import com.company.tradein.repository.TradeInAppraisalRepository;
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
public class TradeInService {

    private final TradeInAppraisalRepository appraisalRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @PostConstruct
    public void seedAppraisalsIfEmpty() {
        if (appraisalRepository.count() == 0) {
            log.info("Seeding initial AI Trade-In appraisals...");
            appraisalRepository.saveAll(List.of(
                    TradeInAppraisal.builder()
                            .appraisalCode("APR-2026-9910")
                            .customerId("usr_demo")
                            .deviceCategory("COMPUTERS")
                            .deviceModel("Apple MacBook Pro 14 M1 Pro (2022)")
                            .serialOrImei("SN-APL-M1P-88412")
                            .conditionGrade("MINT_A_PLUS")
                            .baseMarketValueILS(BigDecimal.valueOf(5800.00))
                            .approvedCreditILS(BigDecimal.valueOf(3480.00))
                            .tradeInVoucherCode("TRD-IL-M1PRO-3480")
                            .resaleRetention24mPct(74)
                            .status("APPROVED_VOUCHER_ISSUED")
                            .createdAt(Instant.now())
                            .build(),
                    TradeInAppraisal.builder()
                            .appraisalCode("APR-2026-9911")
                            .customerId("usr_demo")
                            .deviceCategory("AUDIO")
                            .deviceModel("Sony WH-1000XM4 Wireless Headphones")
                            .serialOrImei("SN-SNY-XM4-33910")
                            .conditionGrade("GOOD_A")
                            .baseMarketValueILS(BigDecimal.valueOf(1190.00))
                            .approvedCreditILS(BigDecimal.valueOf(535.50))
                            .tradeInVoucherCode("TRD-IL-XM4-535")
                            .resaleRetention24mPct(68)
                            .status("APPROVED_VOUCHER_ISSUED")
                            .createdAt(Instant.now())
                            .build()
            ));
        }
    }

    public List<TradeInAppraisal> getCustomerAppraisals(String customerId) {
        return appraisalRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    public TradeInAppraisal appraiseDevice(CreateTradeInRequest request) {
        double multiplier = switch (request.getConditionGrade().toUpperCase()) {
            case "MINT_A_PLUS" -> 0.60;
            case "GOOD_A" -> 0.45;
            default -> 0.30;
        };

        BigDecimal credit = request.getOriginalRetailPriceILS()
                .multiply(BigDecimal.valueOf(multiplier))
                .setScale(2, RoundingMode.HALF_UP);

        String voucherCode = "TRD-IL-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        TradeInAppraisal appraisal = TradeInAppraisal.builder()
                .appraisalCode("APR-2026-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .customerId(request.getCustomerId())
                .deviceCategory(request.getDeviceCategory() != null ? request.getDeviceCategory() : "ELECTRONICS")
                .deviceModel(request.getDeviceModel())
                .serialOrImei(request.getSerialOrImei() != null ? request.getSerialOrImei() : "SN-VERIFIED-AI")
                .conditionGrade(request.getConditionGrade().toUpperCase())
                .baseMarketValueILS(request.getOriginalRetailPriceILS())
                .approvedCreditILS(credit)
                .tradeInVoucherCode(voucherCode)
                .resaleRetention24mPct(72)
                .status("APPROVED_VOUCHER_ISSUED")
                .createdAt(Instant.now())
                .build();

        TradeInAppraisal saved = appraisalRepository.save(appraisal);
        try {
            kafkaTemplate.send("trade-in-events", saved.getAppraisalCode(),
                    "TRADE_IN_APPROVED:" + saved.getCustomerId() + ":₪" + saved.getApprovedCreditILS());
        } catch (Exception e) {
            log.warn("Kafka trade-in event skipped: {}", e.getMessage());
        }
        return saved;
    }
}
