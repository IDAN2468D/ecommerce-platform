# Project State & Execution Tracking: E-Commerce Redesign & Backend RAG Consolidation

- **Governance**: Spec-First (`.agents/specs/WEB_CLIENT_REDESIGN_SPEC.md`, `.agents/specs/RECOMMENDATION_RAG_INTEGRATION_SPEC.md`, `PRD-2026-UI-REDESIGN-V3`).
- **Team Lead Approval**: Approved by Idan.
- **Current Active Focus**: Track G Verified (Autonomous B2B Negotiation, A2A Commerce Gateway, DummyJSON Fashion Catalog & Next-Gen Liquid Glass 4.0 Pro Storefront).
- **Last Updated**: 2026-11-11

---

## 🚀 Track C: UI/UX Redesign V3 (Liquid Glass 4.0 Pro RTL & Modularity)

### Sprint 1: Design System, Dual-Theme Tokens & Dead Code Cleanup
- [x] 1.1 מחיקת קבצים יתומים מ-`web-client/components/`: `ArchitectureDrawer.tsx`, `SagaTracker.tsx`, `SagaTracker.figma.tsx`, `ProductCard.figma.tsx`, `AuthModal.tsx`.
- [x] 1.2 עדכון `web-client/app/globals.css` עם משתני ה-CSS הסמנטיים (`--bg-canvas`, `--bg-card`, `--border-glass`, `--text-primary`) ל-Light ול-Dark Mode, מחלקות `.liquid-card`, `.electric-border-card` ו-`.receipt-paper-edge`.
- [x] 1.3 בדיקת תקינות ועץ קבצים נקי.

### Sprint 2: Storefront Modularization & Dual-Theme Product Cards
- [x] 2.1 יצירת `components/store/CatalogFilterBar.tsx` (<240 LOC).
- [x] 2.2 יצירת `components/store/ProductQuickViewModal.tsx` (<240 LOC) כמופע יחיד ב-`app/page.tsx`.
- [x] 2.3 יצירת `components/store/ProductComparisonModal.tsx` (<200 LOC).
- [x] 2.4 שדרוג `ProductCard.tsx` (<220 LOC) לתמיכה מלאה ב-Light/Dark Mode ואפקט `electric-border-card`.
- [x] 2.5 מודולריזציה של `app/page.tsx` (<220 LOC).

### Sprint 3: Pure Consumer Cart, Checkout & Interactive Digital Receipt
- [x] 3.1 ניקוי `components/CartDrawer.tsx` מז'רגון Redis והתאמה ל-Light/Dark Mode.
- [x] 3.2 יצירת `components/store/CheckoutSummaryCard.tsx` (<230 LOC) ללא מונחי SAGA/Kafka.
- [x] 3.3 שדרוג `app/cart/page.tsx` (<240 LOC).
- [x] 3.4 יצירת `components/store/DigitalReceiptModal.tsx` (<200 LOC) עם אפקט תלישת קבלה תרמית.
- [x] 3.5 שדרוג `app/orders/page.tsx` (<240 LOC) עם כפתור קבלה דיגיטלית וניקוי מונחי Backend.

### Sprint 4: VIP Profile, Auth Polish & Verification
- [x] 4.1 יצירת `components/store/VipMembershipCard.tsx` (<200 LOC) עם כרטיס מועדון הולוגרפי.
- [x] 4.2 שדרוג `app/profile/page.tsx` (<220 LOC) לתמיכה מלאה ב-Light/Dark Mode.
- [x] 4.3 שדרוג `app/login/page.tsx`, `app/register/page.tsx` ו-`RagAssistantDrawer.tsx`.
- [x] 4.4 אימות `npm run build` מקצה לקצה ופריסה במכולה.

### Sprint 5: Redesigned Auth Experience (Login, Register & Google Sign-In Integration)
- [x] 5.1 יצירת `web-client/app/api/auth/google/route.ts` לטיפול באימות Google והנפקת JWT חוקי
- [x] 5.2 יצירת `web-client/components/store/GoogleSignInModal.tsx` לחלון בחירת חשבון Google מעוצב ואינטראקטיבי
- [x] 5.3 עיצוב מחדש של `web-client/app/login/page.tsx` בשפת Liquid Glass 4.0 Pro (Light/Dark Mode, Password Toggle, Demo VIP Login)
- [x] 5.4 עיצוב מחדש של `web-client/app/register/page.tsx` בשפת Liquid Glass 4.0 Pro עם הצטרפות מיידית ל-VIP Platinum
- [x] 5.5 אימות `npm run build`, עדכון מכולת Docker וסנכרון Git

