# Architectural Specification: Track F (V6.0) — Expanded 9-Agent Swarm & 4 Enterprise Microservices

- **Document ID**: `SPEC-2026-V6-SWARM-AND-SERVICES`
- **Status**: `APPROVED FOR IMPLEMENTATION`
- **Date**: `2026-11-04`
- **Governance**: Spec-First (`.agents/GOVERNANCE.md`, `.agents/specs/MULTI_AGENT_SWARM_SPEC.md`, `.agents/specs/ADVANCED_FEATURES_V4_SPEC.md`)
- **Target Stack**: Python 3.12 (`FastAPI`, `AsyncIO`, `Pydantic v2`, `HTTPX`), Java 21 LTS (`Virtual Threads`), Spring Boot 3.3.5, Spring Cloud Gateway, Apache Kafka (KRaft), MongoDB Atlas 7.0 (`$vectorSearch` & Time-Series), Redis 7.0, Google Gemini 2.5 Flash / Vision API, Next.js 14 App Router (`Liquid Glass 4.0 Pro RTL`)

## 1. Executive Summary & Industry Benchmarks

Track F (V6.0) expands the platform's conversational intelligence, transactional safety, reverse logistics, and dynamic revenue optimization by upgrading the **Python Multi-Agent Swarm (`agent-swarm-service` :8093)** from **5 to 9 specialized agents** and introducing **4 new Domain-Driven Design (DDD) Spring Boot microservices (`:8094`–`:8097`)**.

Every architectural component in this specification is modeled after verified production systems across global e-commerce leaders and cloud-native reference architectures:

| Architectural Domain | New Platform Component | Industry Benchmark & Reference Implementation | Core Capability Introduced |
| :--- | :--- | :--- | :--- |
| **Agentic Price Tracking & Auto-Buy** | `PriceWatchAutoBuyAgent` (`:8093`) + `dynamic-pricing-service` (`:8095`) | Amazon Rufus Personalized Shopping & Agentic Auto-Buy | 30-day rolling price history ledger, elasticity-based dynamic pricing, and autonomous SAGA checkout execution when a product hits a user's target price (`₪`). |
| **Autonomous Reverse Logistics (RMA)** | `ReturnsDisputeAgent` (`:8093`) + `rma-returns-service` (`:8094`) | Klarna AI Customer Service Assistant & Loop Returns RMA Automation | Instant RMA eligibility validation, Gemini Vision defect verification, automated DHL pickup scheduling in Google Calendar, and instant VIP wallet store credit with bonus incentive. |
| **AI Bundle & Setup Curation** | `VisualBundleStylistAgent` (`:8093`) | Amazon Rufus on Amazon Bedrock & Multi-Agent Systems for E-Commerce | Multi-category compatible bundle synthesis under a strict ILS (`₪`) budget constraint, cross-SKU compatibility scoring, and dynamic bundle tier discounting. |
| **Real-Time SAGA Fraud & Risk Guard** | `FraudRiskGuardAgent` (`:8093`) + `fraud-risk-service` (`:8096`) | Stripe Radar ML Fraud Detection APIs & Stripe Microservices Risk Architecture | Pre-capture SAGA risk scoring (`0–100`), Redis sliding-window velocity checks, coupon abuse prevention, and autonomous order hold/cancellation before payment capture. |
| **CQRS Merchant Telemetry & Forecasting** | `merchant-analytics-service` (`:8097`) | Shopify Sidekick Agentic Analytics & Spring Boot Kafka Analytics Service | Real-time Kafka Streams aggregation for GMV, conversion funnel, cohort LTV, and predictive stock-out depletion forecasting (`daysUntilDepletion`). |
| **Composable DDD & CQRS Backbone** | Unified Gateway (`:8080`) & Event Bus (`common-events`) | Google Cloud Online Boutique Microservices & Spring Boot CQRS Microservices | Strict schema isolation per collection, asynchronous Kafka SAGA compensation, and zero client-side database exposure. |

## 2. System Topology & Port Directory (V6.0)

| Route # | Service Name | Runtime / Framework | Internal/Host Port | Gateway Path Prefix | Primary MongoDB Collections (`ecommerce_db`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `#1` | `order-service` | Java 21 / Spring Boot 3.3.5 | `8081` | `/api/v1/orders/**` | `orders`, `coupons` |
| `#2` | `inventory-service` | Java 21 / Spring Boot 3.3.5 | `8082` | `/api/v1/inventory/**`, `/api/v1/products/**` | `inventory`, `inventory_reservations` |
| `#3` | `payment-service` | Java 21 / Spring Boot 3.3.5 | `8083` | `/api/v1/payments/**` | `payment_transactions`, `payment_refunds` |
| `#4` | `auth-service` | Java 21 / Spring Boot 3.3.5 | `8084` | `/api/v1/auth/**` | `users` |
| `#5` | `notification-service` | Java 21 / Spring Boot 3.3.5 | `8085` | `/api/v1/notifications/**` | Stateless SSE + Redis Pub/Sub |
| `#6` | `shipping-delivery-service` | Java 21 / Spring Boot 3.3.5 | `8086` | `/api/v1/shipping/**` | `shipments` |
| `#7` | `review-rating-service` | Java 21 / Spring Boot 3.3.5 | `8087` | `/api/v1/reviews/**` | `product_reviews`, `product_review_ai_summaries` |
| `#8` | `cart-wishlist-service` | Java 21 / Spring Boot 3.3.5 | `8088` | `/api/v1/cart/**`, `/api/v1/wishlist/**` | `saved_carts`, `wishlists` |
| `#9` | `recommendation-loyalty-service` | Java 21 / Spring Boot 3.3.5 | `8089` | `/api/v1/recommendations/**`, `/api/v1/loyalty/**` | `loyalty_wallets`, `loyalty_ledger` |
| `#10` | `workspace-integration-service` | Java 21 / Spring Boot 3.3.5 | `8091` | `/api/v1/workspace/**` | `workspace_links` |
| `#11` | `rag-service` | Java 21 / Spring Boot 3.3.5 | `8092` | `/api/v1/rag/**` | `catalog_vectors` |
| `#12` | `agent-swarm-service` | Python 3.12 / FastAPI | `8093` | `/api/v1/agents/**` | Stateless Orchestrator (HTTPX + SSE) |
| **`#13`** | **`rma-returns-service`** | **Java 21 / Spring Boot 3.3.5** | **`8094`** | **`/api/v1/returns/**`** | **`return_requests`, `return_inspections`** |
| **`#14`** | **`dynamic-pricing-service`** | **Java 21 / Spring Boot 3.3.5** | **`8095`** | **`/api/v1/pricing/**`** | **`price_history_ledgers`, `price_watch_rules`** |
| **`#15`** | **`fraud-risk-service`** | **Java 21 / Spring Boot 3.3.5** | **`8096`** | **`/api/v1/fraud/**`** | **`fraud_assessments`, `fraud_audit_logs`** |
| **`#16`** | **`merchant-analytics-service`** | **Java 21 / Spring Boot 3.3.5** | **`8097`** | **`/api/v1/analytics/**`** | **`analytics_daily_kpis`, `sku_depletion_forecasts`** |
