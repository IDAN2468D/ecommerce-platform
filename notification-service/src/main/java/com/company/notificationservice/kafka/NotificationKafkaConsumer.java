package com.company.notificationservice.kafka;

import com.company.common.events.*;
import com.company.notificationservice.dto.NotificationDtos.NotificationRequest;
import com.company.notificationservice.service.NotificationService;
import com.company.notificationservice.service.SseNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
@KafkaListener(topics = {"order-events", "inventory-events", "payment-events", "user-events"}, groupId = "notification-service-group")
public class NotificationKafkaConsumer {

    private final NotificationService notificationService;
    private final SseNotificationService sseNotificationService;

    @KafkaHandler
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Notification service received OrderCreatedEvent for orderId={}", event.orderId());
        notificationService.sendNotification(new NotificationRequest(
                event.customerId(),
                "EMAIL",
                "Order #" + event.orderId() + " Placed",
                "Your order for " + event.totalAmount() + " " + event.currency() + " has been received and is being processed.",
                event.orderId().toString()
        ));

        sseNotificationService.dispatchNotification(event.customerId(), "ORDER_CREATED", Map.of(
                "orderId", event.orderId().toString(),
                "status", "PENDING",
                "title", "ההזמנה התקבלה בהצלחה",
                "message", "הזמנה בסך ₪" + event.totalAmount() + " נקלטה במערכת ונשלחה לתזמור SAGA.",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @KafkaHandler
    public void handleStockReserved(StockReservedEvent event) {
        log.info("Notification service received StockReservedEvent for reservationId={}", event.reservationId());
        notificationService.sendNotification(new NotificationRequest(
                "usr_demo",
                "PUSH",
                "Stock Reserved",
                "Stock reserved successfully for order.",
                event.reservationId().toString()
        ));

        sseNotificationService.dispatchNotification("usr_demo", "STOCK_RESERVED", Map.of(
                "reservationId", event.reservationId().toString(),
                "title", "המלאי שוריין במחסן",
                "message", "כל פריטי ההזמנה ננעלו בהצלחה במחסן הלוגיסטי.",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @KafkaHandler
    public void handlePaymentCaptured(PaymentCapturedEvent event) {
        log.info("Notification service received PaymentCapturedEvent for transactionId={}", event.transactionId());
        notificationService.sendNotification(new NotificationRequest(
                "usr_demo",
                "SMS",
                "Payment Confirmed",
                "Payment of " + event.amount() + " " + event.currency() + " was successfully captured.",
                event.orderId() != null ? event.orderId().toString() : event.transactionId()
        ));

        sseNotificationService.dispatchNotification("usr_demo", "PAYMENT_CAPTURED", Map.of(
                "orderId", event.orderId() != null ? event.orderId().toString() : "N/A",
                "transactionId", event.transactionId(),
                "amount", event.amount(),
                "title", "התשלום אושר בהצלחה!",
                "message", "חיוב כספי בסך ₪" + event.amount() + " אושר ב-Payment Gateway.",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @KafkaHandler
    public void handlePaymentRefunded(PaymentRefundedEvent event) {
        log.info("Notification service received PaymentRefundedEvent for transactionId={}", event.transactionId());
        sseNotificationService.dispatchNotification("usr_demo", "PAYMENT_REFUNDED", Map.of(
                "transactionId", event.transactionId().toString(),
                "title", "הסכום זוכה לחשבונך",
                "message", "החזר כספי מלא בוצע בעקבות ביטול ההזמנה.",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @KafkaHandler
    public void handleOrderCancelled(OrderCancelledEvent event) {
        log.info("Notification service received OrderCancelledEvent for orderId={}", event.orderId());
        notificationService.sendNotification(new NotificationRequest(
                event.customerId(),
                "EMAIL",
                "Order #" + event.orderId() + " Cancelled",
                "Your order has been cancelled and funds are being refunded.",
                event.orderId().toString()
        ));

        sseNotificationService.dispatchNotification(event.customerId(), "ORDER_CANCELLED", Map.of(
                "orderId", event.orderId().toString(),
                "status", "CANCELLED",
                "title", "ההזמנה בוטלה",
                "message", "ההזמנה בוטלה, שריון המלאי שוחרר והסליקה זוכתה במלואה.",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @KafkaHandler
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("Notification service received UserRegisteredEvent for email={}", event.email());
        notificationService.sendNotification(new NotificationRequest(
                event.email(),
                "EMAIL",
                "Welcome to E-Commerce Platform",
                "Welcome " + event.fullName() + "! Your account has been registered successfully.",
                event.userId().toString()
        ));

        sseNotificationService.dispatchNotification(event.email(), "USER_REGISTERED", Map.of(
                "userId", event.userId().toString(),
                "email", event.email(),
                "fullName", event.fullName(),
                "title", "🎉 ברוך הבא למערכת!",
                "message", "שלום " + event.fullName() + ", החשבון שלך נוצר בהצלחה ונשמר ב-MongoDB.",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @KafkaHandler
    public void handleUserLoggedIn(UserLoggedInEvent event) {
        log.info("Notification service received UserLoggedInEvent for email={}", event.email());
        sseNotificationService.dispatchNotification(event.email(), "USER_LOGGED_IN", Map.of(
                "userId", event.userId().toString(),
                "email", event.email(),
                "fullName", event.fullName(),
                "title", "👋 התחברת בהצלחה!",
                "message", "שמחים לראותך שוב, " + event.fullName() + ". אסימון JWT הונפק ונשמר.",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @KafkaHandler(isDefault = true)
    public void handleDefault(Object event) {
        log.debug("Notification consumed event: {}", event);
    }
}
