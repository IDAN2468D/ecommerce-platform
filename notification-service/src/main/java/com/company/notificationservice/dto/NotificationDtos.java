package com.company.notificationservice.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public class NotificationDtos {

    public record NotificationRequest(
        @NotBlank String customerId,
        @NotBlank String channel, // EMAIL, SMS, PUSH
        @NotBlank String subject,
        @NotBlank String message,
        String referenceId
    ) {}

    public record NotificationRecord(
        String notificationId,
        String customerId,
        String channel,
        String subject,
        String message,
        String referenceId,
        String status,
        Instant sentAt
    ) {}

    public record NotificationResponse(
        String notificationId,
        String status,
        Instant sentAt
    ) {}
}
