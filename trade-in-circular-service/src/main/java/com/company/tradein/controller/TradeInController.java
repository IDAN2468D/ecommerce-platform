package com.company.tradein.controller;

import com.company.tradein.domain.TradeInAppraisal;
import com.company.tradein.dto.CreateTradeInRequest;
import com.company.tradein.service.TradeInService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/trade-in")
@RequiredArgsConstructor
@Tag(name = "AI Trade-In & Circular Commerce", description = "Device condition appraisal, instant Trade-In credit vouchers, and resale retention")
public class TradeInController {

    private final TradeInService tradeInService;

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get all Trade-In appraisals and active credit vouchers for a customer")
    public ResponseEntity<List<TradeInAppraisal>> getCustomerAppraisals(@PathVariable String customerId) {
        return ResponseEntity.ok(tradeInService.getCustomerAppraisals(customerId));
    }

    @PostMapping("/appraise")
    @Operation(summary = "Appraise a used device and issue an instant Trade-In credit voucher")
    public ResponseEntity<TradeInAppraisal> appraiseDevice(@Valid @RequestBody CreateTradeInRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tradeInService.appraiseDevice(request));
    }
}
