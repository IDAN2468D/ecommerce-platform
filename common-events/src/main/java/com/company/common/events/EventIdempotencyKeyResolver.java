package com.company.common.events;

/**
 * Deterministic Event Idempotency Key Resolver for the Consumer Inbox Pattern.
 * Generates a unique, canonical event identifier per consumer group and event payload
 * (or uses an explicit X-Event-Id header when supplied by the Transactional Outbox).
 */
public final class EventIdempotencyKeyResolver {

    public static final String HEADER_EVENT_ID = "X-Event-Id";
    public static final String HEADER_TRACE_ID = "X-Trace-Id";

    private EventIdempotencyKeyResolver() {
    }

    public static String resolveEventId(String consumerGroup, Object event) {
        return resolveEventId(consumerGroup, event, null);
    }

    public static String resolveEventId(String consumerGroup, Object event, String explicitEventId) {
        String prefix = (consumerGroup != null && !consumerGroup.isBlank()) ? consumerGroup.trim() : "default-group";
        if (explicitEventId != null && !explicitEventId.isBlank()) {
            return prefix + ":" + explicitEventId.trim();
        }
        if (event == null) {
            return prefix + ":null";
        }

        String businessKey = switch (event) {
            case OrderCreatedEvent e -> "OrderCreatedEvent:" + e.orderId();
            case OrderCancelledEvent e -> "OrderCancelledEvent:" + e.orderId();
            case PaymentCapturedEvent e -> "PaymentCapturedEvent:"
                    + (e.orderId() != null ? e.orderId() : "na") + ":" + e.transactionId();
            case PaymentFailedEvent e -> "PaymentFailedEvent:" + e.orderId() + ":"
                    + (e.failedAt() != null ? e.failedAt().toEpochMilli() : e.reason());
            case PaymentRefundedEvent e -> "PaymentRefundedEvent:" + e.transactionId() + ":" + e.refundId();
            case StockReservedEvent e -> "StockReservedEvent:"
                    + (e.orderId() != null ? e.orderId() : "na") + ":" + e.reservationId();
            case StockReleasedEvent e -> "StockReleasedEvent:" + e.reservationId() + ":"
                    + (e.releasedAt() != null ? e.releasedAt().toEpochMilli() : e.reason());
            case StockReservationFailedEvent e -> "StockReservationFailedEvent:" + e.orderId();
            case ShipmentScheduledEvent e -> "ShipmentScheduledEvent:" + e.orderId() + ":" + e.trackingNumber();
            case ShipmentCancelledEvent e -> "ShipmentCancelledEvent:" + e.orderId() + ":" + e.trackingNumber();
            case OrderDispatchedEvent e -> "OrderDispatchedEvent:" + e.orderId() + ":" + e.status();
            case ProductRatingUpdatedEvent e -> "ProductRatingUpdatedEvent:" + e.skuCode() + ":"
                    + e.reviewCount() + ":" + e.averageRating();
            case CartAbandonedEvent e -> "CartAbandonedEvent:" + e.userId() + ":"
                    + (e.timestamp() != null ? e.timestamp().toEpochMilli() : "0");
            case NotificationSentEvent e -> "NotificationSentEvent:" + e.notificationId();
            case UserRegisteredEvent e -> "UserRegisteredEvent:" + e.userId();
            case UserLoggedInEvent e -> "UserLoggedInEvent:" + e.userId() + ":"
                    + (e.timestamp() != null ? e.timestamp().toEpochMilli() : "0");
            default -> event.getClass().getSimpleName() + ":" + event.hashCode();
        };

        return prefix + ":" + businessKey;
    }
}

