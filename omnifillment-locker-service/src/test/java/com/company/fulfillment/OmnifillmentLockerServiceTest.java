package com.company.fulfillment;

import com.company.fulfillment.domain.SmartLockerReservation;
import com.company.fulfillment.dto.ReserveLockerRequest;
import com.company.fulfillment.repository.SmartLockerReservationRepository;
import com.company.fulfillment.service.OmnifillmentLockerService;
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
class OmnifillmentLockerServiceTest {

    @Mock
    private SmartLockerReservationRepository lockerRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private OmnifillmentLockerService lockerService;

    @BeforeEach
    void setUp() {
        lockerService = new OmnifillmentLockerService(lockerRepository, kafkaTemplate);
    }

    @Test
    void reserveLocker_Deducts18PercentVatWhenEilatZoneSelected() {
        when(lockerRepository.save(any(SmartLockerReservation.class))).thenAnswer(inv -> inv.getArgument(0));

        ReserveLockerRequest req = ReserveLockerRequest.builder()
                .customerId("cust_77")
                .skuCode("COMP-MACBOOK-M3")
                .productName("MacBook Pro")
                .hubCity("EILAT_FREE_ZONE")
                .retailPriceILS(BigDecimal.valueOf(11800.00))
                .build();

        SmartLockerReservation res = lockerService.reserveLocker(req);
        assertTrue(res.isEilatVatFreeZone());
        assertEquals(BigDecimal.valueOf(10000.00).setScale(2), res.getFinalPickupPriceILS());
        assertEquals(BigDecimal.valueOf(1800.00).setScale(2), res.getEilatTaxSavingsILS());
        assertNotNull(res.getOtpUnlockPin());
    }
}
