package com.company.b2b.service;

import com.company.b2b.domain.B2bWholesaleQuote;
import com.company.b2b.dto.CreateB2bQuoteRequest;
import com.company.b2b.repository.B2bWholesaleQuoteRepository;
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
public class B2bWholesaleQuoteService {

    private final B2bWholesaleQuoteRepository quoteRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @PostConstruct
    public void seedQuotesIfEmpty() {
        if (quoteRepository.count() == 0) {
            log.info("Seeding initial B2B Wholesale RFQ quotes...");
            generateQuote(CreateB2bQuoteRequest.builder()
                    .companyName("CyberArk R&D Center TLV")
                    .skuCode("COMP-MACBOOK-M3")
                    .productName("Apple MacBook Pro 16 M3 Max 36GB")
                    .quantity(15)
                    .unitRetailPriceILS(BigDecimal.valueOf(13999.00))
                    .build());
        }
    }

    public List<B2bWholesaleQuote> getAllQuotes() {
        return quoteRepository.findAll();
    }

    public B2bWholesaleQuote generateQuote(CreateB2bQuoteRequest request) {
        int qty = request.getQuantity();
        int discountPct = qty >= 50 ? 30 : (qty >= 25 ? 22 : (qty >= 10 ? 15 : 10));

        BigDecimal factor = BigDecimal.valueOf(100 - discountPct)
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal netUnit = request.getUnitRetailPriceILS()
                .multiply(factor)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalNet = netUnit.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);

        B2bWholesaleQuote quote = B2bWholesaleQuote.builder()
                .quoteNumber("RFQ-B2B-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .companyName(request.getCompanyName())
                .skuCode(request.getSkuCode())
                .productName(request.getProductName())
                .quantity(qty)
                .unitRetailPriceILS(request.getUnitRetailPriceILS())
                .volumeDiscountPct(discountPct)
                .netUnitPriceILS(netUnit)
                .totalNetAmountILS(totalNet)
                .paymentTerms("NET_30_CORPORATE_CREDIT")
                .status("ISSUED_APPROVED")
                .createdAt(Instant.now())
                .build();

        B2bWholesaleQuote saved = quoteRepository.save(quote);
        try {
            kafkaTemplate.send("b2b-quote-events", saved.getQuoteNumber(),
                    "B2B_QUOTE_ISSUED:" + saved.getCompanyName() + ":₪" + saved.getTotalNetAmountILS());
        } catch (Exception e) {
            log.warn("Kafka B2B quote event skipped: {}", e.getMessage());
        }
        return saved;
    }
}
