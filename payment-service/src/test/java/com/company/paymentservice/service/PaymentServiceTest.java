package com.company.paymentservice.service;

import com.company.paymentservice.domain.entity.PaymentTransactionEntity;
import com.company.paymentservice.dto.PaymentDtos.PaymentRequest;
import com.company.paymentservice.dto.PaymentDtos.PaymentResponse;
import com.company.paymentservice.dto.PaymentDtos.RefundRequest;
import com.company.paymentservice.dto.PaymentDtos.RefundResponse;
import com.company.paymentservice.repository.PaymentRepository;
import com.company.paymentservice.repository.RefundRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private RefundRepository refundRepository;

    @Mock
    private org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(paymentRepository, refundRepository, kafkaTemplate);
    }

    @Test
    @DisplayName("Process payment successfully")
    void processPayment_Success() {
        PaymentRequest request = new PaymentRequest(
                "customer_123",
                new BigDecimal("1500.00"),
                "ILS",
                "pm_card_visa_ok",
                "key_unique_tx_1"
        );

        when(paymentRepository.findByIdempotencyKey("key_unique_tx_1")).thenReturn(Optional.empty());
        when(paymentRepository.save(any(PaymentTransactionEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponse response = paymentService.processPayment(request);

        assertThat(response.success()).isTrue();
        assertThat(response.status()).isEqualTo("SUCCEEDED");
        assertThat(response.transactionId()).isNotNull();

        verify(paymentRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Idempotency: Repeated payment request with same idempotency key returns original transaction")
    void processPayment_IdempotentHit() {
        PaymentRequest request = new PaymentRequest(
                "customer_123",
                new BigDecimal("1500.00"),
                "ILS",
                "pm_card_visa_ok",
                "key_unique_tx_1"
        );

        UUID existingId = UUID.randomUUID();
        PaymentTransactionEntity existingTx = PaymentTransactionEntity.builder()
                .id(existingId)
                .idempotencyKey("key_unique_tx_1")
                .status("SUCCEEDED")
                .build();

        when(paymentRepository.findByIdempotencyKey("key_unique_tx_1")).thenReturn(Optional.of(existingTx));

        PaymentResponse response = paymentService.processPayment(request);

        assertThat(response.success()).isTrue();
        assertThat(response.transactionId()).isEqualTo(existingId.toString());
        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Payment declined when card token specifies decline")
    void processPayment_Declined() {
        PaymentRequest request = new PaymentRequest(
                "customer_123",
                new BigDecimal("200.00"),
                "ILS",
                "pm_card_decline_funds",
                "key_declined_1"
        );

        when(paymentRepository.findByIdempotencyKey("key_declined_1")).thenReturn(Optional.empty());
        when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponse response = paymentService.processPayment(request);

        assertThat(response.success()).isFalse();
        assertThat(response.status()).isEqualTo("DECLINED");
        assertThat(response.failureReason()).contains("declined");
    }

    @Test
    @DisplayName("Refund payment succeeds and updates transaction status")
    void refundPayment_Success() {
        UUID txId = UUID.randomUUID();
        PaymentTransactionEntity tx = PaymentTransactionEntity.builder()
                .id(txId)
                .amount(new BigDecimal("500.00"))
                .status("SUCCEEDED")
                .build();

        when(paymentRepository.findById(txId)).thenReturn(Optional.of(tx));

        RefundResponse response = paymentService.refundPayment(
                new RefundRequest(txId.toString(), new BigDecimal("500.00"), "User cancelled")
        );

        assertThat(response.success()).isTrue();
        assertThat(response.status()).isEqualTo("SUCCEEDED");
        assertThat(tx.getStatus()).isEqualTo("REFUNDED");

        verify(refundRepository, times(1)).save(any());
        verify(paymentRepository, times(1)).save(tx);
    }
}
