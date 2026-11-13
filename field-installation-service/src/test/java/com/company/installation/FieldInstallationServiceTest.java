package com.company.installation;

import com.company.installation.domain.FieldInstallationBooking;
import com.company.installation.dto.BookInstallationRequest;
import com.company.installation.repository.FieldInstallationBookingRepository;
import com.company.installation.service.FieldInstallationService;
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
class FieldInstallationServiceTest {

    @Mock
    private FieldInstallationBookingRepository installationRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private FieldInstallationService installationService;

    @BeforeEach
    void setUp() {
        installationService = new FieldInstallationService(installationRepository, kafkaTemplate);
    }

    @Test
    void bookInstallation_Applies25PercentVipDiscount() {
        when(installationRepository.save(any(FieldInstallationBooking.class))).thenAnswer(inv -> inv.getArgument(0));

        BookInstallationRequest req = BookInstallationRequest.builder()
                .customerId("cust_vip")
                .skuCode("MON-LG-OLED42")
                .productName("LG OLED 42")
                .installationType("WALL_MOUNT_AND_COLOR_CALIBRATION")
                .city("Tel Aviv")
                .vipMember(true)
                .build();

        FieldInstallationBooking booking = installationService.bookInstallation(req);
        assertEquals(BigDecimal.valueOf(390.00).setScale(2), booking.getBaseServiceFeeILS());
        assertEquals(BigDecimal.valueOf(97.50).setScale(2), booking.getVipDiscountILS());
        assertEquals(BigDecimal.valueOf(292.50).setScale(2), booking.getFinalInstallationFeeILS());
    }
}
