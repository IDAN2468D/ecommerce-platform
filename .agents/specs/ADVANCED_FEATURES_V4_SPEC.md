# Architectural Specification: Advanced AI & Event-Driven E-Commerce Features (V4)

- **Document ID**: SPEC-2026-V4-001
- **Status**: APPROVED
- **Date**: 2026-11-02
- **Governance**: Spec-First (`.agents/GOVERNANCE.md`)
- **Target Stack**: Java 21 (Virtual Threads), Spring Boot 3.3.5, Apache Kafka, MongoDB Atlas Vector Search, Redis, Google Gemini API, Next.js 14 (App Router)

---

## 1. Pre-requisite: RAG Consolidation (Single Source of Truth)
- **Canonical Service**: `rag-service` (Port `8092`, package `com.company.ragservice.*`) is the Single Source of Truth for:
  - Vector indexing (`CatalogIndexingService`)
  - MongoDB Atlas `$vectorSearch` & hybrid reranking (`VectorSearchRepository`)
  - Gemini LLM generation, function calling, comparative verdicts, review summarization, and vision extraction (`GeminiGenerationService`, `RagOrchestrationService`)
- **Deduplication**:
  - Remove duplicate `com.company.recommendationloyaltyservice.rag.*` package from `recommendation-loyalty-service`.
  - `RecommendationService` in `recommendation-loyalty-service` consumes `rag-service` over HTTP REST (`/api/v1/rag/query`) to enrich Redis co-purchase recommendations with vector similarity matches.
  - `api-gateway` routes `/api/v1/rag/**` to `rag-service` (`http://rag-service:8092` / `http://localhost:8092`).

---

## 2. Feature 1: Agentic RAG Actions (Gemini Function Calling / Tools)
- **Involved Services**: `rag-service`, `cart-wishlist-service`, `order-service`, `shipping-delivery-service`, `web-client`
- **Tools Supported in `rag-service`**:
  1. `addToCartTool(sku, quantity)` -> Calls `PUT /api/v1/cart/items` on `cart-wishlist-service`.
  2. `checkOrderStatusTool(orderId)` -> Queries `GET /api/v1/orders/{orderId}` on `order-service` and `GET /api/v1/shipping/order/{orderId}` on `shipping-delivery-service`.
  3. `validateBestCouponTool(cartTotal)` -> Evaluates active coupons against `POST /api/v1/orders/coupons/validate` on `order-service` and returns the highest-saving coupon.
- **Contract Changes**:
  - `RagQueryResponse` includes `List<ExecutedActionDto> executedActions`.
- **Frontend (`RagAssistantDrawer.tsx`)**:
  - Renders visual Action Chips for each executed tool action and synchronizes `CartDrawer.tsx` state via `localStorage` and `cart-updated` events.

---

## 3. Feature 2: Hybrid Search & Pre-Filtering Reranking
- **Involved Services**: `rag-service`, `inventory-service`, `common-events`
- **Event Sync**:
  - `CatalogSyncKafkaConsumer` in `rag-service` listens to `StockReservedEvent`, `StockReleasedEvent` (`inventory-events`), and `ProductRatingUpdatedEvent` (`product-rating-updated-topic` / `review-events`).
  - Updates `inStock`, `availableQuantity`, and `averageRating` on `CatalogVectorDocument`.
- **Query Filters (`RagQueryRequest`)**:
  - `maxPrice` (`Double`), `minRating` (`Double`), `category` (`String`), `onlyInStock` (`Boolean`).
- **MongoDB Atlas `$vectorSearch` + Reranking (`VectorSearchRepository`)**:
  - Pre-filters by `inStock`, `price <= maxPrice`, `category`, and `averageRating >= minRating`.
  - Reranks candidates using weighted score: `0.75 * vectorSearchScore + 0.25 * (averageRating / 5.0)`.

---

## 4. Feature 3: AI Verified Review Summarizer
- **Involved Services**: `review-rating-service`, `rag-service`, `web-client`
- **Backend Flow**:
  - When a verified buyer review is created in `ReviewService.java` and `ProductRatingUpdatedEvent` is published, an asynchronous task aggregates verified reviews from `ProductReviewRepository`.
  - Generates structured summary (`aiSummary`, `prosList`, `consList`) via `rag-service` / Gemini API.
  - Persists in MongoDB (`product_review_ai_summaries`) and caches in Redis (`product_reviews:ai_summary:{sku}`).
  - Endpoint: `GET /api/v1/reviews/{sku}/summary`.
- **Frontend**:
  - `ProductQuickViewModal.tsx` displays the "סיכום בינה מלאכותית (קונים מאומתים)" block with pros and cons lists.

---

## 5. Feature 4: Abandoned Cart Recovery & Dynamic Coupon
- **Involved Services**: `common-events`, `cart-wishlist-service`, `order-service`, `notification-service`, `web-client`
- **Event Flow**:
  1. `CartAbandonedEvent` (`userId`, `items`, `totalAmount`, `timestamp`) in `common-events`.
  2. `CartService` scheduled task (and manual trigger endpoint `POST /api/v1/cart/abandoned/trigger`) detects uncompleted saved carts in `SavedCartRepository` and publishes `CartAbandonedEvent` to `cart-events`.
  3. `CouponService` in `order-service` consumes `CartAbandonedEvent`, creates a 30-minute personalized coupon in `CouponRepository`, and publishes `NotificationSentEvent` to `notification-events`.
  4. `NotificationKafkaConsumer` & `SseNotificationService` in `notification-service` push an `ABANDONED_CART_COUPON` SSE event to the active client stream.
- **Frontend**:
  - `useNotificationStream.ts` and `NotificationToast.tsx` render a "החל קופון בסל" button that copies and auto-applies the dynamic coupon in `/cart`.

---

## 6. Feature 5: Smart Product Comparison AI Verdict
- **Involved Services**: `rag-service`, `web-client`
- **Endpoint**: `POST /api/v1/rag/compare` accepting `skus` (`List<String>`) and `userUseCase` (`String`).
- **Logic**: Fetches full product specs from `CatalogVectorRepository` and generates a structured Gemini verdict containing `recommendedSku`, `verdictSummary`, `categoryWinners`, and `tradeOffs`.
- **Frontend**: `ProductComparisonModal.tsx` includes a use-case selector ("למה המוצר ישמש אותך?") and renders the AI comparative analysis below the spec table.

---

## 7. Feature 6: Multimodal Command Palette (Voice & Visual Search)
- **Involved Services**: `rag-service`, `api-gateway`, `web-client`
- **Endpoint**: `POST /api/v1/rag/multimodal-search` accepting Base64/Multipart image + optional text query.
- **Logic**: Uses Gemini Vision in `GeminiGenerationService` to extract product description & technical features from the image, embeds them via `EmbeddingService`, and queries `VectorSearchRepository`.
- **Frontend**: `CommandPalette.tsx` and `CatalogFilterBar.tsx` include Web Speech API voice dictation (Hebrew/English) and drag-and-drop/upload image search.
