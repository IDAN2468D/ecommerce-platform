package com.company.orderservice.controller;

import com.company.orderservice.dto.request.CreateOrderRequest;
import com.company.orderservice.dto.response.OrderResponse;
import com.company.orderservice.dto.response.PageResponse;
import com.company.orderservice.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Orders", description = "Order Management Microservice APIs")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;
    private final com.company.orderservice.service.CouponService couponService;
    private final com.company.orderservice.service.InvoiceService invoiceService;
    private final com.company.orderservice.service.OutboxService outboxService;

    private String extractCustomerId(Jwt jwt, Principal principal) {
        if (jwt != null && jwt.getSubject() != null) {
            return jwt.getSubject();
        }
        if (principal != null && principal.getName() != null) {
            return principal.getName();
        }
        return "usr_demo";
    }

    @PostMapping
    @Operation(summary = "Create a new order", description = "Creates a new customer order with inventory reservation and payment processing. Idempotent based on Idempotency-Key header.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Order successfully created"),
        @ApiResponse(responseCode = "400", description = "Invalid request payload or missing header"),
        @ApiResponse(responseCode = "409", description = "Insufficient inventory"),
        @ApiResponse(responseCode = "402", description = "Payment required / failed"),
        @ApiResponse(responseCode = "503", description = "Downstream service circuit breaker is open")
    })
    public ResponseEntity<OrderResponse> createOrder(
            @Parameter(description = "Unique UUID idempotency key to prevent double charging", required = true)
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @AuthenticationPrincipal Jwt jwt,
            Principal principal,
            @Valid @RequestBody CreateOrderRequest request) {

        String customerId = extractCustomerId(jwt, principal);
        log.info("Received order creation request from customer: {}", customerId);

        OrderResponse response = orderService.createOrder(customerId, idempotencyKey, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order by ID", description = "Retrieves order details and status by its unique UUID.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Order found"),
        @ApiResponse(responseCode = "403", description = "Access denied: order belongs to another customer"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable UUID orderId,
            @AuthenticationPrincipal Jwt jwt,
            Principal principal) {

        String customerId = extractCustomerId(jwt, principal);
        OrderResponse response = orderService.getOrderById(orderId, customerId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List customer orders", description = "Retrieves a paginated list of previous orders for the authenticated customer.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Orders retrieved successfully")
    })
    public ResponseEntity<PageResponse<OrderResponse>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort,
            @AuthenticationPrincipal Jwt jwt,
            Principal principal) {

        String customerId = extractCustomerId(jwt, principal);
        String[] sortParts = sort.split(",");
        String sortProp = sortParts[0];
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortProp));
        PageResponse<OrderResponse> response = orderService.getOrders(customerId, pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel an order", description = "Cancels a confirmed order, releases inventory and initiates payment refund.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Order cancelled successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be cancelled in its current status"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable UUID orderId,
            @AuthenticationPrincipal Jwt jwt,
            Principal principal) {

        String customerId = extractCustomerId(jwt, principal);
        OrderResponse response = orderService.cancelOrder(orderId, customerId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/coupons/validate")
    @Operation(summary = "Validate coupon code", description = "Checks whether a coupon code is valid, active, and applicable for the given order amount.")
    public ResponseEntity<com.company.orderservice.dto.response.CouponValidationResponse> validateCoupon(
            @Valid @RequestBody com.company.orderservice.dto.request.ValidateCouponRequest request) {
        log.info("Validating coupon code: {} for amount: {}", request.couponCode(), request.orderAmount());
        return ResponseEntity.ok(couponService.validateCoupon(request));
    }

    @GetMapping("/{orderId}/invoice")
    @Operation(summary = "Download official Hebrew/English PDF tax invoice", description = "Generates and streams an official tax invoice/receipt PDF with full item breakdown, 18% VAT, and SAGA approval stamp.")
    public ResponseEntity<byte[]> getOrderInvoice(@PathVariable UUID orderId) {
        log.info("Requesting PDF tax invoice for order: {}", orderId);
        byte[] pdfBytes = invoiceService.generateInvoicePdf(orderId);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDisposition(org.springframework.http.ContentDisposition.inline()
                .filename("invoice-" + orderId + ".pdf")
                .build());
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/outbox/status")
    @Operation(summary = "Get transactional outbox events and dead letter queue telemetry")
    public ResponseEntity<java.util.List<com.company.orderservice.domain.entity.OutboxEventEntity>> getOutboxEvents() {
        return ResponseEntity.ok(outboxService.getRecentEvents());
    }
}
