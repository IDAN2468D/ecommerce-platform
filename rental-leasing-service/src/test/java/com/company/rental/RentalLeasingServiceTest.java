package com.company.rental;

import com.company.rental.domain.EquipmentRentalContract;
import com.company.rental.dto.CreateRentalRequest;
import com.company.rental.repository.EquipmentRentalContractRepository;
import com.company.rental.service.RentalLeasingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RentalLeasingServiceTest {

    @Mock
    private EquipmentRentalContractRepository rentalRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private RentalLeasingService rentalService;

    @BeforeEach
    void setUp() {
        rentalService = new RentalLeasingService(rentalRepository, kafkaTemplate);
    }

    @Test
    void createRentalContract_CalculatesDepositAndBuyoutCreditAccurately() {
        when(rentalRepository.save(any(EquipmentRentalContract.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateRentalRequest req = CreateRentalRequest.builder()
                .customerId("cust_101")
                .skuCode("AUDIO-SONY-XM5")
                .productName("Sony WH-1000XM5")
                .durationDays(10)
                .retailPriceILS(BigDecimal.valueOf(2000.00))
                .build();

        EquipmentRentalContract contract = rentalService.createRentalContract(req);
        assertEquals(BigDecimal.valueOf(90.00).setScale(2), contract.getRentalFeeILS());
        assertEquals(BigDecimal.valueOf(400.00).setScale(2), contract.getRefundableDepositILS());
        assertEquals(BigDecimal.valueOf(76.50).setScale(2), contract.getRentToOwnCreditILS());
        assertEquals(BigDecimal.valueOf(1923.50).setScale(2), contract.getRemainingBuyoutPriceILS());
    }
}
