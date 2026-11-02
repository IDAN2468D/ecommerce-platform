package com.company.shippingservice.kafka;

import com.company.common.events.EventIdempotencyKeyResolver;
import com.company.common.events.InboxIdempotencyTracker;
import com.company.common.events.OrderCancelledEvent;
import com.company.common.events.PaymentCapturedEvent;
import com.company.shippingservice.domain.entity.ProcessedEventEntity;
import com.company.shippingservice.repository.ProcessedEventRepository;
import com.company.shippingservice.service.ShippingService;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
@KafkaListener(topics = {"payment-events", "order-events"}, groupId = "shipping-delivery-service-group")
public class ShippingKafkaConsumer {

    private static final String CONSUMER_GROUP = "shipping-delivery-service-group";

    private final ShippingService shippingService;

    @Autowired(required = false)
    private ProcessedEventRepository processedEventRepository;

    @Autowired(required = false)
    private MeterRegistry meterRegistry;

    private final InboxIdempotencyTracker inboxTracker = new InboxIdempotencyTracker(CONSUMER_GROUP);

    @KafkaHandler
    public void handlePaymentCaptured(
            PaymentCapturedEvent event,
            @Header(name = EventIdempotencyKeyResolver.HEADER_EVENT_ID, required = false) String eventIdHeader) {
        if (!tryAcquireIdempotentLock(event, eventIdHeader)) {
            log.info("Inbox Idempotency: Skipping duplicate PaymentCapturedEvent in Shipping consumer for orderId={}", event.orderId());
            return;
        }
        log.info("Shipping service consumed PaymentCapturedEvent for orderId={} txId={}", event.orderId(), event.transactionId());
        if (event.orderId() != null) {
            shippingService.scheduleShipment(event.orderId(), event.customerId());
        } else {
            log.warn("PaymentCapturedEvent had no orderId, skipping automated shipment scheduling");
        }
    }

    @KafkaHandler
    public void handleOrderCancelled(
            OrderCancelledEvent event,
            @Header(name = EventIdempotencyKeyResolver.HEADER_EVENT_ID, required = false) String eventIdHeader) {
        if (!tryAcquireIdempotentLock(event, eventIdHeader)) {
            log.info("Inbox Idempotency: Skipping duplicate OrderCancelledEvent in Shipping consumer for orderId={}", event.orderId());
            return;
        }
        log.info("Shipping service consumed OrderCancelledEvent for orderId={}. Executing SAGA step 5 compensation.", event.orderId());
        shippingService.cancelShipmentForOrder(event.orderId(), "Order cancelled via SAGA compensation");
    }

    @KafkaHandler(isDefault = true)
    public void handleDefault(Object event) {
        log.debug("Shipping service ignored unrelated event: {}", event);
    }

    public boolean tryAcquireIdempotentLock(Object event, String eventIdHeader) {
        boolean acquired = inboxTracker.tryAcquire(event, eventIdHeader, key -> {
            if (processedEventRepository != null) {
                try {
                    if (processedEventRepository.existsById(key)) {
                        return false;
                    }
                    processedEventRepository.save(ProcessedEventEntity.builder()
                            .eventId(key)
                            .consumerGroup(CONSUMER_GROUP)
                            .eventType(event != null ? event.getClass().getSimpleName() : "UNKNOWN")
                            .processedAt(Instant.now())
                            .build());
                } catch (Exception ex) {
                    log.debug("ProcessedEventRepository save warning: {}", ex.getMessage());
                }
            }
            return true;
        });
        if (meterRegistry != null) {
            meterRegistry.counter("ecommerce_kafka_idempotent_events_total",
                    "consumer_group", CONSUMER_GROUP,
                    "outcome", acquired ? "PROCESSED" : "DUPLICATE_SKIPPED").increment();
        }
        return acquired;
    }
}
