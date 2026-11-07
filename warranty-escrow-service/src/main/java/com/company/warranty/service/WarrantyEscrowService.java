package com.company.warranty.service;

import com.company.warranty.domain.DigitalWarrantyCertificate;
import com.company.warranty.dto.WarrantyClaimRequest;
import com.company.warranty.repository.DigitalWarrantyRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class WarrantyEscrowService {

    private final DigitalWarrantyRepository warrantyRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @PostConstruct
    public void seedInitialCertificatesIfEmpty() {
        if (warrantyRepository.count() == 0) {
            log.info("Seeding initial SHA-256 Digital Warranty Certificates & Escrow records...");
            Instant now = Instant.now();
            List<DigitalWarrantyCertificate> seeds = List.of(
                    DigitalWarrantyCertificate.builder()
                            .certificateNumber("WRN-IL-2026-8841")
                            .customerId("usr_demo")
                            .orderId("ORD-9082")
                            .skuCode("AUDIO-SONY-XM5")
                            .productName("Sony WH-1000XM5 Wireless Noise Cancelling")
                            .serialNumber("SN-SONY-99482104")
                            .vendorName("Sony Official Store Israel")
                            .purchaseAmount(BigDecimal.valueOf(1490.00))
                            .escrowAmountHeld(BigDecimal.valueOf(1341.00))
                            .escrowStatus("HELD_IN_ESCROW")
                            .warrantyStatus("ACTIVE")
                            .sha256Signature(computeSha256("WRN-IL-2026-8841|usr_demo|SN-SONY-99482104"))
                            .coverageMonths(24)
                            .issuedAt(now.minus(3, ChronoUnit.DAYS))
                            .expiresAt(now.plus(727, ChronoUnit.DAYS))
                            .build(),
                    DigitalWarrantyCertificate.builder()
                            .certificateNumber("WRN-IL-2026-7719")
                            .customerId("usr_demo")
                            .orderId("ORD-8410")
                            .skuCode("COMP-MACBOOK-M3")
                            .productName("Apple MacBook Pro 14 M3 Pro")
                            .serialNumber("SN-APL-M3PRO-77219")
                            .vendorName("iStore Premium Reseller")
                            .purchaseAmount(BigDecimal.valueOf(8990.00))
                            .escrowAmountHeld(BigDecimal.ZERO)
                            .escrowStatus("RELEASED_TO_VENDOR")
                            .warrantyStatus("ACTIVE")
                            .sha256Signature(computeSha256("WRN-IL-2026-7719|usr_demo|SN-APL-M3PRO-77219"))
                            .coverageMonths(36)
                            .issuedAt(now.minus(32, ChronoUnit.DAYS))
                            .expiresAt(now.plus(1063, ChronoUnit.DAYS))
                            .build()
            );
            warrantyRepository.saveAll(seeds);
        }
    }

    public List<DigitalWarrantyCertificate> getCustomerWarranties(String customerId) {
        return warrantyRepository.findByCustomerIdOrderByIssuedAtDesc(customerId);
    }

    public DigitalWarrantyCertificate releaseEscrowToVendor(String idOrCertNumber) {
        DigitalWarrantyCertificate cert = warrantyRepository.findById(idOrCertNumber)
                .or(() -> warrantyRepository.findByCertificateNumber(idOrCertNumber))
                .orElseThrow(() -> new IllegalArgumentException("Certificate not found: " + idOrCertNumber));

        cert.setEscrowStatus("RELEASED_TO_VENDOR");
        cert.setEscrowAmountHeld(BigDecimal.ZERO);

        DigitalWarrantyCertificate saved = warrantyRepository.save(cert);
        try {
            kafkaTemplate.send("warranty-events", saved.getCertificateNumber(),
                    "ESCROW_RELEASED:" + saved.getVendorName() + ":ORD=" + saved.getOrderId());
        } catch (Exception e) {
            log.warn("Kafka escrow event skipped: {}", e.getMessage());
        }
        return saved;
    }

    public DigitalWarrantyCertificate submitWarrantyClaim(String idOrCertNumber, WarrantyClaimRequest request) {
        DigitalWarrantyCertificate cert = warrantyRepository.findById(idOrCertNumber)
                .or(() -> warrantyRepository.findByCertificateNumber(idOrCertNumber))
                .orElseThrow(() -> new IllegalArgumentException("Certificate not found: " + idOrCertNumber));

        cert.setWarrantyStatus("CLAIM_OPENED");
        cert.setActiveClaimDescription(request.getIssueDescription());

        DigitalWarrantyCertificate saved = warrantyRepository.save(cert);
        try {
            kafkaTemplate.send("warranty-events", saved.getCertificateNumber(),
                    "WARRANTY_CLAIM_OPENED:" + saved.getCustomerId() + ":" + request.getIssueDescription());
        } catch (Exception e) {
            log.warn("Kafka warranty claim event skipped: {}", e.getMessage());
        }
        return saved;
    }

    public String computeSha256(String payload) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return "sha256-fallback-" + Math.abs(payload.hashCode());
        }
    }
}
