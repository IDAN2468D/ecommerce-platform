package com.company.orderservice.service;

import com.company.orderservice.client.InventoryClient;
import com.company.orderservice.client.PaymentClient;
import com.company.orderservice.client.ResilientOrderIntegrationClient;
import com.company.orderservice.domain.entity.OrderEntity;
import com.company.orderservice.domain.entity.OrderItemEntity;
import com.company.orderservice.domain.enums.OrderStatus;
import com.company.orderservice.dto.request.CreateOrderRequest;
import com.company.orderservice.dto.response.OrderResponse;
import com.company.orderservice.dto.response.PageResponse;
import com.company.orderservice.exception.InsufficientInventoryException;
import com.company.orderservice.exception.OrderCannotBeCancelledException;
import com.company.orderservice.exception.OrderNotFoundException;
import com.company.orderservice.exception.PaymentFailedException;
import com.company.orderservice.mapper.OrderMapper;
import com.company.orderservice.repository.OrderRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final InventoryClient inventoryClient;
    private final PaymentClient paymentClient;
    private final CouponService couponService;
    private final com.company.orderservice.kafka.OrderEventPublisher orderEventPublisher;
    private final OutboxService outboxService;
    private ResilientOrderIntegrationClient resilientClient;
    private MeterRegistry meterRegistry;

    private static final Duration IDEMPOTENCY_WINDOW = Duration.ofHours(24);

    public OrderService(
            OrderRepository orderRepository,
            OrderMapper orderMapper,
            InventoryClient inventoryClient,
            PaymentClient paymentClient,
            CouponService couponService,
            com.company.orderservice.kafka.OrderEventPublisher orderEventPublisher,
            OutboxService outboxService) {
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
        this.inventoryClient = inventoryClient;
        this.paymentClient = paymentClient;
        this.couponService = couponService;
        this.orderEventPublisher = orderEventPublisher;
        this.outboxService = outboxService;
        this.resilientClient = new ResilientOrderIntegrationClient(inventoryClient, paymentClient);
    }

    @Autowired(required = false)
    public void setResilientClient(ResilientOrderIntegrationClient resilientClient) {
        if (resilientClient != null) {
            this.resilientClient = resilientClient;
        }
    }

    @Autowired(required = false)
    public void setMeterRegistry(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @Transactional
    public OrderResponse createOrder(String customerId, String idempotencyKey, CreateOrderRequest request) {
        log.info("Processing order creation for customer: {}, idempotencyKey: {}", customerId, idempotencyKey);

        // 1. Idempotency Check
        Optional<OrderEntity> existingOrderOpt = orderRepository.findByIdempotencyKey(idempotencyKey);
        if (existingOrderOpt.isPresent()) {
            OrderEntity existingOrder = existingOrderOpt.get();
            if (Duration.between(existingOrder.getCreatedAt(), Instant.now()).compareTo(IDEMPOTENCY_WINDOW) <= 0) {
                log.info("Idempotent request detected. Returning existing order id: {}", existingOrder.getId());
                return orderMapper.toResponse(existingOrder);
            }
        }

        // 2. Calculate Subtotal & Apply Coupon if Provided
        BigDecimal subtotal = request.items().stream()
                .map(item -> item.unitPrice().multiply(BigDecimal.valueOf(item.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CouponService.CouponApplicationResult couponResult = couponService.applyAndConsumeCoupon(request.couponCode(), subtotal);
        BigDecimal totalAmount = couponResult.finalAmount();
        log.info("Order subtotal: {}, discount: {}, final total: {}", subtotal, couponResult.discountAmount(), totalAmount);

        List<InventoryClient.StockCheckItem> stockItems = request.items().stream()
                .map(item -> new InventoryClient.StockCheckItem(item.skuCode(), item.quantity()))
                .toList();

        // 3. Reserve Inventory with Resiliency (via Spring AOP proxy bean)
        log.info("Reserving stock for {} items", stockItems.size());
        InventoryClient.InventoryReservationResponse reservation = resilientClient.reserveInventory(stockItems);
        if (!reservation.available()) {
            String failureReason = reservation.failureReason() != null ? reservation.failureReason() : "Requested items are out of stock";
            log.warn("Inventory reservation failed: {}", failureReason);
            recordOrderMetric("FAILED_INVENTORY");
            throw new InsufficientInventoryException(failureReason);
        }

        // 4. Process Payment with CircuitBreaker Fallback (PENDING_PAYMENT) or Compensating Transaction on Business Decline
        UUID orderId = UUID.randomUUID();
        PaymentClient.PaymentResponse paymentResponse;
        OrderStatus initialOrderStatus = OrderStatus.CONFIRMED;
        try {
            log.info("Processing payment of {} {} for customer: {}, orderId: {}", totalAmount, request.currency(), customerId, orderId);
            paymentResponse = resilientClient.processPayment(new PaymentClient.PaymentRequest(
                    orderId,
                    customerId,
                    totalAmount,
                    request.currency(),
                    request.paymentMethodToken(),
                    idempotencyKey
            ));

            if (!paymentResponse.success()) {
                throw new PaymentFailedException(paymentResponse.failureReason() != null ? paymentResponse.failureReason() : "Payment was declined");
            }
            if ("PENDING_PAYMENT".equalsIgnoreCase(paymentResponse.status())) {
                initialOrderStatus = OrderStatus.PENDING_PAYMENT;
                log.warn("Order {} placed in PENDING_PAYMENT state via CircuitBreaker fallback for async settlement", orderId);
            }
        } catch (Exception ex) {
            log.error("Payment failed: {}. Executing compensating transaction to release reserved stock.", ex.getMessage());
            compensateInventoryRelease(reservation.reservationId(), stockItems);
            recordOrderMetric("FAILED_PAYMENT");
            if (ex instanceof PaymentFailedException pfe) {
                throw pfe;
            }
            throw new PaymentFailedException("Payment processing failed: " + ex.getMessage());
        }

        // 5. Persist Order Entity
        OrderEntity orderEntity = OrderEntity.builder()
                .id(orderId)
                .customerId(customerId)
                .idempotencyKey(idempotencyKey)
                .status(initialOrderStatus)
                .totalAmount(totalAmount)
                .couponCode(couponResult.couponCode())
                .discountAmount(couponResult.discountAmount())
                .currency(request.currency())
                .paymentTransactionId(paymentResponse.transactionId())
                .build();

        for (CreateOrderRequest.OrderItemRequest itemReq : request.items()) {
            OrderItemEntity itemEntity = OrderItemEntity.builder()
                    .skuCode(itemReq.skuCode())
                    .quantity(itemReq.quantity())
                    .unitPrice(itemReq.unitPrice())
                    .build();
            orderEntity.addItem(itemEntity);
        }

        OrderEntity savedOrder = orderRepository.save(orderEntity);
        recordOrderMetric(savedOrder.getStatus().name());
        log.info("Order created successfully with id: {} (status={})", savedOrder.getId(), savedOrder.getStatus());

        com.company.common.events.OrderCreatedEvent createdEvent = new com.company.common.events.OrderCreatedEvent(
                savedOrder.getId(),
                savedOrder.getCustomerId(),
                savedOrder.getTotalAmount(),
                savedOrder.getCurrency(),
                request.paymentMethodToken(),
                savedOrder.getIdempotencyKey(),
                request.items().stream()
                        .map(i -> new com.company.common.events.OrderCreatedEvent.OrderItemPayload(i.skuCode(), i.quantity(), i.unitPrice()))
                        .toList(),
                savedOrder.getCreatedAt()
        );

        // Transactional Outbox guarantee
        com.company.orderservice.domain.entity.OutboxEventEntity outboxEvent =
                outboxService.saveEvent("ORDER", savedOrder.getId().toString(), "OrderCreatedEvent", "order-events", createdEvent);

        try {
            orderEventPublisher.publishOrderCreated(createdEvent);
            if (outboxEvent != null) {
                outboxService.markPublished(outboxEvent.getId());
            }
        } catch (Exception ex) {
            log.warn("Kafka direct event publishing skipped (outbox will retry): {}", ex.getMessage());
        }
        return orderMapper.toResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId, String customerId) {
        log.info("Fetching order: {} for customer: {}", orderId, customerId);
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (!order.getCustomerId().equals(customerId)) {
            log.warn("Access denied: Order {} does not belong to customer {}", orderId, customerId);
            throw new AccessDeniedException("You do not have permission to view this order");
        }

        return orderMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getOrders(String customerId, Pageable pageable) {
        log.info("Fetching orders page for customer: {}", customerId);
        Page<OrderEntity> page = orderRepository.findByCustomerId(customerId, pageable);
        Page<OrderResponse> responsePage = page.map(orderMapper::toResponse);
        return PageResponse.from(responsePage);
    }

    @Transactional
    public OrderResponse cancelOrder(UUID orderId, String customerId) {
        log.info("Cancelling order: {} for customer: {}", orderId, customerId);
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (!order.getCustomerId().equals(customerId)) {
            throw new AccessDeniedException("You do not have permission to cancel this order");
        }

        if (order.getStatus() != OrderStatus.CONFIRMED
                && order.getStatus() != OrderStatus.PENDING
                && order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new OrderCannotBeCancelledException(
                    "Order cannot be cancelled because it is in status: " + order.getStatus());
        }

        // Compensating Actions: Release Inventory and Refund Payment
        List<InventoryClient.StockCheckItem> stockItems = order.getItems().stream()
                .map(item -> new InventoryClient.StockCheckItem(item.getSkuCode(), item.getQuantity()))
                .toList();

        compensateInventoryRelease(null, stockItems);

        if (order.getPaymentTransactionId() != null
                && !order.getPaymentTransactionId().startsWith("PENDING-ASYNC-")) {
            resilientClient.refundPayment(new PaymentClient.RefundRequest(
                    order.getPaymentTransactionId(),
                    order.getTotalAmount(),
                    "Order cancelled by customer"
            ));
        }

        order.setStatus(OrderStatus.CANCELLED);
        OrderEntity updated = orderRepository.save(order);
        recordOrderMetric("CANCELLED");
        log.info("Order {} successfully cancelled", orderId);

        try {
            orderEventPublisher.publishOrderCancelled(new com.company.common.events.OrderCancelledEvent(
                    orderId,
                    customerId,
                    "Order cancelled by customer",
                    Instant.now()
            ));
        } catch (Exception ex) {
            log.warn("Kafka event publishing skipped or deferred: {}", ex.getMessage());
        }
        return orderMapper.toResponse(updated);
    }

    @CircuitBreaker(name = "inventoryService")
    @Retry(name = "inventoryService")
    public InventoryClient.InventoryReservationResponse reserveInventoryWithResilience(
            List<InventoryClient.StockCheckItem> items) {
        return resilientClient.reserveInventory(items);
    }

    private void compensateInventoryRelease(String reservationId, List<InventoryClient.StockCheckItem> items) {
        try {
            resilientClient.releaseInventory(new InventoryClient.InventoryReleaseRequest(reservationId, items));
        } catch (Exception ex) {
            log.error("Failed to release stock during compensation: {}", ex.getMessage());
        }
    }

    @CircuitBreaker(name = "paymentService")
    @Retry(name = "paymentService")
    public PaymentClient.PaymentResponse processPaymentWithResilience(PaymentClient.PaymentRequest request) {
        return resilientClient.processPayment(request);
    }

    @CircuitBreaker(name = "paymentService")
    public PaymentClient.RefundResponse refundPaymentWithResilience(PaymentClient.RefundRequest request) {
        return resilientClient.refundPayment(request);
    }

    private void recordOrderMetric(String status) {
        if (meterRegistry != null) {
            meterRegistry.counter("ecommerce_orders_created_total", "status", status).increment();
        }
    }
}
