package com.company.orderservice.client;

import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Spring AOP Proxy-safe Resilience4j wrapper around InventoryClient and PaymentClient.
 * Eliminates self-invocation bypass in OrderService and provides fast Fallbacks,
 * Circuit Breakers, Retries, and Bulkheads.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ResilientOrderIntegrationClient {

    private final InventoryClient inventoryClient;
    private final PaymentClient paymentClient;

    @CircuitBreaker(name = "inventoryService", fallbackMethod = "fallbackReserveInventory")
    @Retry(name = "inventoryService")
    @Bulkhead(name = "inventoryService")
    public InventoryClient.InventoryReservationResponse reserveInventory(List<InventoryClient.StockCheckItem> items) {
        return inventoryClient.reserveStock(items);
    }

    public InventoryClient.InventoryReservationResponse fallbackReserveInventory(
            List<InventoryClient.StockCheckItem> items,
            Throwable t) {
        log.error("Resilience4j CircuitBreaker/Fallback triggered for InventoryClient.reserveStock ({} items): {}",
                items != null ? items.size() : 0, t.getMessage());
        return new InventoryClient.InventoryReservationResponse(
                false,
                null,
                "Inventory service temporarily unavailable (CircuitBreaker fallback): " + t.getMessage()
        );
    }

    @CircuitBreaker(name = "inventoryService", fallbackMethod = "fallbackReleaseInventory")
    @Bulkhead(name = "inventoryService")
    public void releaseInventory(InventoryClient.InventoryReleaseRequest request) {
        inventoryClient.releaseStock(request);
    }

    public void fallbackReleaseInventory(InventoryClient.InventoryReleaseRequest request, Throwable t) {
        log.error("Resilience4j Fallback triggered for InventoryClient.releaseStock (reservationId={}): {}",
                request != null ? request.reservationId() : "N/A", t.getMessage());
    }

    @CircuitBreaker(name = "paymentService", fallbackMethod = "fallbackProcessPayment")
    @Retry(name = "paymentService")
    @Bulkhead(name = "paymentService")
    public PaymentClient.PaymentResponse processPayment(PaymentClient.PaymentRequest request) {
        return paymentClient.processPayment(request);
    }

    /**
     * When payment-service experiences latency, timeouts, or open CircuitBreaker,
     * fail fast without holding threads and return PENDING_PAYMENT so the order is queued
     * for asynchronous SAGA processing via the Transactional Outbox.
     */
    public PaymentClient.PaymentResponse fallbackProcessPayment(
            PaymentClient.PaymentRequest request,
            Throwable t) {
        String asyncTxId = "PENDING-ASYNC-" + (request.orderId() != null ? request.orderId() : request.idempotencyKey());
        log.warn("Resilience4j CircuitBreaker/Fallback triggered for PaymentClient.processPayment (orderId={}): {}. " +
                "Transitioning order to PENDING_PAYMENT with async reference {}.",
                request.orderId(), t.getMessage(), asyncTxId);
        return new PaymentClient.PaymentResponse(
                true,
                asyncTxId,
                "PENDING_PAYMENT",
                "Payment service degraded; deferred to asynchronous processing: " + t.getMessage()
        );
    }

    @CircuitBreaker(name = "paymentService", fallbackMethod = "fallbackRefundPayment")
    @Bulkhead(name = "paymentService")
    public PaymentClient.RefundResponse refundPayment(PaymentClient.RefundRequest request) {
        return paymentClient.refundPayment(request);
    }

    public PaymentClient.RefundResponse fallbackRefundPayment(
            PaymentClient.RefundRequest request,
            Throwable t) {
        log.warn("Resilience4j Fallback triggered for PaymentClient.refundPayment (txId={}): {}",
                request.transactionId(), t.getMessage());
        return new PaymentClient.RefundResponse(
                true,
                "REFUND-ASYNC-" + request.transactionId(),
                "PENDING_ASYNC_REFUND"
        );
    }
}

