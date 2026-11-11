# Project State & Execution Tracking: E-Commerce Redesign & Backend RAG Consolidation

- **Governance**: Spec-First (`.agents/specs/WEB_CLIENT_REDESIGN_SPEC.md`, `.agents/specs/RECOMMENDATION_RAG_INTEGRATION_SPEC.md`, `PRD-2026-UI-REDESIGN-V3`).
- **Team Lead Approval**: Approved by Idan.
- **Current Active Focus**: Track F Verified (Full-Stack Enterprise Extensions via Native Swarm: Merchant Analytics, Fraud Guard, Marketplace Payouts & AI Gift Finder).
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

## 🚦 Track A & B Archive (Completed)
- Track A (Initial Storefront Redesign) & Track B (Consolidated RAG) - 100% Complete & Verified in Git.
