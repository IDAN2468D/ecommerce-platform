package com.company.notificationservice.service;

import com.company.notificationservice.dto.NotificationDtos.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(kafkaTemplate);
    }

    @Test
    @DisplayName("Send notification stores audit record, publishes to Kafka, and returns DELIVERED status")
    void sendNotification_Success() {
        NotificationRequest request = new NotificationRequest(
                "customer_42",
                "EMAIL",
                "Your order has been confirmed!",
                "Order #123 has been successfully confirmed and charged.",
                "ord_123"
        );

        NotificationResponse response = notificationService.sendNotification(request);

        assertThat(response.notificationId()).isNotNull();
        assertThat(response.status()).isEqualTo("DELIVERED");

        List<NotificationRecord> history = notificationService.getHistoryByCustomer("customer_42");
        assertThat(history).hasSize(1);
        assertThat(history.getFirst().subject()).isEqualTo("Your order has been confirmed!");

        verify(kafkaTemplate).send(eq(NotificationService.TOPIC_NOTIFICATION_EVENTS), eq("customer_42"), any());
    }
}
