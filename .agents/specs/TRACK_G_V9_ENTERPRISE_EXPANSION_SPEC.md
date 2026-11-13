# Architectural Specification: Track G (V9.0) — 25-Agent Autonomous Swarm & 8 Next-Gen Enterprise Microservices

- **Document ID**: `SPEC-2026-V9-ENTERPRISE-SWARM-8-SERVICES`
- **Status**: `APPROVED FOR IMPLEMENTATION`
- **Date**: `2026-11-13`
- **Governance**: Spec-First (`.agents/GOVERNANCE.md`)
- **Target Stack**: Java 21 LTS (`Virtual Threads`), Spring Boot 3.3.5, Spring Cloud Gateway, Python 3.11+ (`FastAPI`, `AsyncIO`, `HTTPX`), Apache Kafka (KRaft), MongoDB Atlas 7.0, Redis 7.0, Google Gemini AI, Next.js 14 App Router (`Liquid Glass 4.0 Pro RTL`)

## 1. Executive Summary

Track G (V9.0) expands the distributed e-commerce platform from **25 to 33 microservices** (adding ports `8107`–`8114`) and upgrades `agent-swarm-service` (`Port 8093`) from **17 to 25 specialized autonomous AI agents**:

| Route # | Service Name | Port | Gateway Path | Primary MongoDB Collection | Coupled Swarm Agent (`:8093`) |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `#26` | `rental-leasing-service` | `8107` | `/api/v1/rentals/**` | `equipment_rental_contracts` | `RentalLeasingAdvisorAgent` |
| `#27` | `customs-tax-duty-service` | `8108` | `/api/v1/customs/**` | `customs_duty_assessments` | `CustomsDutyOptimizerAgent` |
| `#28` | `custom-configurator-service` | `8109` | `/api/v1/configurator/**` | `custom_rig_builds` | `SystemArchitectConfiguratorAgent` |
| `#29` | `omnifillment-locker-service` | `8110` | `/api/v1/fulfillment/**` | `smart_locker_reservations` | `OmnichannelFulfillmentAgent` |
| `#30` | `field-installation-service` | `8111` | `/api/v1/installations/**` | `field_installation_bookings` | `TechInstallationSchedulerAgent` |
| `#31` | `carbon-sustainability-service` | `8112` | `/api/v1/sustainability/**` | `carbon_footprint_ledgers` | `EcoSustainabilityAdvisorAgent` |
| `#32` | `digital-wallet-giftcard-service` | `8113` | `/api/v1/wallet/**` | `multi_currency_wallets` | `WalletOptimizationAgent` |
| `#33` | `creator-affiliate-live-service` | `8114` | `/api/v1/creators/**` | `creator_live_campaigns` | `CreatorMatchAffiliateAgent` |

## 2. Domain Contracts & Event Flows

1. **`rental-leasing-service` (`:8107`)**:
   - `GET /api/v1/rentals` & `POST /api/v1/rentals`: Calculates weekly/monthly leasing fee, refundable security deposit (`20%`), and `Rent-to-Own` buyout credit (`85%` of rental fees credited toward purchase). Emits `rental-leasing-events`.
2. **`customs-tax-duty-service` (`:8108`)**:
   - `GET /api/v1/customs` & `POST /api/v1/customs/calculate`: Evaluates CIF value in USD/ILS, enforces the `$75 USD` Israeli VAT exemption threshold, calculates `18%` VAT and category customs duty, and recommends legal parcel splitting. Emits `customs-duty-events`.
3. **`custom-configurator-service` (`:8109`)**:
   - `GET /api/v1/configurator` & `POST /api/v1/configurator/build`: Validates multi-SKU custom rig builds, verifies physical/power compatibility (`100%` score), calculates bundle assembly discount (`12%`), and emits `custom-configurator-events`.
4. **`omnifillment-locker-service` (`:8110`)**:
   - `GET /api/v1/fulfillment` & `POST /api/v1/fulfillment/reserve-locker`: Routes orders across regional hubs (Tel Aviv, Haifa, Jerusalem, Beer Sheva, and Eilat 0% VAT zone) and generates `24/7` Smart Locker `OTP + QR` unlock codes. Emits `omnifillment-locker-events`.
5. **`field-installation-service` (`:8111`)**:
   - `GET /api/v1/installations` & `POST /api/v1/installations/book`: Books certified home setup technicians synchronized with shipment arrival windows. Emits `field-installation-events`.
6. **`carbon-sustainability-service` (`:8112`)**:
   - `GET /api/v1/sustainability` & `POST /api/v1/sustainability/assess`: Computes `CO2e (kg)` footprint, assigns `Eco-Score (A+ to E)`, and awards `VIP Eco-Points` for consolidated green shipping. Emits `carbon-sustainability-events`.
7. **`digital-wallet-giftcard-service` (`:8113`)**:
   - `GET /api/v1/wallet` & `POST /api/v1/wallet/giftcard`: Manages multi-currency (`ILS/USD/EUR`) wallet balances, store credits, and cryptographic gift card issuance. Emits `digital-wallet-events`.
8. **`creator-affiliate-live-service` (`:8114`)**:
   - `GET /api/v1/creators` & `POST /api/v1/creators/campaigns`: Manages Live Shopping rooms, pinned SKU drops, creator coupon codes, and automated affiliate commission payouts. Emits `creator-affiliate-events`.
