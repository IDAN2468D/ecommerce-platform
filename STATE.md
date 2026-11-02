# Project State & Execution Tracking: E-Commerce Redesign & Backend RAG Consolidation

- **Governance**: Spec-First (`.agents/specs/WEB_CLIENT_REDESIGN_SPEC.md`, `.agents/specs/RECOMMENDATION_RAG_INTEGRATION_SPEC.md`, `PRD-2026-UI-REDESIGN-V3`).
- **Team Lead Approval**: Approved by Idan.
- **Current Active Focus**: UI/UX Redesign V3 (Liquid Glass 4.0 Pro RTL & Modular Architecture).
- **Last Updated**: 2026-11-01

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

## 🚦 Track A & B Archive (Completed)
- Track A (Initial Storefront Redesign) & Track B (Consolidated RAG) - 100% Complete & Verified in Git.
