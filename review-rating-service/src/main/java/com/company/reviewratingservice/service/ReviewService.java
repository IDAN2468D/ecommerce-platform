package com.company.reviewratingservice.service;

import com.company.common.events.ProductRatingUpdatedEvent;
import com.company.reviewratingservice.domain.entity.ProductReviewEntity;
import com.company.reviewratingservice.domain.entity.VerifiedBuyerEntity;
import com.company.reviewratingservice.dto.ReviewDtos.*;
import com.company.reviewratingservice.kafka.ReviewEventPublisher;
import com.company.reviewratingservice.repository.ProductReviewRepository;
import com.company.reviewratingservice.repository.VerifiedBuyerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ProductReviewRepository reviewRepository;
    private final VerifiedBuyerRepository buyerRepository;
    private final ReviewEventPublisher eventPublisher;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String REDIS_SUMMARY_PREFIX = "product_reviews:summary:";
    private static final Duration CACHE_TTL = Duration.ofMinutes(10);

    @Transactional
    public void recordVerifiedPurchase(String customerId, String skuCode, UUID orderId) {
        log.info("Recording verified buyer for customerId={}, skuCode={}, orderId={}", customerId, skuCode, orderId);
        boolean exists = buyerRepository.existsByCustomerIdAndSkuCode(customerId, skuCode);
        if (!exists) {
            VerifiedBuyerEntity buyer = VerifiedBuyerEntity.builder()
                    .id(UUID.randomUUID())
                    .customerId(customerId)
                    .skuCode(skuCode)
                    .orderId(orderId)
                    .verifiedAt(Instant.now())
                    .build();
            buyerRepository.save(buyer);
            log.info("Saved verified buyer record for customerId={} skuCode={}", customerId, skuCode);
        }
    }

    public boolean isVerifiedBuyer(String customerId, String skuCode) {
        if (customerId == null || customerId.isBlank()) {
            return false;
        }
        // Allow demo user or check database
        if ("usr_demo".equals(customerId)) {
            return true;
        }
        return buyerRepository.existsByCustomerIdAndSkuCode(customerId, skuCode);
    }

    public boolean hasCustomerReviewed(String customerId, String skuCode) {
        if (customerId == null || customerId.isBlank()) {
            return false;
        }
        return reviewRepository.existsByCustomerIdAndSkuCode(customerId, skuCode);
    }

    public ProductReviewsPageResponse getProductReviews(String skuCode) {
        log.info("Fetching reviews for skuCode: {}", skuCode);

        // 1. Try fetching summary from Redis
        String cacheKey = REDIS_SUMMARY_PREFIX + skuCode;
        ReviewSummaryResponse cachedSummary = null;
        try {
            Object cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached instanceof ReviewSummaryResponse summary) {
                cachedSummary = summary;
                log.info("Redis Cache HIT for review summary: {}", skuCode);
            }
        } catch (Exception ex) {
            log.warn("Redis read exception for review summary: {}", ex.getMessage());
        }

        // 2. Fetch all reviews from Mongo
        List<ProductReviewEntity> entities = reviewRepository.findBySkuCodeOrderByCreatedAtDesc(skuCode);
        List<ReviewResponse> reviews = entities.stream().map(this::toResponse).toList();

        // 3. Compute summary if cache missed
        if (cachedSummary == null) {
            log.info("Redis Cache MISS for review summary: {}. Calculating from database.", skuCode);
            cachedSummary = calculateSummary(skuCode, entities);
            try {
                redisTemplate.opsForValue().set(cacheKey, cachedSummary, CACHE_TTL);
            } catch (Exception ex) {
                log.warn("Failed to cache review summary in Redis: {}", ex.getMessage());
            }
        }

        return new ProductReviewsPageResponse(cachedSummary, reviews);
    }

    @Transactional
    public ReviewResponse createReview(String customerId, String customerName, CreateReviewRequest request) {
        log.info("Creating review for customerId: {}, skuCode: {}, rating: {}", customerId, request.skuCode(), request.rating());

        boolean verified = isVerifiedBuyer(customerId, request.skuCode());

        ProductReviewEntity review = ProductReviewEntity.builder()
                .id(UUID.randomUUID())
                .skuCode(request.skuCode())
                .customerId(customerId != null ? customerId : "usr_demo")
                .customerName(customerName != null && !customerName.isBlank() ? customerName : "רוכש מאומת")
                .rating(request.rating())
                .title(request.title())
                .content(request.content())
                .pros(request.pros() != null ? request.pros() : List.of())
                .cons(request.cons() != null ? request.cons() : List.of())
                .verifiedPurchase(verified)
                .createdAt(Instant.now())
                .build();

        ProductReviewEntity saved = reviewRepository.save(review);
        log.info("Review saved with ID: {}", saved.getId());

        // Recompute summary and update Redis
        List<ProductReviewEntity> allReviews = reviewRepository.findBySkuCodeOrderByCreatedAtDesc(request.skuCode());
        ReviewSummaryResponse summary = calculateSummary(request.skuCode(), allReviews);
        String cacheKey = REDIS_SUMMARY_PREFIX + request.skuCode();
        try {
            redisTemplate.opsForValue().set(cacheKey, summary, CACHE_TTL);
        } catch (Exception ex) {
            log.warn("Failed to update review summary in Redis: {}", ex.getMessage());
        }

        // Publish event to Kafka
        eventPublisher.publishRatingUpdated(new ProductRatingUpdatedEvent(
                request.skuCode(),
                summary.averageRating(),
                summary.totalReviews(),
                Instant.now()
        ));

        return toResponse(saved);
    }

    private ReviewSummaryResponse calculateSummary(String skuCode, List<ProductReviewEntity> reviews) {
        Map<Integer, Integer> starDistribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            starDistribution.put(i, 0);
        }

        if (reviews.isEmpty()) {
            return new ReviewSummaryResponse(skuCode, 5.0, 0, starDistribution);
        }

        int totalScore = 0;
        for (ProductReviewEntity r : reviews) {
            int rating = Math.max(1, Math.min(5, r.getRating()));
            starDistribution.put(rating, starDistribution.get(rating) + 1);
            totalScore += rating;
        }

        double avg = (double) totalScore / reviews.size();
        BigDecimal roundedAvg = BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP);

        return new ReviewSummaryResponse(skuCode, roundedAvg.doubleValue(), reviews.size(), starDistribution);
    }

    private ReviewResponse toResponse(ProductReviewEntity entity) {
        return new ReviewResponse(
                entity.getId(),
                entity.getSkuCode(),
                entity.getCustomerId(),
                entity.getCustomerName(),
                entity.getRating(),
                entity.getTitle(),
                entity.getContent(),
                entity.getPros(),
                entity.getCons(),
                entity.isVerifiedPurchase(),
                entity.getCreatedAt()
        );
    }
}
