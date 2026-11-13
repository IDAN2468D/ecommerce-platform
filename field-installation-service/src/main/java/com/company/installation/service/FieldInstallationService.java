package com.company.installation.service;

import com.company.installation.domain.FieldInstallationBooking;
import com.company.installation.dto.BookInstallationRequest;
import com.company.installation.repository.FieldInstallationBookingRepository;
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
public class FieldInstallationService {

    private final FieldInstallationBookingRepository installationRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @PostConstruct
    public void seedInstallationsIfEmpty() {
        if (installationRepository.count() == 0) {
            log.info("Seeding initial Certified Technician Home Installation bookings...");
            bookInstallation(BookInstallationRequest.builder()
                    .customerId("cust_vip_idan")
                    .skuCode("MON-LG-OLED42")
                    .productName("LG C3 42 OLED Pro Studio Display")
                    .installationType("WALL_MOUNT_AND_COLOR_CALIBRATION")
                    .city("Tel Aviv")
                    .vipMember(true)
                    .build());
        }
    }

    public List<FieldInstallationBooking> getAllBookings() {
        return installationRepository.findAll();
    }

    public FieldInstallationBooking bookInstallation(BookInstallationRequest request) {
        String typeUpper = request.getInstallationType().toUpperCase();
        BigDecimal baseFee = typeUpper.contains("CALIBRATION") || typeUpper.contains("STUDIO")
                ? BigDecimal.valueOf(390.00)
                : BigDecimal.valueOf(250.00);

        BigDecimal vipDiscount = request.isVipMember()
                ? baseFee.multiply(BigDecimal.valueOf(0.25)).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal finalFee = baseFee.subtract(vipDiscount).setScale(2, RoundingMode.HALF_UP);

        FieldInstallationBooking booking = FieldInstallationBooking.builder()
                .bookingCode("TECH-PRO-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .customerId(request.getCustomerId())
                .skuCode(request.getSkuCode())
                .productName(request.getProductName())
                .installationType(request.getInstallationType())
                .city(request.getCity())
                .assignedTechnicianName("Noam Levi (Certified Pro AV & Smart Rig Specialist)")
                .scheduledWindow("Tomorrow 14:00-16:00 (Synced +45m post-courier arrival)")
                .syncedWithDeliverySaga(true)
                .baseServiceFeeILS(baseFee.setScale(2, RoundingMode.HALF_UP))
                .vipDiscountILS(vipDiscount)
                .finalInstallationFeeILS(finalFee)
                .status("TECHNICIAN_DISPATCH_SCHEDULED")
                .createdAt(Instant.now())
                .build();

        FieldInstallationBooking saved = installationRepository.save(booking);
        try {
            kafkaTemplate.send("field-installation-events", saved.getBookingCode(),
                    "INSTALLATION_BOOKED:" + saved.getBookingCode() + ":" + saved.getCity());
        } catch (Exception e) {
            log.warn("Kafka installation event skipped: {}", e.getMessage());
        }
        return saved;
    }
}