---

## 🚦 Track D: RAG Consolidation & 6 Advanced End-to-End AI/Event Features (V4.0)
- [x] D.0 איחוד מנוע ה-RAG ל-`rag-service` כמקור האמת היחיד (Single Source of Truth), הסרת החבילה הכפולה מ-`recommendation-loyalty-service` וחיווט HTTP בין השירותים.
- [x] D.1 סוכן קניות אוטונומי (Agentic RAG Actions) עם Gemini Function Calling (`addToCartTool`, `checkOrderStatusTool`, `validateBestCouponTool`) ורכיבי Action Chips ב-`RagAssistantDrawer.tsx`.
- [x] D.2 חיפוש היברידי חכם, סנכרון Kafka (`StockReservedEvent`, `StockReleasedEvent`, `ProductRatingUpdatedEvent`) ודירוג מחדש (`VectorSearchRepository.java`).
- [x] D.3 מחולל סיכומי ביקורות מאומתות מבוסס AI (`GET /api/v1/reviews/{sku}/summary`), קאשינג ב-Redis ו-MongoDB, ותצוגת יתרונות/חסרונות ב-`ProductQuickViewModal.tsx`.
- [x] D.4 מנגנון התאוששות מסל קניות נטוש (`CartAbandonedEvent` -> קופון דינמי ל-30 דקות ב-`CouponService.java` -> התראת SSE חיה ב-`NotificationToast.tsx` והחלה אוטומטית ב-`app/cart/page.tsx`).
- [x] D.5 השוואת מוצרים חכמה עם פסק דין של AI (`POST /api/v1/rag/compare`) ובחירת תרחיש שימוש ב-`ProductComparisonModal.tsx`.
- [x] D.6 חיפוש קולי וחיפוש ויזואלי רב-מודאלי (`POST /api/v1/rag/multimodal-search` עם Gemini Vision + Web Speech API ב-`CommandPalette.tsx` ו-`CatalogFilterBar.tsx`).

---

## 🤖 Track E: Python Multi-Agent Swarm Service (V5.0)
- [x] E.0 יצירת מפרט ספק ארכיטקטוני `.agents/specs/MULTI_AGENT_SWARM_SPEC.md` ותוכנית יישום `.agents/tasks/MULTI_AGENT_SWARM_PLAN.md`.
- [x] E.1 יצירת מיקרו-שירות Python ייעודי `agent-swarm-service` עם `Dockerfile`, `requirements.txt` ו-`ecommerce_agent_swarm.py` (FastAPI בפורט `8093`).
- [x] E.2 מימוש 5 סוכנים אוטונומיים: `SupervisorRouterAgent`, `CatalogDiscoveryAgent`, `CartPricingLoyaltyAgent`, `OrderLogisticsWorkspaceAgent` ו-`KafkaAutonomousOpsAgent`.
- [x] E.3 חיווט נתיב 12 ב-`api-gateway/src/main/resources/application.yml` (`/api/v1/agents/**`) והוספת השירות ל-`docker-compose.yml`.
- [x] E.4 אינטגרציה ב-Next.js: הוספת נתיבי פרוקסי `/api/agents/swarm/query` ו-`/api/agents/swarm/stream` ועידכון `RagAssistantDrawer.tsx` עם תגיות סוכנים פעילות.
- [x] E.5 אימות מלא מקצה לקצה: בדיקת הרצה עצמית של 5 הסוכנים (`python agent-swarm-service/ecommerce_agent_swarm.py --self-test` 100% Green) ובניית `npm run build` ללא שגיאות.

---

