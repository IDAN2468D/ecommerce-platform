package com.company.paymentservice.controller;

import com.company.paymentservice.dto.PaymentDtos.PaymentRequest;
import com.company.paymentservice.dto.PaymentDtos.PaymentResponse;
import com.company.paymentservice.dto.PaymentDtos.RefundRequest;
import com.company.paymentservice.dto.PaymentDtos.RefundResponse;
import com.company.paymentservice.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/v1/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Internal Payments", description = "Internal Declarative Endpoints used by Order Service")
public class PaymentInternalController {

    private final PaymentService paymentService;

    @PostMapping("/charge")
    @Operation(summary = "Process credit card payment with idempotency")
    public ResponseEntity<PaymentResponse> processPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refund")
    @Operation(summary = "Process refund for transaction (SAGA compensating action)")
    public ResponseEntity<RefundResponse> refundPayment(@Valid @RequestBody RefundRequest request) {
        RefundResponse response = paymentService.refundPayment(request);
        return ResponseEntity.ok(response);
    }
}
