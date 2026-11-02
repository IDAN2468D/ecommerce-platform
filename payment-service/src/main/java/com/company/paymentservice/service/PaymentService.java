package com.company.paymentservice.service;

import com.company.paymentservice.domain.entity.OutboxEventEntity;
import com.company.paymentservice.domain.entity.PaymentRefundEntity;
import com.company.paymentservice.domain.entity.PaymentTransactionEntity;
import com.company.paymentservice.dto.PaymentDtos.*;
import com.company.paymentservice.repository.PaymentRepository;
import com.company.paymentservice.repository.RefundRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.company.common.events.PaymentCapturedEvent;
import com.company.common.events.PaymentFailedEvent;
import com.company.common.events.PaymentRefundedEvent;
import org.springframework.kafka.core.KafkaTemplate;
import java.time.Instant;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    public static final String TOPIC_PAYMENT_EVENTS = "payment-events";

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final OutboxService outboxService;

    private static final BigDecimal DAILY_CARD_LIMIT = new BigDecimal("5000000.00");

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        log.info("Processing payment for customer: {}, amount: {} {}, idempotencyKey: {}",
                request.customerId(), request.amount(), request.currency(), request.idempotencyKey());

        // 1. Financial Idempotency Check
        Optional<PaymentTransactionEntity> existingTxOpt = paymentRepository.findByIdempotencyKey(request.idempotencyKey());
        if (existingTxOpt.isPresent()) {
            PaymentTransactionEntity existingTx = existingTxOpt.get();
            log.info("Financial idempotency hit for key: {}. Transaction: {}", request.idempotencyKey(), existingTx.getId());
            return new PaymentResponse(
                    "SUCCEEDED".equals(existingTx.getStatus()),
                    existingTx.getId().toString(),
                    existingTx.getStatus(),
                    existingTx.getFailureReason()
            );
        }

        // 2. Gateway Processing Simulation
        boolean declined = request.paymentMethodToken().toLowerCase().contains("decline")
                || request.amount().compareTo(DAILY_CARD_LIMIT) > 0;

        String status = declined ? "DECLINED" : "SUCCEEDED";
        String failureReason = null;
        if (declined) {
            failureReason = request.amount().compareTo(DAILY_CARD_LIMIT) > 0
                    ? "Transaction amount exceeds customer daily card limit"
                    : "Payment card was declined by issuing bank (insufficient funds / fraud check)";
            log.warn("Payment declined: {}", failureReason);
        }

        String gatewayTxId = "tx_gw_" + UUID.randomUUID().toString().substring(0, 12);

        PaymentTransactionEntity transaction = PaymentTransactionEntity.builder()
                .id(UUID.randomUUID())
                .orderId(request.orderId())
                .idempotencyKey(request.idempotencyKey())
                .customerId(request.customerId())
                .amount(request.amount())
                .currency(request.currency())
                .paymentMethodToken(request.paymentMethodToken())
                .status(status)
                .gatewayTransactionId(gatewayTxId)
                .failureReason(failureReason)
                .build();

        PaymentTransactionEntity saved = paymentRepository.save(transaction);
        log.info("Payment transaction created with ID: {}, status: {}", saved.getId(), status);

        // Publish to Kafka topic 'payment-events' and record in Transactional Outbox
        try {
            OutboxEventEntity outboxEvent = null;
            if (!declined) {
                PaymentCapturedEvent event = new PaymentCapturedEvent(
                        saved.getOrderId(),
                        saved.getCustomerId(),
                        saved.getId().toString(),
                        saved.getAmount(),
                        saved.getCurrency(),
                        Instant.now()
                );
                outboxEvent = outboxService.saveEvent("PAYMENT", saved.getId().toString(), "PaymentCapturedEvent", TOPIC_PAYMENT_EVENTS, event);
                log.info("Publishing PaymentCapturedEvent to Kafka topic '{}': txId={}", TOPIC_PAYMENT_EVENTS, saved.getId());
                kafkaTemplate.send(TOPIC_PAYMENT_EVENTS, saved.getId().toString(), event);
                if (outboxEvent != null) {
                    outboxService.markPublished(outboxEvent.getId());
                }
            } else {
                PaymentFailedEvent event = new PaymentFailedEvent(
                        saved.getOrderId(),
                        failureReason,
                        request.amount(),
                        request.currency(),
                        Instant.now()
                );
                outboxEvent = outboxService.saveEvent("PAYMENT", saved.getId().toString(), "PaymentFailedEvent", TOPIC_PAYMENT_EVENTS, event);
                log.info("Publishing PaymentFailedEvent to Kafka topic '{}': txId={}", TOPIC_PAYMENT_EVENTS, saved.getId());
                kafkaTemplate.send(TOPIC_PAYMENT_EVENTS, saved.getId().toString(), event);
                if (outboxEvent != null) {
                    outboxService.markPublished(outboxEvent.getId());
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to publish payment event to Kafka (outbox will retry): {}", ex.getMessage());
        }

        return new PaymentResponse(!declined, saved.getId().toString(), status, failureReason);
    }

    @Transactional
    public RefundResponse refundPayment(RefundRequest request) {
        log.info("Processing refund for transaction ID: {}, amount: {}", request.transactionId(), request.amount());

        UUID txId;
        try {
            txId = UUID.fromString(request.transactionId());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID transaction format: {}", request.transactionId());
            return new RefundResponse(false, null, "Invalid transaction UUID");
        }

        Optional<PaymentTransactionEntity> txOpt = paymentRepository.findById(txId);
        if (txOpt.isEmpty()) {
            log.warn("Original payment transaction not found for ID: {}", txId);
            return new RefundResponse(false, null, "Transaction not found");
        }

        PaymentTransactionEntity tx = txOpt.get();
        if (!"SUCCEEDED".equals(tx.getStatus())) {
            log.warn("Cannot refund transaction in status: {}", tx.getStatus());
            return new RefundResponse(false, null, "Transaction is not in SUCCEEDED status");
        }

        UUID refundId = UUID.randomUUID();
        PaymentRefundEntity refund = PaymentRefundEntity.builder()
                .id(refundId)
                .transactionId(tx.getId())
                .refundAmount(request.amount())
                .reason(request.reason() != null ? request.reason() : "Customer refund")
                .refundStatus("SUCCEEDED")
                .build();

        refundRepository.save(refund);

        tx.setStatus("REFUNDED");
        paymentRepository.save(tx);
        log.info("Refund {} completed for transaction {}", refundId, tx.getId());

        // Publish to Kafka topic 'payment-events' and record in Outbox
        try {
            PaymentRefundedEvent refundedEvent = new PaymentRefundedEvent(
                    tx.getId(),
                    refundId.toString(),
                    request.amount(),
                    Instant.now()
            );
            OutboxEventEntity outboxEvent = outboxService.saveEvent("PAYMENT", tx.getId().toString(), "PaymentRefundedEvent", TOPIC_PAYMENT_EVENTS, refundedEvent);
            log.info("Publishing PaymentRefundedEvent to Kafka topic '{}': refundId={}", TOPIC_PAYMENT_EVENTS, refundId);
            kafkaTemplate.send(TOPIC_PAYMENT_EVENTS, refundId.toString(), refundedEvent);
            if (outboxEvent != null) {
                outboxService.markPublished(outboxEvent.getId());
            }
        } catch (Exception ex) {
            log.warn("Failed to publish PaymentRefundedEvent to Kafka (outbox will retry): {}", ex.getMessage());
        }

        return new RefundResponse(true, refundId.toString(), "SUCCEEDED");
    }
}
