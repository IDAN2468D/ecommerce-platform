package com.company.marketplace.service;

import com.company.marketplace.domain.Vendor;
import com.company.marketplace.domain.VendorCommission;
import com.company.marketplace.domain.VendorPayout;
import com.company.marketplace.domain.VendorStatus;
import com.company.marketplace.dto.*;
import com.company.marketplace.repository.VendorCommissionRepository;
import com.company.marketplace.repository.VendorPayoutRepository;
import com.company.marketplace.repository.VendorRepository;
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
public class VendorService {

    private final VendorRepository vendorRepository;
    private final VendorPayoutRepository payoutRepository;
    private final VendorCommissionRepository commissionRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @PostConstruct
    public void seedInitialVendorsIfEmpty() {
        if (vendorRepository.count() == 0) {
            log.info("Seeding initial marketplace vendors...");
            List<Vendor> seeds = List.of(
                    Vendor.builder()
                            .vendorCode("VND-SONY-IL")
                            .businessName("Sony Official Store Israel")
                            .slug("sony-official")
                            .contactEmail("store@sony-israel.co.il")
                            .contactPhone("03-9000100")
                            .description("יבואן רשמי של מוצרי אודיו, אוזניות, ומצלמות מבית Sony")
                            .logoUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80")
                            .rating(4.95)
                            .reviewCount(342)
                            .commissionRatePct(BigDecimal.valueOf(10.0))
                            .walletBalanceILS(BigDecimal.valueOf(14250.00))
                            .totalGrossSalesILS(BigDecimal.valueOf(142500.00))
                            .totalOrdersFulfilled(95)
                            .status(VendorStatus.ACTIVE)
                            .supportedCategories(List.of("AUDIO", "ELECTRONICS"))
                            .bankAccountRef("IL9900100200300400500")
                            .build(),
                    Vendor.builder()
                            .vendorCode("VND-APPLE-IL")
                            .businessName("iStore Premium Reseller")
                            .slug("istore-premium")
                            .contactEmail("sales@istore-il.com")
                            .contactPhone("03-9000200")
                            .description("משווק מורשה פרימיום למחשבי מקבוק, אייפד ואביזרי Apple מקוריים")
                            .logoUrl("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80")
                            .rating(4.9)
                            .reviewCount(512)
                            .commissionRatePct(BigDecimal.valueOf(8.0))
                            .walletBalanceILS(BigDecimal.valueOf(28400.00))
                            .totalGrossSalesILS(BigDecimal.valueOf(312000.00))
                            .totalOrdersFulfilled(68)
                            .status(VendorStatus.ACTIVE)
                            .supportedCategories(List.of("COMPUTERS", "GADGETS"))
                            .bankAccountRef("IL9900100200300400600")
                            .build(),
                    Vendor.builder()
                            .vendorCode("VND-COFFEE-IL")
                            .businessName("Boutique Roasters TLV")
                            .slug("boutique-roasters")
                            .contactEmail("hello@roasters-tlv.com")
                            .contactPhone("03-9000300")
                            .description("קליית בוטיק מקומית של פולי קפה ספיישלטי מכל העולם")
                            .logoUrl("https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80")
                            .rating(4.85)
                            .reviewCount(189)
                            .commissionRatePct(BigDecimal.valueOf(12.0))
                            .walletBalanceILS(BigDecimal.valueOf(4800.00))
                            .totalGrossSalesILS(BigDecimal.valueOf(40000.00))
                            .totalOrdersFulfilled(210)
                            .status(VendorStatus.ACTIVE)
                            .supportedCategories(List.of("COFFEE", "SUBSCRIPTIONS"))
                            .bankAccountRef("IL9900100200300400700")
                            .build()
            );
            vendorRepository.saveAll(seeds);
            log.info("Successfully seeded {} marketplace vendors", seeds.size());
        }
    }

    public VendorResponse registerVendor(RegisterVendorRequest request) {
        log.info("Registering new vendor: {}", request.getBusinessName());

        String slug = request.getBusinessName().toLowerCase()
                .replaceAll("[^a-z0-9א-ת]+", "-")
                .replaceAll("^-|-$", "");
        if (slug.isBlank()) slug = "vendor-" + UUID.randomUUID().toString().substring(0, 6);

        String vendorCode = "VND-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        BigDecimal commRate = request.getCustomCommissionRatePct() != null ?
                request.getCustomCommissionRatePct() : BigDecimal.valueOf(10.0);

        Vendor vendor = Vendor.builder()
                .vendorCode(vendorCode)
                .businessName(request.getBusinessName())
                .slug(slug)
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .description(request.getDescription())
                .logoUrl(request.getLogoUrl() != null ? request.getLogoUrl() : "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=400&q=80")
                .bannerUrl(request.getBannerUrl())
                .rating(5.0)
                .reviewCount(1)
                .commissionRatePct(commRate)
                .walletBalanceILS(BigDecimal.ZERO)
                .totalGrossSalesILS(BigDecimal.ZERO)
                .totalOrdersFulfilled(0)
                .status(VendorStatus.ACTIVE)
                .supportedCategories(request.getSupportedCategories() != null ? request.getSupportedCategories() : List.of("GENERAL"))
                .bankAccountRef(request.getBankAccountRef() != null ? request.getBankAccountRef() : "IL000000000000")
                .build();

        Vendor saved = vendorRepository.save(vendor);
        log.info("Vendor registered: {} ({})", saved.getBusinessName(), saved.getVendorCode());
        return VendorResponse.fromEntity(saved);
    }

