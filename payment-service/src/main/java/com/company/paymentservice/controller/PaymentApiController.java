package com.company.paymentservice.controller;

import com.company.paymentservice.domain.entity.PaymentTransactionEntity;
import com.company.paymentservice.repository.PaymentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Public Payments", description = "Query payment transactions")
public class PaymentApiController {

    private final PaymentRepository paymentRepository;

    @GetMapping("/transactions/{id}")
    @Operation(summary = "Get transaction details by ID")
    public ResponseEntity<PaymentTransactionEntity> getTransaction(@PathVariable UUID id) {
        return paymentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
