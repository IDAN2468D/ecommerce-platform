package com.company.paymentservice.service;

import com.company.paymentservice.domain.entity.OutboxEventEntity;
import com.company.paymentservice.repository.OutboxEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OutboxService {

    private final OutboxEventRepository outboxRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public OutboxEventEntity saveEvent(String aggregateType, String aggregateId, String eventType, String topic, Object payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            OutboxEventEntity entity = OutboxEventEntity.builder()
                    .id(UUID.randomUUID())
                    .aggregateType(aggregateType)
                    .aggregateId(aggregateId)
                    .eventType(eventType)
                    .topic(topic)
                    .payload(json)
                    .status("PENDING")
                    .createdAt(Instant.now())
                    .build();
            OutboxEventEntity saved = outboxRepository.save(entity);
            log.info("Payment saved outbox event: id={}, aggregateType={}, aggregateId={}, eventType={}", saved.getId(), aggregateType, aggregateId, eventType);
            return saved;
        } catch (Exception ex) {
            log.error("Failed to serialize outbox event payload", ex);
            return null;
        }
    }

    public void markPublished(UUID eventId) {
        if (eventId != null) {
            outboxRepository.findById(eventId).ifPresent(event -> {
                event.setStatus("PUBLISHED");
                event.setPublishedAt(Instant.now());
                outboxRepository.save(event);
            });
        }
    }

    @Scheduled(fixedDelay = 1500)
    public void publishPendingEvents() {
        List<OutboxEventEntity> pending = outboxRepository.findByStatusOrderByCreatedAtAsc("PENDING");
        if (pending.isEmpty()) {
            return;
        }

        for (OutboxEventEntity event : pending) {
            try {
                Object payloadToSend;
                try {
                    payloadToSend = objectMapper.readTree(event.getPayload());
                } catch (Exception parseEx) {
                    payloadToSend = event.getPayload();
                }
                kafkaTemplate.send(event.getTopic(), event.getAggregateId(), payloadToSend).get();
                event.setStatus("PUBLISHED");
                event.setPublishedAt(Instant.now());
                outboxRepository.save(event);
            } catch (Exception ex) {
                event.setRetryCount(event.getRetryCount() + 1);
                if (event.getRetryCount() >= 3) {
                    event.setStatus("FAILED");
                    try {
                        Object dlqPayload;
                        try {
                            dlqPayload = objectMapper.readTree(event.getPayload());
                        } catch (Exception e) {
                            dlqPayload = event.getPayload();
                        }
                        kafkaTemplate.send(event.getTopic() + ".DLT", event.getAggregateId(), dlqPayload);
                    } catch (Exception dlqEx) {
                        log.error("Failed to publish to DLQ topic", dlqEx);
                    }
                }
                outboxRepository.save(event);
            }
        }
    }

    public List<OutboxEventEntity> getRecentEvents() {
        return outboxRepository.findTop50ByOrderByCreatedAtDesc();
    }
}
