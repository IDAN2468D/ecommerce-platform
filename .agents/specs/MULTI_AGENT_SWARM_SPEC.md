# Specification: Python Multi-Agent Swarm Service (`agent-swarm-service`)

- **Document ID**: SPEC-2026-V5-PYTHON-SWARM
- **Status**: APPROVED
- **Governance**: Spec-First (`.agents/GOVERNANCE.md`)
- **Runtime**: Python 3.12+ (`FastAPI`, `AsyncIO`, `Uvicorn`, `Pydantic`)
- **Default Port**: `8093`
- **Gateway Route**: `/api/v1/agents/**`
- **Creation Date**: 2026-11-03

---

## 1. Executive Summary & Objective

In order to scale conversational intelligence, autonomous operations, and complex multi-domain user inquiries beyond monolithic RAG pipelines, this specification introduces a dedicated Python Multi-Agent Swarm microservice (`agent-swarm-service`).

The swarm utilizes a **Supervisor-Worker Agentic Topology** where an orchestrator agent (`SupervisorRouterAgent`) decomposes complex shopper requests, delegates sub-tasks concurrently across specialized domain agents via `asyncio.gather`, gathers citations and action payloads, and synthesizes a grounded Hebrew response with real-time SSE streaming.

---

## 2. Agent Swarm Architecture & Roles

```
                                 ┌─────────────────────────┐
                                 │   Next.js Web Client    │
                                 │ (RagAssistantDrawer.tsx)│
                                 └────────────┬────────────┘
                                              │ HTTP / SSE
                                              ▼
                                 ┌─────────────────────────┐
                                 │  Spring Cloud Gateway   │
                                 │        (:8080)          │
                                 └────────────┬────────────┘
                                              │ /api/v1/agents/**
                                              ▼
                             ┌─────────────────────────────────┐
                             │    SupervisorRouterAgent        │
                             │ (agent-swarm-service :8093)     │
                             └────────────────┬────────────────┘
                                              │
                     ┌────────────────────────┼────────────────────────┬────────────────────────┐
                     ▼                        ▼                        ▼                        ▼
         ┌───────────────────────┐┌───────────────────────┐┌───────────────────────┐┌───────────────────────┐
         │ CatalogDiscoveryAgent ││ CartPricingLoyalty    ││ OrderLogisticsAgent   ││ KafkaAutonomousOps   │
         │ - Hybrid Vector Search││ - Auto Add-to-Cart    ││ - Order Tracking      ││ - Abandoned Cart Ops │
         │ - Live Stock Checks   ││ - Best Coupon Engine  ││ - DHL Live Timeline   ││ - Low Stock Alerts   │
         │ - AI Verified Reviews ││ - VIP Cashback Wallet ││ - Drive/Calendar MCP  ││ - Event Telemetry    │
         └───────────┬───────────┘└───────────┬───────────┘└───────────┬───────────┘└───────────┬───────────┘
                     │                        │                        │                        │
         ┌───────────┴───────────┐┌───────────┴───────────┐┌───────────┴───────────┐┌───────────┴───────────┐
         │ rag-service (:8092)   ││ cart-service (:8088)  ││ order-service (:8081) ││ Kafka Message Bus     │
         │ inventory (:8082)     ││ order-coupons (:8081) ││ shipping (:8086)      ││ notification (:8085)  │
         │ review-service (:8087)││ loyalty-service(:8089)││ workspace-mcp (:8091) ││                       │
         └───────────────────────┘└───────────────────────┘└───────────────────────┘└───────────────────────┘
```

### 2.1 Agent Directory & Responsibilities

1. **`SupervisorRouterAgent`**:
   - **Intent Classification**: Classifies prompt into Discovery, Cart/Pricing, Order/Logistics, Autonomous Ops, or Composite.
   - **Parallel Dispatch**: Orchestrates domain agents concurrently using `asyncio.gather`.
   - **Synthesizer**: Fuses structured findings, executed actions, and product citations into natural, engaging Hebrew.

2. **`CatalogDiscoveryAgent`**:
   - Dispatches vector retrieval & hybrid search to `rag-service` (`:8092`).
   - Cross-references real-time stock levels with `inventory-service` (`:8082`).
   - Ingests AI buyer review summaries (pros & cons) from `review-rating-service` (`:8087`).

