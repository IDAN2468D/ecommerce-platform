package com.company.marketplace;

import com.company.marketplace.domain.Vendor;
import com.company.marketplace.domain.VendorCommission;
import com.company.marketplace.domain.VendorPayout;
import com.company.marketplace.domain.VendorStatus;
import com.company.marketplace.dto.RecordSaleRequest;
import com.company.marketplace.dto.RegisterVendorRequest;
import com.company.marketplace.dto.VendorPayoutRequest;
import com.company.marketplace.dto.VendorResponse;
import com.company.marketplace.repository.VendorCommissionRepository;
import com.company.marketplace.repository.VendorPayoutRepository;
import com.company.marketplace.repository.VendorRepository;
import com.company.marketplace.service.VendorService;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VendorServiceTest {

    @Mock
    private VendorRepository vendorRepository;

    @Mock
    private VendorPayoutRepository payoutRepository;

    @Mock
    private VendorCommissionRepository commissionRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private VendorService vendorService;

    @BeforeEach
    void setUp() {
        vendorService = new VendorService(vendorRepository, payoutRepository, commissionRepository, kafkaTemplate);
    }

    @Test
    void registerVendor_Success() {
        RegisterVendorRequest request = RegisterVendorRequest.builder()
                .businessName("Boutique Gadgets IL")
                .contactEmail("contact@gadgets.il")
                .customCommissionRatePct(BigDecimal.valueOf(10.0))
                .build();

        when(vendorRepository.save(any(Vendor.class))).thenAnswer(inv -> {
            Vendor v = inv.getArgument(0);
            v.setId("vnd_123");
            return v;
        });

        VendorResponse res = vendorService.registerVendor(request);
        assertNotNull(res);
        assertEquals("Boutique Gadgets IL", res.getBusinessName());
        assertEquals(VendorStatus.ACTIVE, res.getStatus());
        assertEquals("boutique-gadgets-il", res.getSlug());
        assertEquals(BigDecimal.valueOf(10.0), res.getCommissionRatePct());
    }

    @Test
    void recordSale_Calculates10PercentPlatformFeeAndCredits90Percent() {
        Vendor vendor = Vendor.builder()
                .id("vnd_test")
                .vendorCode("VND-TEST")
                .businessName("Test Store")
                .commissionRatePct(BigDecimal.valueOf(10.0))
                .walletBalanceILS(BigDecimal.valueOf(100.0))
                .totalGrossSalesILS(BigDecimal.valueOf(1000.0))
                .totalOrdersFulfilled(5)
                .build();

        when(vendorRepository.findById("vnd_test")).thenReturn(Optional.of(vendor));
        when(commissionRepository.save(any(VendorCommission.class))).thenAnswer(inv -> inv.getArgument(0));
        when(vendorRepository.save(any(Vendor.class))).thenAnswer(inv -> inv.getArgument(0));

        RecordSaleRequest request = RecordSaleRequest.builder()
                .orderId("ord_999")
                .vendorId("vnd_test")
                .skuCode("AUDIO-SONY-XM5")
                .grossAmount(BigDecimal.valueOf(1500.00))
                .build();

        VendorCommission commission = vendorService.recordSale(request);

        assertNotNull(commission);
        assertEquals(BigDecimal.valueOf(150.00).setScale(2), commission.getPlatformFee()); // 10%
        assertEquals(BigDecimal.valueOf(1350.00).setScale(2), commission.getVendorNetEarnings()); // 90%
        assertEquals(BigDecimal.valueOf(1450.00).setScale(2), vendor.getWalletBalanceILS()); // 100 + 1350
        assertEquals(6, vendor.getTotalOrdersFulfilled());
    }

    @Test
    void requestPayout_Success_DeductsBalance() {
        Vendor vendor = Vendor.builder()
                .id("vnd_payout")
                .vendorCode("VND-PAYOUT")
                .businessName("Payout Store")
                .walletBalanceILS(BigDecimal.valueOf(500.00))
                .build();

        when(vendorRepository.findById("vnd_payout")).thenReturn(Optional.of(vendor));
        when(payoutRepository.save(any(VendorPayout.class))).thenAnswer(inv -> inv.getArgument(0));
        when(vendorRepository.save(any(Vendor.class))).thenAnswer(inv -> inv.getArgument(0));

        VendorPayoutRequest request = VendorPayoutRequest.builder()
                .amount(BigDecimal.valueOf(300.00))
                .bankAccountRef("IL9900000000000")
                .build();

        VendorPayout payout = vendorService.requestPayout("vnd_payout", request);

        assertNotNull(payout);
        assertEquals(BigDecimal.valueOf(300.00), payout.getAmount());
        assertEquals(BigDecimal.valueOf(200.00), vendor.getWalletBalanceILS()); // 500 - 300 = 200
    }
}
