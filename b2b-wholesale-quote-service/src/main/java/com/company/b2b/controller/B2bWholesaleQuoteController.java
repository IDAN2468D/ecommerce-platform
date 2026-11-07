package com.company.b2b.controller;

import com.company.b2b.domain.B2bWholesaleQuote;
import com.company.b2b.dto.CreateB2bQuoteRequest;
import com.company.b2b.service.B2bWholesaleQuoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/b2b-quotes")
@RequiredArgsConstructor
@Tag(name = "B2B Wholesale & Corporate RFQ", description = "Tiered volume discounts and Net-30 corporate RFQ quote generation")
public class B2bWholesaleQuoteController {

    private final B2bWholesaleQuoteService quoteService;

    @GetMapping
    @Operation(summary = "List all B2B Wholesale RFQ quotes")
    public ResponseEntity<List<B2bWholesaleQuote>> getAllQuotes() {
        return ResponseEntity.ok(quoteService.getAllQuotes());
    }

    @PostMapping
    @Operation(summary = "Generate an instant B2B Wholesale RFQ quote with volume discount")
    public ResponseEntity<B2bWholesaleQuote> generateQuote(@Valid @RequestBody CreateB2bQuoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quoteService.generateQuote(request));
    }
}
