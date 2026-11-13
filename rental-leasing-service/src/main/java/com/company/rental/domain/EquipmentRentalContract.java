package com.company.rental.domain;

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
@Document(collection = "equipment_rental_contracts")
public class EquipmentRentalContract {

    @Id
    private String id;

    @Indexed(unique = true)
    private String contractNumber;

    private String customerId;
    private String skuCode;
    private String productName;
    private int durationDays;

    private BigDecimal retailPriceILS;
    private BigDecimal rentalFeeILS;
    private BigDecimal refundableDepositILS;
    private BigDecimal rentToOwnCreditILS;
    private BigDecimal remainingBuyoutPriceILS;

    @Builder.Default
    private String planType = "RENT_TO_OWN_85_CREDIT";

    @Builder.Default
    private String status = "ACTIVE_LEASE";

    @Builder.Default
    private Instant createdAt = Instant.now();
}
