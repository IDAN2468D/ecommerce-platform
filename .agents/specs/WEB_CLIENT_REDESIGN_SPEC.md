# Architectural Specification: E-Commerce Storefront Redesign & Consumer Focus (`web-client`)

- **Document ID**: SPEC-2026-STORE-002
- **Status**: APPROVED & IN-PROGRESS
- **Date**: 2026-11-01
- **Target Stack**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons, Liquid Glass 4.0 Dark UI, BiDi / Hebrew RTL First
- **Governance**: Spec-First (`.agents/GOVERNANCE.md`)

---

## 1. Product Requirements & Scope Boundaries

### 1.1 Objective
Transform `web-client` into a dedicated, high-conversion, consumer-facing E-Commerce experience. Eliminate all internal dev tooling, infrastructure jargon, and developer panels. Expose only authentic store features: Catalog, Inventory, Search & RAG Assistant, Loyalty Club, Cart, Checkout, Order Tracking, and Customer Profile.

### 1.2 In-Scope (End-Consumer Experience)
1. **Product Catalog & Live Inventory**:
   - Modern grid of products with high-res imagery, badges, categories, dynamic pricing (₪ ILS / $ USD), and live stock status (`inventory-service`).
2. **AI Shopping Assistant & Natural Language Search (RAG)**:
   - Floating AI sparkle pill, top bar integration, and search bar natural language querying grounded in `MongoDB Atlas Vector Search` with `Google Gemini 3.5 Flash Lite`.
3. **Loyalty Club & Personalized Rewards**:
   - VIP Club banner (5% Cashback), loyalty points wallet balance, points redemption during checkout (`recommendation-loyalty-service`).
4. **Cart & Streamlined Checkout**:
   - Slide-out Cart Drawer with countdown timer, free shipping meter, coupon redemption (`WELCOME10`), points discount, and one-click order placement (`order-service`, `payment-service`).
5. **Order Tracking & Digital Invoices**:
   - Customer-friendly order status timeline ("התקבלה" ➔ "באריזה" ➔ "בדרך אליך" ➔ "נמסרה"), live delivery tracking (`shipping-delivery-service`), and PDF tax invoice download.
6. **Customer Account & Security**:
   - Profile overview, address & payment preferences, points history, and recent activity (`auth-service`).

### 1.3 Out-of-Scope (Removed From Consumer UI)
- Removal of `ArchitectureDrawer.tsx` and all dev telemetry links (Grafana, Prometheus, Zipkin, Kafka UI).
- Removal of dev jargon across headers, tickers, and footers ("Kafka SAGA 5 steps", "Redis <5ms cache hit", "KRaft cluster").
- Replaced with customer value propositions: "משלוח מהיר חינם מעל ₪500", "5% קשבק לחברי מועדון", "קנייה מאובטחת SSL 256-Bit", "אחריות יבואן רשמי".

---

## 2. Design System: Liquid Glass 4.0 Dark UI & RTL

### 2.1 Color Palette & Glassmorphism
- **Primary Background**: Obsidian Slate (`#060608` to `#09090b`).
- **Surface Cards**: `bg-white/[0.04]` (Dark) / `bg-white/80` (Light), `backdrop-blur-xl`, `border border-white/10`.
- **Accents**:
  - Brand Cyan & Indigo Glow: `#2563eb`, `#4f46e5`, `#6366f1`
  - VIP Gold / Amber: `#f59e0b`, `#fbbf24` (Cashback & Points)
  - Stock Green: `#10b981` (In Stock), Rose `#ef4444` (Out of Stock)
- **RTL Standards**: Strict `dir="rtl"` alignment, responsive typography, BiDi isolation for SKUs and code tokens.

---

## 3. Modular Component Hierarchy

```
web-client/
├── app/
│   ├── layout.tsx             # Root layout with RTL, ThemeProvider, CurrencyProvider
│   ├── page.tsx               # Home / Catalog page (Consumer focused)
│   ├── cart/page.tsx          # Dedicated Cart & Checkout page
│   ├── orders/page.tsx        # Customer Order Tracking page
│   ├── profile/page.tsx       # Customer Profile & Loyalty Wallet page
│   ├── login/page.tsx         # Customer Login
│   └── register/page.tsx      # Customer Registration
├── components/
│   ├── ui/                    # Primitive Liquid Glass elements
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Badge.tsx
│   └── store/                 # Domain-driven store components
│       ├── HeaderNav.tsx      # Customer header with Logo, Search, AI, Currency, Cart, Account
│       ├── HeroBanner.tsx     # High-conversion seasonal hero banner
│       ├── ProductCard.tsx    # Customer product card with rating, stock, quick add
│       ├── CartDrawer.tsx     # Customer slide-out cart
│       ├── OrderTracker.tsx   # Visual shipment & delivery tracker
│       ├── LoyaltyBadge.tsx   # VIP Cashback and points pill
│       ├── FloatingAiButton.tsx # Ergonomic floating AI shopping assistant
│       └── RagAssistantDrawer.tsx # In-site Gemini 3.5 Flash Lite shopping assistant
└── services/
    └── api-client.ts          # Centralized typed API service for all gateway calls
```

---

## 4. API Gateway Endpoints & Routing

All client communication is proxied through `api-gateway` (Port `8080`) or local Next.js route proxies:
- Catalog & Products: `GET /api/v1/products`
- Inventory Stock: `GET /api/v1/inventory/{sku}`
- Cart: `GET /api/v1/cart`, `POST /api/v1/cart`
- Orders & Checkout: `POST /api/v1/orders`, `GET /api/v1/orders`
- Shipping & Tracking: `GET /api/v1/shipping/{orderId}`
- Loyalty & Cashback: `GET /api/v1/loyalty/wallet/{customerId}`
- AI Shopping Assistant: `POST /api/v1/rag/query`, `GET /api/v1/rag/stream`

---

## 5. Implementation Phases
1. **Phase 1: Audit & Cleanup** - Remove `ArchitectureDrawer`, dev tickers, and dev telemetry links.
2. **Phase 2: Design System & Header/Footer** - Implement Liquid Glass 4.0 Dark UI, store navigation, and e-commerce trust badges.
3. **Phase 3: Core Storefront (Home, Catalog & RAG)** - Consumer hero banner, category filters, live inventory cards, and inline RAG search.
4. **Phase 4: Cart, Checkout & Customer Portal** - Order tracker without technical SAGA jargon, loyalty points balance, invoice download.
5. **Phase 5: Build Verification** - Execute `cmd /c npm run build`, verify gateway integration, and update `STATE.md`.
