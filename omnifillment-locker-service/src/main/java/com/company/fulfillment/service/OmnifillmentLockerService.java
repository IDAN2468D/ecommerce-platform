package com.company.fulfillment.service;

import com.company.fulfillment.domain.SmartLockerReservation;
import com.company.fulfillment.dto.ReserveLockerRequest;
import com.company.fulfillment.repository.SmartLockerReservationRepository;
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
public class OmnifillmentLockerService {

    private final SmartLockerReservationRepository lockerRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @PostConstruct
    public void seedReservationsIfEmpty() {
        if (lockerRepository.count() == 0) {
            log.info("Seeding initial Omnichannel 24/7 Smart Locker reservations...");
            reserveLocker(ReserveLockerRequest.builder()
                    .customerId("cust_vip_idan")
                    .skuCode("AUDIO-SONY-XM5")
                    .productName("Sony WH-1000XM5 Wireless ANC")
                    .hubCity("EILAT_FREE_ZONE")
                    .retailPriceILS(BigDecimal.valueOf(1690.00))
                    .build());
        }
    }

    public List<SmartLockerReservation> getAllReservations() {
        return lockerRepository.findAll();
    }

    public SmartLockerReservation reserveLocker(ReserveLockerRequest request) {
        String cityUpper = request.getHubCity().toUpperCase();
        boolean isEilat = cityUpper.contains("EILAT") || cityUpper.contains("אילת");

        BigDecimal retail = request.getRetailPriceILS().setScale(2, RoundingMode.HALF_UP);
        BigDecimal finalPrice = isEilat
                ? retail.divide(BigDecimal.valueOf(1.18), 2, RoundingMode.HALF_UP)
                : retail;
        BigDecimal taxSavings = retail.subtract(finalPrice).setScale(2, RoundingMode.HALF_UP);

        String stationName = isEilat
                ? "Ice Mall Eilat 24/7 Smart Locker Hub (0% VAT)"
                : "Azrieli Sarona Tel Aviv 24/7 Express Locker";
        String otpPin = String.valueOf(100000 + Math.abs(UUID.randomUUID().hashCode() % 899999));

        SmartLockerReservation reservation = SmartLockerReservation.builder()
                .reservationCode("LCK-247-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .customerId(request.getCustomerId())
                .skuCode(request.getSkuCode())
                .productName(request.getProductName())
                .hubCity(request.getHubCity())
                .lockerStationName(stationName)
                .compartmentNumber("BOX-B" + (10 + Math.abs(otpPin.hashCode() % 40)))
                .otpUnlockPin(otpPin)
                .eilatVatFreeZone(isEilat)
                .retailPriceILS(retail)
                .eilatTaxSavingsILS(taxSavings)
                .finalPickupPriceILS(finalPrice)
                .readyInMinutes(45)
                .status("LOCKER_COMPARTMENT_RESERVED")
                .createdAt(Instant.now())
                .build();

        SmartLockerReservation saved = lockerRepository.save(reservation);
        try {
            kafkaTemplate.send("omnifillment-locker-events", saved.getReservationCode(),
                    "SMART_LOCKER_RESERVED:" + saved.getLockerStationName() + ":PIN:" + saved.getOtpUnlockPin());
        } catch (Exception e) {
            log.warn("Kafka locker event skipped: {}", e.getMessage());
        }
        return saved;
    }
}