3. **`CartPricingLoyaltyAgent`**:
   - Performs autonomous cart manipulation (`addToCartTool`) against `cart-wishlist-service` (`:8088`).
   - Validates coupon codes (`VIP20`, `SUPER500`, `WELCOME10`) with `order-service` (`:8081`).
   - Retrieves VIP club tier, point balance, and cashback rewards from `recommendation-loyalty-service` (`:8089`).

4. **`OrderLogisticsWorkspaceAgent`**:
   - Queries order history and itemized receipts from `order-service` (`:8081`).
   - Retrieves live delivery milestones and carrier statuses (`DHL Express Israel`) from `shipping-delivery-service` (`:8086`).
   - Fetches Google Drive invoice PDF link and Google Calendar delivery appointment from `workspace-integration-service` (`:8091`) / `google-workspace-mcp` (`:8000`).

5. **`KafkaAutonomousOpsAgent`**:
   - Monitors Kafka event streams (`inventory-events`, `cart-events`, `order-events`).
   - Triggers automated alerts (low stock warning, abandoned cart discount generation) and publishes notifications via `notification-service` (`:8085`).

---

## 3. Public API Contracts

### 3.1 `POST /api/v1/agents/swarm/query`
- **Request Body**:
```json
{
  "query": "איזה אוזניות סוני מומלצות, תוסיף לי לסל ותבדוק איזה קופון הכי שווה",
  "conversationId": "conv_client_session",
  "customerId": "usr_demo",
  "category": "AUDIO",
  "cartTotal": 1499.00,
  "topK": 4
}
```

- **Response Body**:
```json
{
  "query": "איזה אוזניות סוני מומלצות...",
  "answer": "מצאתי עבורך את אוזניות Sony WH-1000XM5...",
  "agentsInvolved": [
    "SupervisorRouterAgent",
    "CatalogDiscoveryAgent",
    "CartPricingLoyaltyAgent"
  ],
  "agentSteps": [
    {
      "agentName": "SupervisorRouterAgent",
      "action": "INTENT_CLASSIFICATION",
      "status": "COMPLETED",
      "details": "Identified composite intent: [CATALOG_DISCOVERY, CART_ACTION, COUPON_OPTIMIZATION]"
    }
  ],
  "citations": [
    {
      "skuCode": "AUDIO-SONY-XM5",
      "title": "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
      "price": 1499.00,
      "relevanceScore": 0.94,
      "category": "AUDIO",
      "inStock": true,
      "snippet": "אוזניות ביטול רעשים מובילות עם 30 שעות סוללה"
    }
  ],
  "executedActions": [
    {
      "toolName": "addToCartTool",
      "status": "SUCCESS",
      "summary": "המוצר Sony WH-1000XM5 נוסף בהצלחה לסל הקניות",
      "payload": {
        "skuCode": "AUDIO-SONY-XM5",
        "productName": "Sony WH-1000XM5",
        "unitPrice": 1499.00,
        "quantity": 1
      }
    },
    {
      "toolName": "validateBestCouponTool",
      "status": "SUCCESS",
      "summary": "נמצא קופון פעיל VIP20 המעניק 20% הנחה",
      "payload": {
        "bestCouponCode": "VIP20",
        "discountPercentage": 20.0
      }
    }
  ],
  "model": "swarm-supervisor-gemini-2.5-flash",
  "latencyMs": 420,
  "confidenceScore": 0.96
}
```

### 3.2 `GET /api/v1/agents/swarm/stream` (SSE)
Streams events:
- `event: agent_step` -> JSON containing agent progress
- `event: citation` -> JSON containing identified products
- `event: executed_action` -> JSON containing performed tool actions
- `event: token` -> Streamed text chunk of the Hebrew answer
- `event: complete` -> Final consolidated JSON response

---

## 4. Verification & Testing Standards

- **Self-Test Mode**: `python ecommerce_agent_swarm.py --self-test`
  - Validates all 5 agents in isolation and in collaboration.
  - Zero external dependency requirement during self-test (internal resilience fallbacks).
  - Asserts HTTP status codes, JSON schema conformity, and Hebrew synthesis.
