package com.company.notificationservice.controller;

import com.company.notificationservice.dto.NotificationDtos.*;
import com.company.notificationservice.service.NotificationService;
import com.company.notificationservice.service.SseNotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Multi-Channel Notification Dispatcher")
public class NotificationController {

    private final NotificationService notificationService;
    private final SseNotificationService sseNotificationService;

    @PostMapping("/send")
    @Operation(summary = "Send a notification via Email, SMS, or Push")
    public ResponseEntity<NotificationResponse> sendNotification(@Valid @RequestBody NotificationRequest request) {
        NotificationResponse response = notificationService.sendNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/history/{customerId}")
    @Operation(summary = "Get notification history for a customer")
    public ResponseEntity<List<NotificationRecord>> getHistory(@PathVariable String customerId) {
        List<NotificationRecord> history = notificationService.getHistoryByCustomer(customerId);
        return ResponseEntity.ok(history);
    }

    @GetMapping(value = "/stream/{customerId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Subscribe to live Server-Sent Events (SSE) stream for order and SAGA status updates")
    public SseEmitter streamNotifications(@PathVariable String customerId) {
        return sseNotificationService.subscribe(customerId);
    }
}
