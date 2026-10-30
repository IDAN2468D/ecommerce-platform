package com.company.notificationservice.service;

import com.company.common.events.NotificationSentEvent;
import com.company.notificationservice.dto.NotificationDtos.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    public static final String TOPIC_NOTIFICATION_EVENTS = "notification-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final Map<String, List<NotificationRecord>> customerNotifications = new ConcurrentHashMap<>();

    public NotificationResponse sendNotification(NotificationRequest request) {
        String notificationId = "notif_" + UUID.randomUUID().toString().substring(0, 12);
        Instant now = Instant.now();

        log.info("Sending {} notification [{}] to customer: {}. Subject: '{}'",
                request.channel(), notificationId, request.customerId(), request.subject());

        NotificationRecord record = new NotificationRecord(
                notificationId,
                request.customerId(),
                request.channel(),
                request.subject(),
                request.message(),
                request.referenceId(),
                "DELIVERED",
                now
        );

        customerNotifications.computeIfAbsent(request.customerId(), k -> new CopyOnWriteArrayList<>())
                .add(record);

        // Publish to Kafka topic 'notification-events'
        try {
            NotificationSentEvent event = new NotificationSentEvent(
                    notificationId,
                    request.customerId(),
                    request.channel(),
                    request.subject(),
                    request.message(),
                    request.referenceId(),
                    "DELIVERED",
                    now
            );
            log.info("Publishing NotificationSentEvent to Kafka topic '{}': id={}, customerId={}",
                    TOPIC_NOTIFICATION_EVENTS, notificationId, request.customerId());
            kafkaTemplate.send(TOPIC_NOTIFICATION_EVENTS, request.customerId(), event);
        } catch (Exception ex) {
            log.warn("Failed to publish NotificationSentEvent to Kafka topic '{}': {}", TOPIC_NOTIFICATION_EVENTS, ex.getMessage());
        }

        return new NotificationResponse(notificationId, "DELIVERED", now);
    }

    public List<NotificationRecord> getHistoryByCustomer(String customerId) {
        return customerNotifications.getOrDefault(customerId, Collections.emptyList());
    }
}