## ⚡ Track F: Full-Stack Enterprise Extensions via Native Swarm (V6.0)
- [x] F.1 טלמטריה עסקית וחיזוי התרוקנות מלאי AI (`merchant-analytics-service`):
  - יצירת נתיבי פרוקסי Next.js: `/api/analytics/summary`, `/api/analytics/inventory-forecast`, `/api/analytics/ai-copilot`.
  - רכיב `MerchantAnalyticsDashboard.tsx` בעיצוב Liquid Glass 4.0 Pro RTL עם כרטיסי KPI חיים (GMV, AOV, המרה, מניעת הונאות ו-VIP), טבלת שריפת מלאי עם התראות דחיפות (CRITICAL/URGENT/SAFE), והדמיית פקודת רכש (PO).
  - סייען שיחה אינטראקטיבי `AI Merchant Copilot` עם תובנות תפעוליות בעברית ואנגלית ושאלות מובנות מראש.
- [x] F.2 מרכז מודיעין ואבטחת עסקאות `SAGA Pre-Capture Fraud Guard` (`fraud-risk-service`):
  - יצירת נתיבי פרוקסי Next.js: `/api/fraud/alerts`, `/api/fraud/assess`, `/api/fraud/order/[orderId]`.
  - רכיב `FraudGuardDashboard.tsx` עם מד התפלגות סיכון (0-100), ניטור חריגות מהירות (Velocity Anomaly) מבוסס חלון זמן ב-Redis, סימולטור הערכת הונאות טרום-חיוב בזמן אמת, ופיד התראות אבטחה חי.
- [x] F.3 ניהול משיכות כספי ספקים ומרכז ספקים מרובים (`marketplace-vendor-service`):
  - יצירת נתיבי פרוקסי Next.js: `/api/marketplace/vendors`, `/api/marketplace/vendors/[id]/payout`.
  - שדרוג `web-client/app/marketplace/page.tsx` לשימוש בנתיבים יחסיים, מנגנון משיכת רווחים מהיר עם פילוח בנקאי וקבלה דיגיטלית, וסולם עמלות שקוף.
- [x] F.4 שאלון מותאם אישית לאיתור מתנות וסטיילינג `AI Gift Finder`:
  - רכיב `AiGiftFinderModal.tsx` עם אשף 4 שלבים (נמען, תקציב, אירוע, סגנון), מנוע התאמה חכם, הנחות באנדל מיוחדות ויצירת קמפיין מימון חברתי בלחיצה אחת.
  - שילוב ב-`web-client/app/gifting/page.tsx` בכפתור בולט ב-Hero Section.
- [x] F.5 איחוד מרכז הבקרה הראשי (`web-client/app/admin/page.tsx`):
  - שילוב מחליף טאבים ראשי (3 טאבים מלאים: בקרה ו-SAGA, אנליטיקה ותחזית מלאי AI, ומרכז הגנת הונאות).
- [x] F.6 אימות מקצה לקצה: הרצת `npm run build` מלאה (29 נתיבים ירוקים 100% ללא שגיאות).

---

## 💎 Track G: Autonomous B2B Wholesale, A2A Commerce & Next-Gen Fashion Storefront (V7.0)
- [x] G.1 קטלוג אופנה, ביגוד ואקססוריז מועשר (DummyJSON Fashion Integration):
  - יצירת `scripts/seed_fashion_products.py` ו-`scripts/fashion_products.json` עם 49 מוצרים מועשרים מ-10 קטגוריות בינלאומיות (`mens-shirts`, `womens-dresses`, `tops`, `sunglasses`, `mens-shoes`, `womens-shoes`, `mens-watches`, `womens-watches`, `womens-bags`, `womens-jewellery`).
  - העשרת כל המוצרים בכותרות ותיאורים קולחים בעברית, תמחור שקלי מותאם שוק ישראלי (₪119 - ₪49,900), מלאי ריאליסטי ומפרטי עיצוב Liquid Glass 4.0 Pro (`glowColor`, `backdropBlur`, `glassMaterial`, `accentGradient`, `theme`, `elevation`).
  - יצירת `web-client/lib/products.ts` ועדכון `web-client/lib/fallback-catalog.ts` עם 227 פריטים המחולקים לקטגוריות `CLOTHING` (24), `ACCESSORIES` (29), `FASHION` (10) ומוצרי טכנולוגיה.
  - עדכון `app/api/products/route.ts`, `app/page.tsx` ו-`components/store/ProductCard.tsx` לסינון קטגוריות מתקדם והצגת תגיות מפרט זכוכית.
