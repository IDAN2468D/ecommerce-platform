package com.company.b2b;

import com.company.b2b.domain.B2bWholesaleQuote;
import com.company.b2b.dto.CreateB2bQuoteRequest;
import com.company.b2b.repository.B2bWholesaleQuoteRepository;
import com.company.b2b.service.B2bWholesaleQuoteService;
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
class B2bWholesaleQuoteServiceTest {

    @Mock
    private B2bWholesaleQuoteRepository quoteRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private B2bWholesaleQuoteService quoteService;

    @BeforeEach
    void setUp() {
        quoteService = new B2bWholesaleQuoteService(quoteRepository, kafkaTemplate);
    }

    @Test
    void generateQuote_Applies22PercentTierDiscountFor25Units() {
        when(quoteRepository.save(any(B2bWholesaleQuote.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateB2bQuoteRequest req = CreateB2bQuoteRequest.builder()
                .companyName("Wix Engineering")
                .skuCode("AUDIO-SONY-XM5")
                .productName("Sony WH-1000XM5")
                .quantity(25)
                .unitRetailPriceILS(BigDecimal.valueOf(1000.00))
                .build();

        B2bWholesaleQuote quote = quoteService.generateQuote(req);
        assertEquals(22, quote.getVolumeDiscountPct());
        assertEquals(BigDecimal.valueOf(780.00).setScale(2), quote.getNetUnitPriceILS());
        assertEquals(BigDecimal.valueOf(19500.00).setScale(2), quote.getTotalNetAmountILS());
    }
}
