# Task Implementation Plan: Track F (V6.0) Expanded 9-Agent Swarm & 4 Enterprise Microservices

## Overview
Implement the full architectural expansion specified in `SPEC-2026-V6-SWARM-AND-SERVICES`:
1. Expand `common-events` with 6 new Kafka event schemas.
2. Upgrade Python `agent-swarm-service` (:8093) from 5 to 9 agents with 4 new tools and 10 self-tests.
3. Implement `dynamic-pricing-service` (:8095).
4. Implement `rma-returns-service` (:8094).
5. Implement `fraud-risk-service` (:8096).
6. Implement `merchant-analytics-service` (:8097).
7. Configure Spring Cloud Gateway (`api-gateway`) with Routes #13 - #16.
8. Wire root `pom.xml` and `docker-compose.yml`.
9. Create Next.js 14 frontend components (`Liquid Glass 4.0 Pro RTL`):
   - `PriceHistoryAutoBuySection.tsx` (< 180 LOC)
   - `VisualRmaReturnModal.tsx` (< 210 LOC)
   - `SmartBundleCard.tsx` (< 160 LOC)
   - `SwarmAgentBadges.tsx` (< 140 LOC)
   and integrate them into `ProductQuickViewModal.tsx`, `app/orders/page.tsx`, and `RagAssistantDrawer.tsx`.
10. Run and verify all unit tests, self-tests, and frontend builds.