- [x] G.2 סוכני בינה מלאכותית אוטונומיים חדשים ב-`agent-swarm-service`:
  - `B2BQuoteNegotiationAgent`: אינטגרציה עם `B2B_QUOTE_SERVICE_URL` (:8106), חישוב מדרגות מחיר והנחות כמויות (10%-30%), חיתום אשראי תאגידי בתנאי Net-30/Net-60, והפקת חוזה Google Docs/Drive PDF חתום דיגיטלית ב-SHA-256.
  - `AgenticCommerceGatewayAgent`: מימוש פרוטוקול A2A (Agent-to-Agent v2.5), הנפקת טוקני הרשאה תחומי יכולות (Bearer Capability Tokens, TTL 3600s), וסליקה אטומית של עסקאות רכש אוטונומיות בין סוכנים.
  - חיווט ב-`SupervisorRouterAgent`: סיווג כוונות ל-`B2B_QUOTE_NEGOTIATION` ו-`AGENTIC_COMMERCE_GATEWAY`, תכנון DAG, והוספת נתיבי REST ייעודיים (`/api/v1/agents/b2b/quote`, `/api/v1/agents/a2a/transact`), הרחבת מטריצת הבריאות ל-19 סוכנים פעילים.
  - הרחבת `run_self_test()` ל-24 מבחנים מקיפים (`100% green`).
- [x] G.3 שדרוגי UI/UX ופורטלים חדשים ב-`web-client` (Liquid Glass 4.0 Pro RTL):
  - פורטל B2B ו-RFQ מלא בנתיב `web-client/app/b2b/page.tsx`: מחשבון הנחת כמויות אינטראקטיבי (10%-38%), טופס הגשת בקשת אשראי וחיתום תאגידי, מחולל הצעות מחיר מיידי ב-AI, מודל תצוגה מקדימה והדפסת PDF רשמי, וספר הצעות מחיר היסטורי.
  - רכיב `LiveAuctionGroupBuyModal.tsx`: מכרזים חיים עם ספירה לאחור, מנגנון Auto-Bid Snipe עם קביעת תקרת מחיר, פיד הצעות מחיר זורם בזמן אמת עם תגיות מובילים, וסרגל התקדמות הנחות קבוצתיות (Group Buy) עם תגמולי הפניות.
  - רכיב `TradeInScannerModal.tsx`: שמאות ויזואלית מבוססת AI (סריקת לייזר והעלאת תמונה, סיווג איכות Like New / Good / Fair, פירוק דיאגנוסטי והנפקת שובר זיכוי מיידי לסל הקניות).
  - רכיב `VirtualFittingModal.tsx` ונתיב `app/api/rag/virtual-fitting/route.ts`: מדידת בגדים וירטואלית ב-AI Vision עם בחירת דוגמן/ית, העלאת תמונת משתמש, סרגלי התאמת מידות גוף, מפות חום התאמה (Heatmaps), המלצת מידה מותאמת והוספה ישירה לסל.
  - טאב 4 ב-`web-client/app/admin/page.tsx` "הנדסת כאוס וריפוי עצמי (Chaos & Circuit Breakers)": הזרקת תקלות חיות (Latency Spike, 503 Container Crash, Packet Loss, SAGA Timeout), לוח בקרה של Circuit Breakers (CLOSED, HALF_OPEN, OPEN) וסימולטור תיקון עצמי אוטונומי.
  - שילוב תפריטים וקישורים ב-`HeaderNav.tsx`, `AppShell.tsx`, `arena/page.tsx`, `gifting/page.tsx` ו-`ProductCard.tsx`.
- [x] G.4 אימות מלא מקצה לקצה (Verification):
  - הרצת `python agent-swarm-service/ecommerce_agent_swarm.py --self-test` – 24/24 בדיקות עברו בהצלחה מלאה (100% Green).
  - הרצת `npm run build` ב-`web-client` – קומפילציה נקייה לחלוטין של 31 נתיבים סטטיים ודינמיים ללא שום שגיאה או אזהרה (0 errors).

---

## 🚦 Track A & B Archive (Completed)
- Track A (Initial Storefront Redesign) & Track B (Consolidated RAG) - 100% Complete & Verified in Git.
