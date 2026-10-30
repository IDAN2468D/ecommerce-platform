package com.company.common.events;

import java.time.Instant;

public record NotificationSentEvent(
        String notificationId,
        String customerId,
        String channel,
        String subject,
        String message,
        String referenceId,
        String status,
        Instant sentAt
) {}
