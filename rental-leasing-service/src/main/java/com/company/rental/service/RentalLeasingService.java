package com.company.rental.service;

import com.company.rental.domain.EquipmentRentalContract;
import com.company.rental.dto.CreateRentalRequest;
import com.company.rental.repository.EquipmentRentalContractRepository;
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
public class RentalLeasingService {

    private final EquipmentRentalContractRepository rentalRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @PostConstruct
    public void seedRentalsIfEmpty() {
        if (rentalRepository.count() == 0) {
            log.info("Seeding initial Equipment Rental & Rent-to-Own contracts...");
            createRentalContract(CreateRentalRequest.builder()
                    .customerId("cust_vip_idan")
                    .skuCode("COMP-MACBOOK-M3")
                    .productName("Apple MacBook Pro 16 M3 Max 36GB")
                    .durationDays(14)
                    .retailPriceILS(BigDecimal.valueOf(13999.00))
                    .build());
        }
    }

    public List<EquipmentRentalContract> getAllContracts() {
        return rentalRepository.findAll();
    }

    public EquipmentRentalContract createRentalContract(CreateRentalRequest request) {
        int days = request.getDurationDays();
        BigDecimal retail = request.getRetailPriceILS();

        // Daily rate is 0.45% of retail price, with 15% discount for 30+ days
        BigDecimal dailyRateFactor = days >= 30 ? BigDecimal.valueOf(0.0038) : BigDecimal.valueOf(0.0045);
        BigDecimal rentalFee = retail.multiply(dailyRateFactor)
                .multiply(BigDecimal.valueOf(days))
                .setScale(2, RoundingMode.HALF_UP);

        // Refundable deposit is 20% of retail price
        BigDecimal deposit = retail.multiply(BigDecimal.valueOf(0.20))
                .setScale(2, RoundingMode.HALF_UP);

        // 85% of rental fee is credited toward final buyout if customer decides to keep the item
        BigDecimal buyoutCredit = rentalFee.multiply(BigDecimal.valueOf(0.85))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal remainingBuyout = retail.subtract(buyoutCredit)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        EquipmentRentalContract contract = EquipmentRentalContract.builder()
                .contractNumber("RNT-OWN-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .customerId(request.getCustomerId())
                .skuCode(request.getSkuCode())
                .productName(request.getProductName())
                .durationDays(days)
                .retailPriceILS(retail)
                .rentalFeeILS(rentalFee)
                .refundableDepositILS(deposit)
                .rentToOwnCreditILS(buyoutCredit)
                .remainingBuyoutPriceILS(remainingBuyout)
                .planType("RENT_TO_OWN_85_CREDIT")
                .status("ACTIVE_LEASE")
                .createdAt(Instant.now())
                .build();

        EquipmentRentalContract saved = rentalRepository.save(contract);
        try {
            kafkaTemplate.send("rental-leasing-events", saved.getContractNumber(),
                    "RENTAL_LEASE_STARTED:" + saved.getSkuCode() + ":₪" + saved.getRentalFeeILS());
        } catch (Exception e) {
            log.warn("Kafka rental event skipped: {}", e.getMessage());
        }
        return saved;
    }
}
