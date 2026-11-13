package com.company.fulfillment.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "smart_locker_reservations")
public class SmartLockerReservation {

    @Id
    private String id;

    @Indexed(unique = true)
    private String reservationCode;

    private String customerId;
    private String skuCode;
    private String productName;
    private String hubCity;
    private String lockerStationName;
    private String compartmentNumber;
    private String otpUnlockPin;

    private boolean eilatVatFreeZone;
    private BigDecimal retailPriceILS;
    private BigDecimal eilatTaxSavingsILS;
    private BigDecimal finalPickupPriceILS;
    private int readyInMinutes;

    @Builder.Default
    private String status = "LOCKER_COMPARTMENT_RESERVED";

    @Builder.Default
    private Instant createdAt = Instant.now();
}
