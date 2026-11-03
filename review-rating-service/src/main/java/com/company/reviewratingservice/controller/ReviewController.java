package com.company.reviewratingservice.controller;

import com.company.reviewratingservice.dto.ReviewDtos.*;
import com.company.reviewratingservice.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Reviews & Ratings", description = "Verified Purchase Customer Reviews, Ratings, and AI Summarizer")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping({"/product/{skuCode}", "/{skuCode}"})
    @Operation(summary = "Get product reviews and star rating distribution with Redis caching")
    public ResponseEntity<ProductReviewsPageResponse> getProductReviews(@PathVariable String skuCode) {
        log.info("REST: Querying reviews for product: {}", skuCode);
        return ResponseEntity.ok(reviewService.getProductReviews(skuCode));
    }

    @GetMapping("/{sku}/summary")
    @Operation(summary = "Get AI Verified Buyer Review Summary (aiSummary, prosList, consList) cached in Redis & MongoDB")
    public ResponseEntity<AiReviewSummaryResponse> getAiReviewSummary(@PathVariable("sku") String sku) {
        log.info("REST: Querying AI verified review summary for SKU: {}", sku);
        return ResponseEntity.ok(reviewService.getAiReviewSummary(sku));
    }

    @PostMapping
    @Operation(summary = "Submit a verified customer review")
    public ResponseEntity<ReviewResponse> createReview(
            @RequestHeader(value = "X-Customer-Id", required = false, defaultValue = "usr_demo") String customerId,
            @RequestHeader(value = "X-Customer-Name", required = false, defaultValue = "ישראל ישראלי") String customerName,
            @Valid @RequestBody CreateReviewRequest request) {
        log.info("REST: Creating review for skuCode: {} by customer: {}", request.skuCode(), customerId);
        ReviewResponse response = reviewService.createReview(customerId, customerName, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/buyer-check/{skuCode}")
    @Operation(summary = "Check if customer is verified buyer and has already reviewed")
    public ResponseEntity<BuyerCheckResponse> checkBuyer(
            @PathVariable String skuCode,
            @RequestHeader(value = "X-Customer-Id", required = false, defaultValue = "usr_demo") String customerId) {
        boolean verified = reviewService.isVerifiedBuyer(customerId, skuCode);
        boolean reviewed = reviewService.hasCustomerReviewed(customerId, skuCode);
        return ResponseEntity.ok(new BuyerCheckResponse(skuCode, verified, reviewed));
    }
}
