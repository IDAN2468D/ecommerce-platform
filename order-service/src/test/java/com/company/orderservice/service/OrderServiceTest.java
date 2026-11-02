package com.company.orderservice.service;

import com.company.orderservice.client.InventoryClient;
import com.company.orderservice.client.PaymentClient;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private InventoryClient inventoryClient;

    @Mock
    private PaymentClient paymentClient;

    @Mock
    private CouponService couponService;

    @Mock
    private com.company.orderservice.kafka.OrderEventPublisher orderEventPublisher;

    @Mock
    private OutboxService outboxService;

    private final OrderMapper orderMapper = Mappers.getMapper(OrderMapper.class);

    private OrderService orderService;

    private final String customerId = "usr_123456";
    private final String idempotencyKey = "key_test_uuid_1";

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository, orderMapper, inventoryClient, paymentClient, couponService, orderEventPublisher, outboxService);
        lenient().when(couponService.applyAndConsumeCoupon(any(), any()))
                .thenAnswer(inv -> new CouponService.CouponApplicationResult(null, BigDecimal.ZERO, inv.getArgument(1)));
    }

    private CreateOrderRequest sampleRequest() {
        return new CreateOrderRequest(
                "ILS",
                "pm_card_test_token",
                List.of(
                        new CreateOrderRequest.OrderItemRequest("IPHONE-16-PRO-256", 1, new BigDecimal("4899.00")),
                        new CreateOrderRequest.OrderItemRequest("CASE-CLEAR-MAGSAFE", 2, new BigDecimal("150.00"))
                )
        );
    }

    @Test
    @DisplayName("FR-01: Create order successfully when inventory and payment succeed")
    void createOrder_Success() {
        CreateOrderRequest request = sampleRequest();

        when(orderRepository.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.empty());

        when(inventoryClient.reserveStock(any()))
                .thenReturn(new InventoryClient.InventoryReservationResponse(true, "res_9988", null));

        when(paymentClient.processPayment(any()))
                .thenReturn(new PaymentClient.PaymentResponse(true, "tx_112233", "SUCCEEDED", null));

        when(orderRepository.save(any(OrderEntity.class))).thenAnswer(invocation -> {
            OrderEntity entity = invocation.getArgument(0);
            entity.setCreatedAt(Instant.now());
            entity.setUpdatedAt(Instant.now());
            return entity;
        });

        OrderResponse response = orderService.createOrder(customerId, idempotencyKey, request);

        assertThat(response).isNotNull();
        assertThat(response.customerId()).isEqualTo(customerId);
        assertThat(response.status()).isEqualTo(OrderStatus.CONFIRMED);
        assertThat(response.totalAmount()).isEqualByComparingTo(new BigDecimal("5199.00"));
        assertThat(response.paymentTransactionId()).isEqualTo("tx_112233");
        assertThat(response.items()).hasSize(2);

        verify(inventoryClient, times(1)).reserveStock(any());
        verify(paymentClient, times(1)).processPayment(any());
        verify(orderRepository, times(1)).save(any(OrderEntity.class));
    }

    @Test
    @DisplayName("FR-01 / NFR-4: Idempotency - returns existing order if called with same idempotency key")
    void createOrder_IdempotencyHit() {
        CreateOrderRequest request = sampleRequest();

        OrderEntity existingOrder = OrderEntity.builder()
                .id(UUID.randomUUID())
                .customerId(customerId)
                .idempotencyKey(idempotencyKey)
                .status(OrderStatus.CONFIRMED)
                .totalAmount(new BigDecimal("5199.00"))
                .currency("ILS")
                .paymentTransactionId("tx_existing")
                .createdAt(Instant.now().minusSeconds(120))
                .updatedAt(Instant.now().minusSeconds(120))
                .build();

        when(orderRepository.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.of(existingOrder));

        OrderResponse response = orderService.createOrder(customerId, idempotencyKey, request);

        assertThat(response.orderId()).isEqualTo(existingOrder.getId());
        assertThat(response.paymentTransactionId()).isEqualTo("tx_existing");

        verifyNoInteractions(inventoryClient);
        verifyNoInteractions(paymentClient);
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("FR-01: Insufficient inventory throws InsufficientInventoryException and stops before payment")
    void createOrder_InsufficientInventory_ThrowsException() {
        CreateOrderRequest request = sampleRequest();

        when(orderRepository.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.empty());

        when(inventoryClient.reserveStock(any()))
                .thenReturn(new InventoryClient.InventoryReservationResponse(false, null, "SKU out of stock"));

        assertThatThrownBy(() -> orderService.createOrder(customerId, idempotencyKey, request))
                .isInstanceOf(InsufficientInventoryException.class)
                .hasMessageContaining("SKU out of stock");

        verifyNoInteractions(paymentClient);
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("FR-01: Payment failure triggers compensating transaction to release reserved stock")
    void createOrder_PaymentFailure_TriggersCompensatingRelease() {
        CreateOrderRequest request = sampleRequest();

        when(orderRepository.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.empty());

        when(inventoryClient.reserveStock(any()))
                .thenReturn(new InventoryClient.InventoryReservationResponse(true, "res_to_release", null));

        when(paymentClient.processPayment(any()))
                .thenReturn(new PaymentClient.PaymentResponse(false, null, "FAILED", "Card expired"));

        assertThatThrownBy(() -> orderService.createOrder(customerId, idempotencyKey, request))
                .isInstanceOf(PaymentFailedException.class)
                .hasMessageContaining("Card expired");

        // Verify Compensating action: stock was released!
        verify(inventoryClient, times(1)).releaseStock(argThat(releaseReq ->
                "res_to_release".equals(releaseReq.reservationId()) && releaseReq.items().size() == 2
        ));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("FR-02: Get order by ID returns order for matching customer")
    void getOrderById_Success() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = OrderEntity.builder()
                .id(orderId)
                .customerId(customerId)
                .status(OrderStatus.CONFIRMED)
                .totalAmount(new BigDecimal("100.00"))
                .currency("ILS")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        OrderResponse response = orderService.getOrderById(orderId, customerId);

        assertThat(response.orderId()).isEqualTo(orderId);
        assertThat(response.customerId()).isEqualTo(customerId);
    }

    @Test
    @DisplayName("FR-02: Get order by ID throws OrderNotFoundException if order does not exist")
    void getOrderById_NotFound() {
        UUID orderId = UUID.randomUUID();
        when(orderRepository.findById(orderId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getOrderById(orderId, customerId))
                .isInstanceOf(OrderNotFoundException.class)
                .hasMessageContaining(orderId.toString());
    }

    @Test
    @DisplayName("FR-02: Get order by ID throws AccessDeniedException if order belongs to another customer")
    void getOrderById_AccessDenied() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = OrderEntity.builder()
                .id(orderId)
                .customerId("different_user")
                .status(OrderStatus.CONFIRMED)
                .totalAmount(new BigDecimal("100.00"))
                .currency("ILS")
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.getOrderById(orderId, customerId))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("permission");
    }

    @Test
    @DisplayName("FR-03: Get orders paginated for customer")
    void getOrders_Paginated() {
        Pageable pageable = PageRequest.of(0, 10);
        OrderEntity order = OrderEntity.builder()
                .id(UUID.randomUUID())
                .customerId(customerId)
                .status(OrderStatus.CONFIRMED)
                .totalAmount(new BigDecimal("500.00"))
                .currency("ILS")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Page<OrderEntity> page = new PageImpl<>(List.of(order), pageable, 1);
        when(orderRepository.findByCustomerId(customerId, pageable)).thenReturn(page);

        PageResponse<OrderResponse> result = orderService.getOrders(customerId, pageable);

        assertThat(result.totalElements()).isEqualTo(1);
        assertThat(result.content()).hasSize(1);
        assertThat(result.pageNumber()).isZero();
    }

    @Test
    @DisplayName("FR-04: Cancel order releases stock and refunds payment")
    void cancelOrder_Success() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = OrderEntity.builder()
                .id(orderId)
                .customerId(customerId)
                .status(OrderStatus.CONFIRMED)
                .totalAmount(new BigDecimal("300.00"))
                .currency("ILS")
                .paymentTransactionId("tx_to_refund")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        OrderItemEntity item = OrderItemEntity.builder()
                .id(UUID.randomUUID())
                .skuCode("SKU-1")
                .quantity(2)
                .unitPrice(new BigDecimal("150.00"))
                .build();
        order.addItem(item);

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(OrderEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse cancelledResponse = orderService.cancelOrder(orderId, customerId);

        assertThat(cancelledResponse.status()).isEqualTo(OrderStatus.CANCELLED);
        verify(inventoryClient, times(1)).releaseStock(any());
        verify(paymentClient, times(1)).refundPayment(any());
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    @DisplayName("FR-04: Cancel order throws OrderCannotBeCancelledException if order is already cancelled")
    void cancelOrder_AlreadyCancelled_ThrowsException() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = OrderEntity.builder()
                .id(orderId)
                .customerId(customerId)
                .status(OrderStatus.CANCELLED)
                .totalAmount(new BigDecimal("300.00"))
                .currency("ILS")
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.cancelOrder(orderId, customerId))
                .isInstanceOf(OrderCannotBeCancelledException.class)
                .hasMessageContaining("CANCELLED");

        verifyNoInteractions(paymentClient);
    }

    @Test
    @DisplayName("Resilience4j Fallback: Payment service degradation transitions order to PENDING_PAYMENT for async processing")
    void createOrder_PaymentFallbackPendingPayment_SavesOrderAsPendingPayment() {
        CreateOrderRequest request = sampleRequest();

        when(orderRepository.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.empty());
        when(inventoryClient.reserveStock(any()))
                .thenReturn(new InventoryClient.InventoryReservationResponse(true, "res_async_1", null));

        com.company.orderservice.client.ResilientOrderIntegrationClient resilientClient =
                new com.company.orderservice.client.ResilientOrderIntegrationClient(inventoryClient, paymentClient);

        // Simulate Resilience4j CircuitBreaker fallback response (PENDING_PAYMENT)
        PaymentClient.PaymentResponse fallbackResponse = resilientClient.fallbackProcessPayment(
                new PaymentClient.PaymentRequest(UUID.randomUUID(), customerId, new BigDecimal("5199.00"), "ILS", "pm_card_test_token", idempotencyKey),
                new RuntimeException("Payment gateway timeout"));

        when(paymentClient.processPayment(any())).thenReturn(fallbackResponse);
        when(orderRepository.save(any(OrderEntity.class))).thenAnswer(inv -> {
            OrderEntity entity = inv.getArgument(0);
            entity.setCreatedAt(Instant.now());
            entity.setUpdatedAt(Instant.now());
            return entity;
        });

        OrderResponse response = orderService.createOrder(customerId, idempotencyKey, request);

        assertThat(response.status()).isEqualTo(OrderStatus.PENDING_PAYMENT);
        assertThat(response.paymentTransactionId()).startsWith("PENDING-ASYNC-");
        verify(inventoryClient, never()).releaseStock(any());
        verify(orderRepository, times(1)).save(argThat(o -> o.getStatus() == OrderStatus.PENDING_PAYMENT));
    }
}
