package com.company.merchantanalyticsservice.controller;

import com.company.merchantanalyticsservice.dto.AnalyticsDtos.*;
import com.company.merchantanalyticsservice.service.MerchantAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Merchant Telemetry & Predictive Analytics API", description = "Endpoints for real-time GMV, conversion metrics, SKU stock depletion forecasting, and AI merchant copilot")
public class MerchantAnalyticsController {

    private final MerchantAnalyticsService analyticsService;

    @GetMapping("/summary")
    @Operation(summary = "Get real-time platform KPIs (GMV, AOV, conversion rate, fraud block rate, RMA VIP retention)")
    public ResponseEntity<AnalyticsSummaryResponse> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    @GetMapping("/inventory-forecast")
    @Operation(summary = "Get SKU stock-out depletion velocity forecasts sorted by urgency")
    public ResponseEntity<List<SkuDepletionForecastDto>> getInventoryForecast(
            @RequestParam(defaultValue = "false") boolean onlyCritical
    ) {
        return ResponseEntity.ok(analyticsService.getInventoryForecast(onlyCritical));
    }

    @PostMapping("/ai-copilot")
    @Operation(summary = "Answer merchant natural-language operational and telemetry queries (Shopify Sidekick pattern)")
    public ResponseEntity<MerchantCopilotResponse> answerCopilotQuestion(@Valid @RequestBody MerchantCopilotRequest request) {
        return ResponseEntity.ok(analyticsService.answerCopilotQuestion(request));
    }
}
