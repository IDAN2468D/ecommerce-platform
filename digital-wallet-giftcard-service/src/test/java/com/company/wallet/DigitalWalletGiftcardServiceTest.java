package com.company.wallet;

import com.company.wallet.domain.MultiCurrencyWalletCard;
import com.company.wallet.dto.IssueWalletGiftCardRequest;
import com.company.wallet.repository.MultiCurrencyWalletCardRepository;
import com.company.wallet.service.DigitalWalletGiftcardService;
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
class DigitalWalletGiftcardServiceTest {

    @Mock
    private MultiCurrencyWalletCardRepository walletRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private DigitalWalletGiftcardService walletService;

    @BeforeEach
    void setUp() {
        walletService = new DigitalWalletGiftcardService(walletRepository, kafkaTemplate);
    }

    @Test
    void issueGiftCard_Grants8PercentBonusAndCalculatesMultiCurrencyEquivalents() {
        when(walletRepository.save(any(MultiCurrencyWalletCard.class))).thenAnswer(inv -> inv.getArgument(0));

        IssueWalletGiftCardRequest req = IssueWalletGiftCardRequest.builder()
                .senderCustomerId("cust_1")
                .recipientEmail("friend@example.com")
                .occasionTitle("Birthday Top-Up")
                .amountILS(BigDecimal.valueOf(1000.00))
                .build();

        MultiCurrencyWalletCard res = walletService.issueGiftCard(req);
        assertEquals(BigDecimal.valueOf(80.00).setScale(2), res.getTopUpBonusILS());
        assertEquals(BigDecimal.valueOf(1080.00).setScale(2), res.getTotalAvailableILS());
        assertEquals(BigDecimal.valueOf(270.00).setScale(2), res.getEquivalentEUR());
    }
}