    public List<VendorResponse> getAllVendors() {
        return vendorRepository.findByStatusOrderByRatingDesc(VendorStatus.ACTIVE)
                .stream()
                .map(VendorResponse::fromEntity)
                .toList();
    }

    public VendorResponse getVendorById(String id) {
        Vendor vendor = vendorRepository.findById(id)
                .or(() -> vendorRepository.findByVendorCode(id))
                .or(() -> vendorRepository.findBySlug(id))
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found: " + id));
        return VendorResponse.fromEntity(vendor);
    }

    public VendorCommission recordSale(RecordSaleRequest request) {
        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .or(() -> vendorRepository.findByVendorCode(request.getVendorId()))
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found: " + request.getVendorId()));

        BigDecimal commRate = vendor.getCommissionRatePct() != null ? vendor.getCommissionRatePct() : BigDecimal.valueOf(10.0);
        BigDecimal platformFee = request.getGrossAmount()
                .multiply(commRate)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal vendorNetEarnings = request.getGrossAmount().subtract(platformFee);

        VendorCommission commission = VendorCommission.builder()
                .orderId(request.getOrderId())
                .vendorId(vendor.getId())
                .skuCode(request.getSkuCode())
                .grossAmount(request.getGrossAmount())
                .platformFee(platformFee)
                .vendorNetEarnings(vendorNetEarnings)
                .build();

        commissionRepository.save(commission);

        // Update vendor wallet balance and gross sales
        vendor.setWalletBalanceILS(vendor.getWalletBalanceILS().add(vendorNetEarnings));
        vendor.setTotalGrossSalesILS(vendor.getTotalGrossSalesILS().add(request.getGrossAmount()));
        vendor.setTotalOrdersFulfilled(vendor.getTotalOrdersFulfilled() + 1);
        vendorRepository.save(vendor);

        log.info("Recorded sale for vendor {}: gross ₪{}, net earnings ₪{}, platform fee ₪{}",
                vendor.getBusinessName(), request.getGrossAmount(), vendorNetEarnings, platformFee);

        try {
            kafkaTemplate.send("marketplace-sales", vendor.getVendorCode(), "SALE_RECORDED:₪" + vendorNetEarnings);
        } catch (Exception e) {
            log.warn("Kafka sale notification skipped: {}", e.getMessage());
        }

        return commission;
    }

    public VendorPayout requestPayout(String vendorId, VendorPayoutRequest request) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .or(() -> vendorRepository.findByVendorCode(vendorId))
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found: " + vendorId));

        if (vendor.getWalletBalanceILS().compareTo(request.getAmount()) < 0) {
            throw new IllegalStateException("Insufficient wallet balance. Available: ₪" + vendor.getWalletBalanceILS());
        }

        vendor.setWalletBalanceILS(vendor.getWalletBalanceILS().subtract(request.getAmount()));
        vendorRepository.save(vendor);

        VendorPayout payout = VendorPayout.builder()
                .payoutNumber("PAY-VND-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .vendorId(vendor.getId())
                .amount(request.getAmount())
                .bankAccountRef(request.getBankAccountRef())
                .status("COMPLETED")
                .transactionRef("TX-BANK-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase())
                .build();

        VendorPayout saved = payoutRepository.save(payout);
        log.info("Payout processed for vendor {}: ₪{} via {}", vendor.getBusinessName(), saved.getAmount(), saved.getPayoutNumber());

        try {
            kafkaTemplate.send("marketplace-payouts", vendor.getVendorCode(), "PAYOUT_COMPLETED:₪" + saved.getAmount());
        } catch (Exception e) {
            log.warn("Kafka payout notification skipped: {}", e.getMessage());
        }

        return saved;
    }

    public VendorDashboardSummary getVendorDashboard(String vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .or(() -> vendorRepository.findByVendorCode(vendorId))
                .or(() -> vendorRepository.findBySlug(vendorId))
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found: " + vendorId));

        List<VendorCommission> sales = commissionRepository.findByVendorIdOrderByCreatedAtDesc(vendor.getId());
        List<VendorPayout> payouts = payoutRepository.findByVendorIdOrderByRequestedAtDesc(vendor.getId());

        BigDecimal totalPlatformFees = sales.stream()
                .map(VendorCommission::getPlatformFee)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return VendorDashboardSummary.builder()
                .vendor(VendorResponse.fromEntity(vendor))
                .availableBalanceILS(vendor.getWalletBalanceILS())
                .totalGrossEarningsILS(vendor.getTotalGrossSalesILS())
                .totalPlatformFeesPaidILS(totalPlatformFees)
                .totalOrders(vendor.getTotalOrdersFulfilled())
                .recentSales(sales.stream().limit(10).toList())
                .recentPayouts(payouts.stream().limit(5).toList())
                .build();
    }
}
