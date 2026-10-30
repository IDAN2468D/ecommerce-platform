package com.company.orderservice.controller;

import com.company.orderservice.config.SecurityConfig;
import com.company.orderservice.domain.enums.OrderStatus;
import com.company.orderservice.dto.request.CreateOrderRequest;
import com.company.orderservice.dto.response.OrderResponse;
import com.company.orderservice.dto.response.PageResponse;
import com.company.orderservice.exception.GlobalExceptionHandler;
import com.company.orderservice.exception.InsufficientInventoryException;
import com.company.orderservice.exception.OrderNotFoundException;
import com.company.orderservice.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.tracing.Tracer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = OrderController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    @MockBean
    private com.company.orderservice.service.CouponService couponService;

    @MockBean
    private com.company.orderservice.service.InvoiceService invoiceService;

    @MockBean
    private com.company.orderservice.service.OutboxService outboxService;

    @MockBean
    private Tracer tracer;

    private CreateOrderRequest sampleRequest() {
        return new CreateOrderRequest(
                "ILS",
                "pm_token_123",
                List.of(new CreateOrderRequest.OrderItemRequest("IPHONE-16-PRO-256", 1, new BigDecimal("4899.00")))
        );
    }

    @Test
    @DisplayName("POST /api/v1/orders returns 201 Created on valid order")
    void createOrder_Success() throws Exception {
        UUID orderId = UUID.randomUUID();
        CreateOrderRequest request = sampleRequest();

        OrderResponse expectedResponse = new OrderResponse(
                orderId,
                "user-123",
                OrderStatus.CONFIRMED,
                new BigDecimal("4899.00"),
                "ILS",
                "tx_123",
                Instant.now(),
                Instant.now(),
                List.of(new OrderResponse.OrderItemResponse(UUID.randomUUID(), "IPHONE-16-PRO-256", 1, new BigDecimal("4899.00")))
        );

        when(orderService.createOrder(eq("user-123"), eq("key-uuid-123"), any(CreateOrderRequest.class)))
                .thenReturn(expectedResponse);

        mockMvc.perform(post("/api/v1/orders")
                        .with(jwt().jwt(builder -> builder.subject("user-123")))
                        .header("Idempotency-Key", "key-uuid-123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value(orderId.toString()))
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.totalAmount").value(4899.00))
                .andExpect(jsonPath("$.currency").value("ILS"));
    }

    @Test
    @DisplayName("POST /api/v1/orders returns 400 Bad Request with RFC 7807 when Idempotency-Key header is missing")
    void createOrder_MissingHeader_ReturnsRFC7807ProblemDetail() throws Exception {
        CreateOrderRequest request = sampleRequest();

        mockMvc.perform(post("/api/v1/orders")
                        .with(jwt().jwt(builder -> builder.subject("user-123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").value("https://api.company.com/errors/missing-header"))
                .andExpect(jsonPath("$.title").value("Missing Request Header"))
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("POST /api/v1/orders returns 400 Bad Request with RFC 7807 when body validation fails")
    void createOrder_InvalidBody_ReturnsRFC7807ProblemDetail() throws Exception {
        // Missing currency, invalid quantity (0)
        CreateOrderRequest invalidRequest = new CreateOrderRequest(
                "",
                "",
                List.of(new CreateOrderRequest.OrderItemRequest("", 0, new BigDecimal("-10.00")))
        );

        mockMvc.perform(post("/api/v1/orders")
                        .with(jwt().jwt(builder -> builder.subject("user-123")))
                        .header("Idempotency-Key", "test-key")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").value("https://api.company.com/errors/validation-error"))
                .andExpect(jsonPath("$.title").value("Validation Error"))
                .andExpect(jsonPath("$.invalidFields").exists());
    }

    @Test
    @DisplayName("POST /api/v1/orders returns 409 Conflict with RFC 7807 on insufficient inventory")
    void createOrder_InsufficientInventory_Returns409() throws Exception {
        CreateOrderRequest request = sampleRequest();

        when(orderService.createOrder(eq("user-123"), eq("key-123"), any()))
                .thenThrow(new InsufficientInventoryException("SKU IPHONE-16-PRO-256 is out of stock"));

        mockMvc.perform(post("/api/v1/orders")
                        .with(jwt().jwt(builder -> builder.subject("user-123")))
                        .header("Idempotency-Key", "key-123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.type").value("https://api.company.com/errors/insufficient-inventory"))
                .andExpect(jsonPath("$.title").value("Insufficient Inventory"))
                .andExpect(jsonPath("$.detail").value("SKU IPHONE-16-PRO-256 is out of stock"))
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    @DisplayName("GET /api/v1/orders/{id} returns 200 OK")
    void getOrderById_Success() throws Exception {
        UUID orderId = UUID.randomUUID();
        OrderResponse response = new OrderResponse(
                orderId,
                "user-123",
                OrderStatus.CONFIRMED,
                new BigDecimal("100.00"),
                "ILS",
                "tx_1",
                Instant.now(),
                Instant.now(),
                List.of()
        );

        when(orderService.getOrderById(orderId, "user-123")).thenReturn(response);

        mockMvc.perform(get("/api/v1/orders/" + orderId)
                        .with(jwt().jwt(builder -> builder.subject("user-123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(orderId.toString()))
                .andExpect(jsonPath("$.customerId").value("user-123"));
    }

    @Test
    @DisplayName("GET /api/v1/orders/{id} returns 404 Not Found when order does not exist")
    void getOrderById_NotFound() throws Exception {
        UUID orderId = UUID.randomUUID();
        when(orderService.getOrderById(orderId, "user-123"))
                .thenThrow(new OrderNotFoundException(orderId));

        mockMvc.perform(get("/api/v1/orders/" + orderId)
                        .with(jwt().jwt(builder -> builder.subject("user-123"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.type").value("https://api.company.com/errors/order-not-found"))
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("POST /api/v1/orders/{id}/cancel cancels order successfully")
    void cancelOrder_Success() throws Exception {
        UUID orderId = UUID.randomUUID();
        OrderResponse response = new OrderResponse(
                orderId,
                "user-123",
                OrderStatus.CANCELLED,
                new BigDecimal("100.00"),
                "ILS",
                "tx_1",
                Instant.now(),
                Instant.now(),
                List.of()
        );

        when(orderService.cancelOrder(orderId, "user-123")).thenReturn(response);

        mockMvc.perform(post("/api/v1/orders/" + orderId + "/cancel")
                        .with(jwt().jwt(builder -> builder.subject("user-123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    @DisplayName("Unauthenticated request to /api/v1/orders returns 401 Unauthorized")
    void unauthenticatedRequest_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/orders"))
                .andExpect(status().isUnauthorized());
    }
}
