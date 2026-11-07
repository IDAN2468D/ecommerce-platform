package com.company.warranty;

import com.company.warranty.domain.DigitalWarrantyCertificate;
import com.company.warranty.dto.WarrantyClaimRequest;
import com.company.warranty.repository.DigitalWarrantyRepository;
import com.company.warranty.service.WarrantyEscrowService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WarrantyEscrowServiceTest {

    @Mock
    private DigitalWarrantyRepository warrantyRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private WarrantyEscrowService warrantyEscrowService;

    @BeforeEach
    void setUp() {
        warrantyEscrowService = new WarrantyEscrowService(warrantyRepository, kafkaTemplate);
    }

    @Test
    void releaseEscrowToVendor_SetsStatusReleasedAndZerosHeldBalance() {
        DigitalWarrantyCertificate cert = DigitalWarrantyCertificate.builder()
                .id("cert_1")
                .certificateNumber("WRN-IL-2026-1001")
                .escrowAmountHeld(BigDecimal.valueOf(1341.00))
                .escrowStatus("HELD_IN_ESCROW")
                .build();

        when(warrantyRepository.findById("cert_1")).thenReturn(Optional.of(cert));
        when(warrantyRepository.save(any(DigitalWarrantyCertificate.class))).thenAnswer(inv -> inv.getArgument(0));

        DigitalWarrantyCertificate updated = warrantyEscrowService.releaseEscrowToVendor("cert_1");
        assertEquals("RELEASED_TO_VENDOR", updated.getEscrowStatus());
        assertEquals(BigDecimal.ZERO, updated.getEscrowAmountHeld());
    }

    @Test
    void submitWarrantyClaim_UpdatesStatusToClaimOpened() {
        DigitalWarrantyCertificate cert = DigitalWarrantyCertificate.builder()
                .id("cert_2")
                .certificateNumber("WRN-IL-2026-1002")
                .warrantyStatus("ACTIVE")
                .build();

        when(warrantyRepository.findById("cert_2")).thenReturn(Optional.of(cert));
        when(warrantyRepository.save(any(DigitalWarrantyCertificate.class))).thenAnswer(inv -> inv.getArgument(0));

        WarrantyClaimRequest req = WarrantyClaimRequest.builder()
                .issueDescription("סוללה מתרוקנת מהר בצד ימין")
                .build();

        DigitalWarrantyCertificate updated = warrantyEscrowService.submitWarrantyClaim("cert_2", req);
        assertEquals("CLAIM_OPENED", updated.getWarrantyStatus());
        assertEquals("סוללה מתרוקנת מהר בצד ימין", updated.getActiveClaimDescription());
    }
}
