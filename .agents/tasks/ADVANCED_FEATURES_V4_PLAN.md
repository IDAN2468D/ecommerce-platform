# Implementation Plan: 6 Advanced Microservice Features & RAG Consolidation

- **Spec Reference**: `.agents/specs/ADVANCED_FEATURES_V4_SPEC.md`
- **Date**: 2026-11-02

---

## Phase 0: RAG Consolidation (Single Source of Truth)
- [x] Remove duplicate package `com.company.recommendationloyaltyservice.rag.*` from `recommendation-loyalty-service`.
- [x] Update `RecommendationService` in `recommendation-loyalty-service` to query `rag-service` via REST for vector-based product recommendations.
- [x] Configure `api-gateway` and `docker-compose.yml` so `rag-service` (`8092`) is the canonical RAG service.

## Phase 1: Common Events & Inventory Event Enrichment
- [x] Add `CartAbandonedEvent.java` to `common-events`.
- [x] Enrich `StockReservedEvent.java` and `StockReleasedEvent.java` with SKU stock quantities while preserving backward-compatible constructors.
- [x] Update `InventoryService.java` to include updated SKU quantities in published stock events.

## Phase 2: `rag-service` Upgrades (Features 1, 2, 5, 6 + Review Summary Helper)
- [x] Update `CatalogVectorDocument.java`, `CatalogIndexingService.java`, and `CatalogSyncKafkaConsumer.java` to track `availableQuantity`, `inStock`, and `averageRating` from Kafka events.
- [x] Upgrade `RagQueryRequest.java` and `VectorSearchRepository.java` with Pre-filtering (`onlyInStock`, `maxPrice`, `minRating`, `category`) and Hybrid Reranking (`cosineSimilarity` + `averageRating`).
- [x] Implement Agentic Tools (`addToCartTool`, `checkOrderStatusTool`, `validateBestCouponTool`) in `AgenticToolsService.java`, `GeminiGenerationService.java`, and `RagOrchestrationService.java`, returning `executedActions` in `RagQueryResponse.java`.
- [x] Implement `POST /api/v1/rag/compare` for Smart Product Comparison AI Verdict.
- [x] Implement `POST /api/v1/rag/multimodal-search` for Gemini Vision + Vector Retrieval.

## Phase 3: `review-rating-service` AI Verified Review Summarizer (Feature 3)
- [x] Create `ProductReviewAiSummaryEntity` and `ProductReviewAiSummaryRepository`.
- [x] Update `ReviewService.java` to asynchronously aggregate verified buyer reviews, generate structured AI summaries (`aiSummary`, `prosList`, `consList`), and cache in Redis + MongoDB.
- [x] Expose `GET /api/v1/reviews/{sku}/summary` in `ReviewController.java`.

## Phase 4: Abandoned Cart Recovery & Dynamic Coupon (Feature 4)
- [x] Update `SavedCartEntity`, `CartService`, and `CartController` in `cart-wishlist-service` to detect abandoned carts and publish `CartAbandonedEvent`.
- [x] Update `CouponService` in `order-service` to consume `CartAbandonedEvent`, create a 30-minute personalized coupon in `CouponRepository`, and publish `NotificationSentEvent`.
- [x] Update `NotificationKafkaConsumer` in `notification-service` to push `ABANDONED_CART_COUPON` via `SseNotificationService`.

## Phase 5: Next.js API Routes & Frontend Components (`web-client`)
- [x] Add Next.js API routes: `/api/reviews/[sku]/summary`, `/api/rag/compare`, `/api/rag/multimodal-search`, `/api/cart/abandoned`.
- [x] Upgrade `RagAssistantDrawer.tsx` with Action Chips and automatic `CartDrawer.tsx` refresh.
- [x] Upgrade `ProductQuickViewModal.tsx` with AI Verified Review Summary block.
- [x] Upgrade `useNotificationStream.ts`, `NotificationToast.tsx`, and `app/cart/page.tsx` with "החל קופון בסל" auto-apply flow.
- [x] Upgrade `ProductComparisonModal.tsx` with Use-Case selector and real-time AI Verdict display.
- [x] Upgrade `CommandPalette.tsx` and `CatalogFilterBar.tsx` with Web Speech API voice search and Multimodal Image Search.

## Phase 6: Unit Tests, Integration Tests & E2E Verification
- [x] Add/update unit & integration tests across modified microservices.
- [x] Run Maven build (`mvnw clean test package`) and Next.js build (`npm run build`).
- [x] Update `test-e2e.ps1` to verify all 6 new features end-to-end.
