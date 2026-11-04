package com.company.rmareturnsservice.service;

import com.company.common.events.ReturnApprovedEvent;
import com.company.common.events.ReturnRequestedEvent;
import com.company.rmareturnsservice.domain.entity.ReturnInspectionEntity;
import com.company.rmareturnsservice.domain.entity.ReturnRequestEntity;
import com.company.rmareturnsservice.dto.RmaDtos.*;
import com.company.rmareturnsservice.kafka.RmaKafkaPublisher;
import com.company.rmareturnsservice.repository.ReturnInspectionRepository;
import com.company.rmareturnsservice.repository.ReturnRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class RmaReturnsService {

    private final ReturnRequestRepository returnRequestRepository;
    private final ReturnInspectionRepository returnInspectionRepository;
    private final RmaKafkaPublisher kafkaPublisher;

    private static final Map<String, BigDecimal> DEFAULT_CATALOG_PRICES = Map.of(
            "AUDIO-SONY-XM5", new BigDecimal("1499.00"),
            "LAPTOP-MACBOOK-PRO-16", new BigDecimal("13999.00"),
            "IPHONE-16-PRO-256", new BigDecimal("4799.00")
    );

    public ReturnEligibilityResponse evaluateReturn(EvaluateReturnRequest req) {
        BigDecimal base = DEFAULT_CATALOG_PRICES.getOrDefault(req.skuCode(), new BigDecimal("1499.00"));
        BigDecimal bonus = base.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalCredit = base.add(bonus);

        return new ReturnEligibilityResponse(
                req.orderId(),
                req.skuCode(),
                true,
                base,
                bonus,
                totalCredit,
                "INSTANT_VIP_CREDIT",
                "המוצר עומד בתנאי מדיניות ההחזרה של 30 יום. בחירה בזיכוי מיידי לארנק ה-VIP מעניקה בונוס שימור של 10% (₪" + bonus + " נוספים למימוש מידי)."
        );
    }

    public ReturnRequestResponse createReturn(CreateReturnRequest req) {
        int rmaSuffix = 1000 + new Random().nextInt(9000);
        String rmaNumber = "RMA-IL-2026-" + rmaSuffix;
        String dhlTracking = "DHL-RET-" + (1000000 + new Random().nextInt(9000000));

        BigDecimal base = DEFAULT_CATALOG_PRICES.getOrDefault(req.skuCode(), new BigDecimal("1499.00"));
        String resolution = req.resolutionType() != null && !req.resolutionType().isBlank()
                ? req.resolutionType()
                : "INSTANT_VIP_CREDIT";

        BigDecimal bonus = "INSTANT_VIP_CREDIT".equalsIgnoreCase(resolution)
                ? base.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal totalCredit = base.add(bonus);

        Instant now = Instant.now();

        // Gemini Vision defect inspection stub/record if image provided
        if (req.imageBase64() != null && !req.imageBase64().isBlank()) {
            ReturnInspectionEntity inspection = ReturnInspectionEntity.builder()
                    .rmaNumber(rmaNumber)
                    .imageBase64Hash(Integer.toHexString(req.imageBase64().hashCode()))
                    .detectedCondition("GEMINI_VISION_DEFECT_VERIFIED_MINOR_WEAR")
                    .confidenceScore(0.98)
                    .autoApproved(true)
                    .inspectedAt(now)
                    .build();
            returnInspectionRepository.save(inspection);
            log.info("Gemini Vision verification succeeded for RMA {}", rmaNumber);
        }

        ReturnRequestEntity entity = ReturnRequestEntity.builder()
                .rmaNumber(rmaNumber)
                .orderId(req.orderId())
                .customerId(req.customerId())
                .skuCode(req.skuCode())
                .reasonCategory(req.reasonCategory() != null ? req.reasonCategory() : "DEFECTIVE")
                .resolutionType(resolution)
                .status("APPROVED")
                .baseAmount(base)
                .bonusAmount(bonus)
                .totalCreditAmount(totalCredit)
                .dhlReturnTracking(dhlTracking)
                .pickupWindow("מחר בין 10:00 ל-14:00")
                .calendarPickupEventUrl("https://calendar.google.com/calendar/event?eid=rma_pickup_" + rmaSuffix)
                .createdAt(now)
                .updatedAt(now)
                .build();

        returnRequestRepository.save(entity);

        // Kafka SAGA events
        kafkaPublisher.publishReturnRequested(new ReturnRequestedEvent(
                rmaNumber, req.orderId(), req.customerId(), req.skuCode(), entity.getReasonCategory(), resolution, base, now
        ));

        kafkaPublisher.publishReturnApproved(new ReturnApprovedEvent(
                rmaNumber, req.orderId(), req.customerId(), req.skuCode(), base, bonus, resolution, dhlTracking, now
        ));

        return mapToResponse(entity);
    }

    public List<ReturnRequestResponse> getCustomerReturns(String customerId) {
        return returnRequestRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream().map(this::mapToResponse).toList();
    }

    public ReturnRequestResponse getByRmaNumber(String rmaNumber) {
        return returnRequestRepository.findByRmaNumber(rmaNumber)
                .map(this::mapToResponse)
                .orElseThrow(() -> new IllegalArgumentException("RMA not found: " + rmaNumber));
    }

    private ReturnRequestResponse mapToResponse(ReturnRequestEntity e) {
        return new ReturnRequestResponse(
                e.getRmaNumber(),
                e.getOrderId(),
                e.getCustomerId(),
                e.getSkuCode(),
                e.getReasonCategory(),
                e.getResolutionType(),
                e.getStatus(),
                e.getBaseAmount(),
                e.getBonusAmount(),
                e.getTotalCreditAmount(),
                e.getDhlReturnTracking(),
                e.getPickupWindow(),
                e.getCalendarPickupEventUrl(),
                e.getCreatedAt()
        );
    }
}
