package com.company.reviewratingservice.service;

import com.company.reviewratingservice.domain.entity.ProductReviewAiSummaryEntity;
import com.company.reviewratingservice.domain.entity.ProductReviewEntity;
import com.company.reviewratingservice.dto.ReviewDtos.AiReviewSummaryResponse;
import com.company.reviewratingservice.kafka.ReviewEventPublisher;
import com.company.reviewratingservice.repository.ProductReviewAiSummaryRepository;
import com.company.reviewratingservice.repository.ProductReviewRepository;
import com.company.reviewratingservice.repository.VerifiedBuyerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewAiSummaryTest {

    @Mock
    private ProductReviewRepository reviewRepository;

    @Mock
    private VerifiedBuyerRepository buyerRepository;

    @Mock
    private ProductReviewAiSummaryRepository aiSummaryRepository;

    @Mock
    private ReviewEventPublisher eventPublisher;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @InjectMocks
    private ReviewService reviewService;

    @Test
    void getAiReviewSummary_aggregatesVerifiedReviewsAndPersistsSummary() {
        ProductReviewEntity r1 = ProductReviewEntity.builder()
                .id(UUID.randomUUID())
                .skuCode("SONY-WH-1000XM5")
                .customerId("usr_1")
                .customerName("דניאל")
                .rating(5)
                .title("אוזניות מעולות")
                .content("ביטול רעשים מדהים ואיכות שמע יוצאת דופן!")
                .verifiedPurchase(true)
                .createdAt(Instant.now())
                .build();

        when(aiSummaryRepository.findBySkuCode("SONY-WH-1000XM5")).thenReturn(Optional.empty());
        when(reviewRepository.findBySkuCodeAndVerifiedPurchaseTrueOrderByCreatedAtDesc("SONY-WH-1000XM5"))
                .thenReturn(List.of(r1));
        when(aiSummaryRepository.save(any(ProductReviewAiSummaryEntity.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        AiReviewSummaryResponse summary = reviewService.getAiReviewSummary("SONY-WH-1000XM5");

        assertNotNull(summary);
        assertEquals("SONY-WH-1000XM5", summary.skuCode());
        assertNotNull(summary.aiSummary());
        assertFalse(summary.prosList().isEmpty());
        assertFalse(summary.consList().isEmpty());
        assertEquals(1, summary.verifiedReviewsCount());
        verify(aiSummaryRepository, times(1)).save(any(ProductReviewAiSummaryEntity.class));
    }
}
