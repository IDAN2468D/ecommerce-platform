package com.company.recommendationloyaltyservice.controller;

import com.company.recommendationloyaltyservice.dto.RecommendationDtos.RecommendationResponse;
import com.company.recommendationloyaltyservice.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Product Recommendations", description = "AI & Frequently Bought Together Product Recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/{skuCode}")
    @Operation(summary = "Get top 4 smart complementary product recommendations for SKU")
    public ResponseEntity<RecommendationResponse> getRecommendations(@PathVariable String skuCode) {
        log.info("REST: Querying recommendations for skuCode: {}", skuCode);
        return ResponseEntity.ok(recommendationService.getRecommendationsForSku(skuCode));
    }
}
