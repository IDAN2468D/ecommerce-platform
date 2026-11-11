"use client";

import React, { useState } from "react";
import {
  Activity,
  Server,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Database,
  RefreshCw,
  CheckCircle2,
  Play,
  Layers,
  TrendingUp,
  BarChart3,
  Sparkles,
  Lock,
  Zap,
  Flame,
  AlertTriangle,
  Radio,
  Terminal,
  RotateCcw,
  Sliders,
  Check,
  AlertOctagon,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import MerchantAnalyticsDashboard from "../../components/store/MerchantAnalyticsDashboard";
import FraudGuardDashboard from "../../components/store/FraudGuardDashboard";

interface ServiceNode {
  name: string;
  port: number;
  tier: "Edge" | "Core SAGA" | "AI & Swarm" | "FinTech & Commerce";
  latencyMs: number;
  status: "UP";
  description: string;
}

const MICROSERVICES_CATALOG: ServiceNode[] = [
  { name: "api-gateway", port: 8080, tier: "Edge", latencyMs: 3, status: "UP", description: "Spring Cloud Gateway, JWT & Redis Rate-Limiter" },
  { name: "order-service", port: 8081, tier: "Core SAGA", latencyMs: 8, status: "UP", description: "5-Step SAGA Orchestrator & Outbox Producer" },
  { name: "inventory-service", port: 8082, tier: "Core SAGA", latencyMs: 4, status: "UP", description: "Pessimistic Stock Locking & Redis Catalog Cache" },
  { name: "payment-service", port: 8083, tier: "Core SAGA", latencyMs: 11, status: "UP", description: "Idempotent Ledger & Compensating Refunds" },
  { name: "auth-service", port: 8084, tier: "Edge", latencyMs: 5, status: "UP", description: "HMAC-SHA256 JWT & BCrypt Identity Service" },
  { name: "notification-service", port: 8085, tier: "Core SAGA", latencyMs: 2, status: "UP", description: "Real-Time Server-Sent Events (SSE) Push Stream" },
  { name: "shipping-delivery-service", port: 8086, tier: "Core SAGA", latencyMs: 7, status: "UP", description: "Carrier Allocation & SAGA Step 5 Tracking" },
  { name: "review-rating-service", port: 8087, tier: "AI & Swarm", latencyMs: 9, status: "UP", description: "Verified Buyer Reviews & AI Pros/Cons Summary" },
  { name: "cart-wishlist-service", port: 8088, tier: "Core SAGA", latencyMs: 2, status: "UP", description: "Sub-2ms Redis Cart & Collaborative Rooms" },
  { name: "recommendation-loyalty-service", port: 8089, tier: "FinTech & Commerce", latencyMs: 6, status: "UP", description: "VIP 5% Cashback Wallet & Personalized Engine" },
  { name: "workspace-integration-service", port: 8091, tier: "AI & Swarm", latencyMs: 14, status: "UP", description: "Google Drive PDF Archiving & Calendar MCP" },
  { name: "rag-service", port: 8092, tier: "AI & Swarm", latencyMs: 18, status: "UP", description: "MongoDB Atlas Vector Search & Gemini Multimodal" },
  { name: "agent-swarm-service", port: 8093, tier: "AI & Swarm", latencyMs: 21, status: "UP", description: "10 Autonomous FastAPI Agents & Supervisor Router" },
  { name: "rma-returns-service", port: 8094, tier: "AI & Swarm", latencyMs: 15, status: "UP", description: "Gemini Vision Defect Inspection & Instant RMA" },
  { name: "dynamic-pricing-service", port: 8095, tier: "FinTech & Commerce", latencyMs: 6, status: "UP", description: "30-Day Price Ledger, Bundles & Auto-Buy" },
  { name: "fraud-risk-service", port: 8096, tier: "FinTech & Commerce", latencyMs: 4, status: "UP", description: "Sliding-Window Velocity & Pre-Capture Guard" },
  { name: "merchant-analytics-service", port: 8097, tier: "FinTech & Commerce", latencyMs: 9, status: "UP", description: "CQRS Telemetry & Stock-Out AI Forecasting" },
  { name: "subscription-billing-service", port: 8098, tier: "FinTech & Commerce", latencyMs: 7, status: "UP", description: "Recurring SAGA Subscription Billing Engine" },
  { name: "marketplace-vendor-service", port: 8099, tier: "FinTech & Commerce", latencyMs: 6, status: "UP", description: "Multi-Vendor Split Payouts & 10% Platform Fee" },
  { name: "flash-sale-auction-service", port: 8100, tier: "FinTech & Commerce", latencyMs: 3, status: "UP", description: "Atomic Flash Drops & Real-Time Live Auctions" },
  { name: "bnpl-credit-service", port: 8101, tier: "FinTech & Commerce", latencyMs: 5, status: "UP", description: "Instant 0% APR 4-Installment Split Credit" },
  { name: "group-buy-referral-service", port: 8102, tier: "FinTech & Commerce", latencyMs: 5, status: "UP", description: "Collaborative Group Buying Squads & Referrals" },
  { name: "warranty-escrow-service", port: 8103, tier: "FinTech & Commerce", latencyMs: 4, status: "UP", description: "SHA-256 Digital Warranties & Smart Vendor Escrow" },
  { name: "trade-in-circular-service", port: 8104, tier: "FinTech & Commerce", latencyMs: 5, status: "UP", description: "AI Trade-In Device Appraisal & Instant Credit Vouchers" },
  { name: "gift-registry-splitpay-service", port: 8105, tier: "FinTech & Commerce", latencyMs: 4, status: "UP", description: "Social Gifting Crowdfunding & Multi-Payer Split" },
  { name: "b2b-wholesale-quote-service", port: 8106, tier: "FinTech & Commerce", latencyMs: 6, status: "UP", description: "B2B Corporate Bulk RFQ & Net-30 Invoicing" },
];

interface CircuitBreakerStatus {
  id: string;
  name: string;
  port: number;
  tier: string;
  state: "CLOSED" | "HALF_OPEN" | "OPEN";
  failureRate: number;
  slowCallRate: number;
  ringBufferCalls: number;
  fallbackActive: boolean;
  fallbackMechanism: string;
  healthEndpoint: string;
}

const INITIAL_CIRCUIT_BREAKERS: CircuitBreakerStatus[] = [
  {
    id: "cb_payment",
    name: "payment-service",
    port: 8083,
    tier: "Core SAGA",
    state: "CLOSED",
    failureRate: 0.8,
    slowCallRate: 1.2,
    ringBufferCalls: 100,
    fallbackActive: false,
    fallbackMechanism: "Idempotent Ledger & Compensating SAGA Rollback",
    healthEndpoint: "/actuator/health/circuitbreakers",
  },
  {
    id: "cb_inventory",
    name: "inventory-service",
    port: 8082,
    tier: "Core SAGA",
    state: "CLOSED",
    failureRate: 0.2,
    slowCallRate: 0.5,
    ringBufferCalls: 100,
    fallbackActive: false,
    fallbackMechanism: "Redis Read-Only Catalog Cache + Outbox Queue",
    healthEndpoint: "/actuator/health/circuitbreakers",
  },
  {
    id: "cb_order",
    name: "order-service",
    port: 8081,
    tier: "Core SAGA",
    state: "CLOSED",
    failureRate: 0.4,
    slowCallRate: 0.9,
    ringBufferCalls: 100,
    fallbackActive: false,
    fallbackMechanism: "Transactional Outbox Buffer & Dead-Letter Queue",
    healthEndpoint: "/actuator/health/circuitbreakers",
  },
  {
    id: "cb_b2b",
    name: "b2b-wholesale-quote-service",
    port: 8106,
    tier: "FinTech & Commerce",
    state: "CLOSED",
    failureRate: 0.5,
    slowCallRate: 1.0,
    ringBufferCalls: 100,
    fallbackActive: false,
    fallbackMechanism: "Static RFQ Matrix + Asynchronous Human-in-the-Loop",
    healthEndpoint: "/actuator/health/circuitbreakers",
  },
  {
    id: "cb_shipping",
    name: "shipping-delivery-service",
    port: 8086,
    tier: "Core SAGA",
    state: "CLOSED",
    failureRate: 1.1,
    slowCallRate: 2.3,
    ringBufferCalls: 100,
    fallbackActive: false,
    fallbackMechanism: "Secondary Carrier Gateway & Local Dispatch Staging",
    healthEndpoint: "/actuator/health/circuitbreakers",
  },
  {
    id: "cb_rag",
    name: "rag-service",
    port: 8092,
    tier: "AI & Swarm",
    state: "CLOSED",
    failureRate: 1.8,
    slowCallRate: 3.4,
    ringBufferCalls: 100,
    fallbackActive: false,
    fallbackMechanism: "Lexical Full-Text Search Fallback (Zero Vector Latency)",
    healthEndpoint: "/actuator/health/circuitbreakers",
  },
];

interface ChaosEventLog {
  id: string;
  timestamp: string;
  service: string;
  severity: "CRITICAL" | "WARNING" | "RECOVERY" | "RESOLVED";
  message: string;
}

type AdminTab = "saga" | "analytics" | "fraud" | "chaos";

export default function AdminCommandCenterPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("saga");
  const [activeSagaStep, setActiveSagaStep] = useState<number>(5);
  const [simulatingSaga, setSimulatingSaga] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("ALL");

  // Chaos & Circuit Breaker State
  const [circuitBreakers, setCircuitBreakers] = useState<CircuitBreakerStatus[]>(INITIAL_CIRCUIT_BREAKERS);
  const [targetFaultService, setTargetFaultService] = useState<string>("payment-service");
  const [faultType, setFaultType] = useState<"LATENCY_SPIKE" | "CONTAINER_CRASH" | "PACKET_LOSS" | "SAGA_TIMEOUT">("LATENCY_SPIKE");
  const [isInjectingFault, setIsInjectingFault] = useState<boolean>(false);
  const [isSelfHealingRunning, setIsSelfHealingRunning] = useState<boolean>(false);
  const [chaosLogs, setChaosLogs] = useState<ChaosEventLog[]>([
    {
      id: "log_init_1",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString("he-IL"),
      service: "resilience4j-supervisor",
      severity: "RESOLVED",
      message: "כל 6 מפסקי הזרם (Circuit Breakers) במצב CLOSED תקין. סף כשל מוגדר: 50%.",
    },
    {
      id: "log_init_2",
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toLocaleTimeString("he-IL"),
      service: "autonomous-ops",
      severity: "RESOLVED",
      message: "Heartbeat תקין מכל 23 המיקרו-שירותים. אין חריגות ב-Kafka Lag.",
    },
  ]);

  const runLiveSagaTrace = () => {
    setSimulatingSaga(true);
    setActiveSagaStep(1);
    [2, 3, 4, 5].forEach((step, idx) => {
      setTimeout(() => {
        setActiveSagaStep(step);
        if (step === 5) setSimulatingSaga(false);
      }, (idx + 1) * 550);
    });
  };

  const handleInjectFault = () => {
    setIsInjectingFault(true);

    const now = new Date().toLocaleTimeString("he-IL");
    const faultDesc =
      faultType === "LATENCY_SPIKE"
        ? "הזרקת השהיית רשת של +3,500ms (Slow Call Spike)"
        : faultType === "CONTAINER_CRASH"
        ? "קריסת פוד פתאומית (SIGKILL 503 Service Unavailable)"
        : faultType === "PACKET_LOSS"
        ? "איבוד חבילות נתונים של 50% ושגיאות Connection Reset"
        : "חסימת שלב SAGA Step 3 וזיוף שגיאת שער תשלומים";

    setCircuitBreakers((prev) =>
      prev.map((cb) => {
        if (cb.name !== targetFaultService) return cb;
        return {
          ...cb,
          state: "OPEN",
          failureRate: 74.5,
          slowCallRate: 88.0,
          fallbackActive: true,
        };
      })
    );

    setChaosLogs((prev) => [
      {
        id: `log_${Date.now()}_1`,
        timestamp: now,
        service: targetFaultService,
        severity: "CRITICAL",
        message: `תקלה הוזרקה: ${faultDesc}. חריגה מעל 50% כשלים.`,
      },
      {
        id: `log_${Date.now()}_2`,
        timestamp: now,
        service: "resilience4j-engine",
        severity: "WARNING",
        message: `Circuit Breaker עבור ${targetFaultService} הופעל ונפתח: מצב [OPEN]. תנועה מנותבת למנגנון גיבוי (Fallback).`,
      },
      ...prev,
    ]);

    setTimeout(() => {
      setIsInjectingFault(false);
    }, 700);
  };

  const handleRunAutonomousHealing = async () => {
    setIsSelfHealingRunning(true);

    const target = targetFaultService;
    const now = () => new Date().toLocaleTimeString("he-IL");

    // Phase 1: Detection & Container Restart
    await new Promise((r) => setTimeout(r, 800));
    setChaosLogs((prev) => [
      {
        id: `heal_${Date.now()}_1`,
        timestamp: now(),
        service: "autonomous-ops-agent",
        severity: "RECOVERY",
        message: `סוכן ריפוי עצמי זיהה מעגל OPEN ב-${target}. הפעלה מחדש אוטונומית של פוד וירטואלי (Virtual Thread Pool Purge).`,
      },
      ...prev,
    ]);

    // Phase 2: Probe in HALF_OPEN
    await new Promise((r) => setTimeout(r, 1200));
    setCircuitBreakers((prev) =>
      prev.map((cb) =>
        cb.name === target
          ? { ...cb, state: "HALF_OPEN", failureRate: 22.0, slowCallRate: 15.0, fallbackActive: true }
          : cb
      )
    );
    setChaosLogs((prev) => [
      {
        id: `heal_${Date.now()}_2`,
        timestamp: now(),
        service: target,
        severity: "RECOVERY",
        message: `שירות ${target} עלה מחדש. מעגל הועבר למצב בדיקה: [HALF_OPEN]. מזריק 10 קריאות Probe לניטור יציבות.`,
      },
      ...prev,
    ]);

    // Phase 3: Resolution & Circuit CLOSED
    await new Promise((r) => setTimeout(r, 1200));
    setCircuitBreakers((prev) =>
      prev.map((cb) =>
        cb.name === target
          ? { ...cb, state: "CLOSED", failureRate: 0.4, slowCallRate: 0.8, fallbackActive: false }
          : cb
      )
    );
    setChaosLogs((prev) => [
      {
        id: `heal_${Date.now()}_3`,
        timestamp: now(),
        service: target,
        severity: "RESOLVED",
        message: `בדיקות ה-Probe עברו ב-100% הצלחה (200 OK). מעגל חזר למצב תקין: [CLOSED]. תנועה מלאה שוחזרה!`,
      },
      ...prev,
    ]);

    setIsSelfHealingRunning(false);
  };

  const handleResetAllCircuitBreakers = () => {
    setCircuitBreakers(INITIAL_CIRCUIT_BREAKERS);
    setChaosLogs((prev) => [
      {
        id: `reset_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("he-IL"),
        service: "admin-command",
        severity: "RESOLVED",
        message: "איפוס ידני מלא: כל מפסקי הזרם אופסו למצב CLOSED. תנועה רגילה בכל המיקרו-שירותים.",
      },
      ...prev,
    ]);
  };

  const filteredServices =
    selectedTier === "ALL"
      ? MICROSERVICES_CATALOG
      : MICROSERVICES_CATALOG.filter((s) => s.tier === selectedTier);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16" dir="rtl">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950/50 to-slate-950 border border-indigo-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>23 Microservices Online • Java 21 Virtual Threads & Kafka KRaft</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            מרכז שליטה ובקרה לאדמין (`Enterprise Admin Command Center`)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            ניטור חי של 23 מיקרו-שירותים, תזמור SAGA, אנליטיקה וחיזוי מלאי AI, ומערך הגנת הונאות Pre-Capture בזמן אמת.
          </p>
        </div>

        {activeTab === "saga" && (
          <Button
            onClick={runLiveSagaTrace}
            loading={simulatingSaga}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-3 rounded-2xl flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            <span>הרץ סימולציית 5-Step SAGA חיה</span>
          </Button>
        )}
      </div>

      {/* Top-Level Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <button
          onClick={() => setActiveTab("saga")}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 ${
            activeTab === "saga"
              ? "bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>בקרה וארכיטקטורת SAGA</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "saga"
                ? "bg-slate-950/20 text-slate-950"
                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            23 Services
          </span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 ${
            activeTab === "analytics"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>אנליטיקה ותחזית מלאי AI</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "analytics"
                ? "bg-white/20 text-white"
                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            AI Copilot
          </span>
        </button>

        <button
          onClick={() => setActiveTab("fraud")}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 ${
            activeTab === "fraud"
              ? "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>מרכז הגנת הונאות ו-Risk Guard</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "fraud"
                ? "bg-white/20 text-white"
                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            Pre-Capture
          </span>
        </button>

        {/* TAB 4: CHAOS ENGINEERING & SELF-HEALING CIRCUIT BREAKER */}
        <button
          onClick={() => setActiveTab("chaos")}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 ${
            activeTab === "chaos"
              ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 text-white shadow-lg shadow-purple-500/25"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>הנדסת כאוס וריפוי עצמי (Chaos & Circuit Breakers)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "chaos"
                ? "bg-white/20 text-white"
                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            Self-Healing
          </span>
        </button>
      </div>

      {/* Tab 1: בקרה וארכיטקטורת SAGA */}
      {activeTab === "saga" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Interactive 5-Step SAGA Pipeline Visualizer */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                <span>צינור תזמור הזמנות אטומי (`5-Step Event-Driven Kafka SAGA`)</span>
              </h2>
              <span className="text-xs font-mono text-emerald-500 font-bold">
                Zero Message Loss • Outbox Buffer Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { step: 1, title: "1. Order Initiation", svc: "order-service (8081)", event: "OrderCreatedEvent" },
                { step: 2, title: "2. Stock Lock", svc: "inventory-service (8082)", event: "StockReservedEvent" },
                { step: 3, title: "3. Payment & BNPL", svc: "payment / bnpl (8083/8101)", event: "PaymentCapturedEvent" },
                { step: 4, title: "4. Carrier & Escrow", svc: "shipping / warranty (8086/8103)", event: "ShipmentScheduledEvent" },
                { step: 5, title: "5. PDF & SSE Push", svc: "workspace / notif (8091/8085)", event: "OrderConfirmed + Drive PDF" },
              ].map((item) => {
                const reached = activeSagaStep >= item.step;
                return (
                  <div
                    key={item.step}
                    className={`p-4 rounded-2xl border transition-all ${
                      reached
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-black">
                      <span>{item.title}</span>
                      <CheckCircle2 className={`w-4 h-4 ${reached ? "text-emerald-500" : "text-slate-600"}`} />
                    </div>
                    <p className="text-[11px] font-mono mt-1.5 text-slate-500 dark:text-slate-400">{item.svc}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-slate-900 text-amber-400 font-mono text-[10px]">
                      {item.event}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tier Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {["ALL", "Edge", "Core SAGA", "AI & Swarm", "FinTech & Commerce"].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedTier === tier
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                }`}
              >
                {tier === "ALL" ? `כל המיקרו-שירותים (${MICROSERVICES_CATALOG.length})` : tier}
              </button>
            ))}
          </div>

          {/* Microservices Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((svc) => (
              <div
                key={svc.name}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                        {svc.name}
                      </h3>
                      <span className="text-[10px] font-bold text-indigo-400">{svc.tier}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 font-mono text-[10px] font-black">
                    :{svc.port} • UP
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{svc.description}</p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>P95 Latency: <strong className="text-emerald-400">{svc.latencyMs}ms</strong></span>
                  <span>Actuator: /health</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: אנליטיקה ותחזית מלאי AI */}
      {activeTab === "analytics" && (
        <div className="animate-fadeIn">
          <MerchantAnalyticsDashboard />
        </div>
      )}

      {/* Tab 3: מרכז הגנת הונאות ו-Risk Guard */}
      {activeTab === "fraud" && (
        <div className="animate-fadeIn">
          <FraudGuardDashboard />
        </div>
      )}

      {/* TAB 4: הנדסת כאוס וריפוי עצמי (Chaos Engineering & Circuit Breaker) */}
      {activeTab === "chaos" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Control Bar: Fault Injection Console & Self-Healing Triggers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Fault Injection Simulator (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-purple-500/30 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      קונסולת הזרקת תקלות כאוס (Live Chaos Injection)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      בדיקת שרידות, חסינות SAGA ומנגנון ניתוק מעגל Resilience4j בזמן אמת
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 font-mono text-xs font-bold border border-purple-500/20">
                  Chaos Monkey Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Target Service */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    שירות היעד לפגיעה:
                  </label>
                  <select
                    value={targetFaultService}
                    onChange={(e) => setTargetFaultService(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:border-purple-500 focus:outline-none"
                  >
                    {circuitBreakers.map((cb) => (
                      <option key={cb.name} value={cb.name}>
                        {cb.name} (:{cb.port}) — {cb.tier}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fault Type */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    סוג התקלה להזרקה:
                  </label>
                  <select
                    value={faultType}
                    onChange={(e) => setFaultType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium text-xs focus:border-purple-500 focus:outline-none"
                  >
                    <option value="LATENCY_SPIKE">⏱️ Latency Spike (+3,500ms Slow Call)</option>
                    <option value="CONTAINER_CRASH">💥 503 Container Crash (SIGKILL)</option>
                    <option value="PACKET_LOSS">📉 50% Packet Loss / Network Flap</option>
                    <option value="SAGA_TIMEOUT">🔄 Cascading SAGA Step 3 Timeout</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  onClick={handleInjectFault}
                  loading={isInjectingFault}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/20"
                >
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>הזרק תקלה חיה על {targetFaultService}</span>
                </Button>

                <Button
                  onClick={handleRunAutonomousHealing}
                  loading={isSelfHealingRunning}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>הפעל תרחיש ריפוי עצמי אוטונומי (Self-Healing)</span>
                </Button>

                <button
                  onClick={handleResetAllCircuitBreakers}
                  className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>איפוס כל המפסקים</span>
                </button>
              </div>
            </div>

            {/* Right: Live Chaos & Resilience Telemetry Feed (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-mono font-bold text-xs text-white uppercase tracking-wider">
                    יומן אירועים וריפוי אוטונומי (Event Stream)
                  </h3>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto font-mono text-[11px] pr-1">
                {chaosLogs.map((log) => {
                  const color =
                    log.severity === "CRITICAL"
                      ? "text-rose-400 border-rose-500/30 bg-rose-500/10"
                      : log.severity === "WARNING"
                      ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                      : log.severity === "RECOVERY"
                      ? "text-indigo-300 border-indigo-500/30 bg-indigo-500/10"
                      : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";

                  return (
                    <div key={log.id} className={`p-2.5 rounded-xl border ${color} space-y-1`}>
                      <div className="flex items-center justify-between text-[10px] opacity-80">
                        <span>[{log.timestamp}] • {log.service}</span>
                        <strong className="uppercase">{log.severity}</strong>
                      </div>
                      <p className="leading-relaxed text-[11px] font-sans">{log.message}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section: Circuit Breakers Grid (Resilience4j / Sentinel) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>מצב מפסקי זרם בזמן אמת (`Resilience4j Circuit Breakers Grid`)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ניטור מצב מעגלים: CLOSED (תקין), HALF_OPEN (בדיקת התאוששות), OPEN (מנותק / Fail-Safe פעיל)
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>CLOSED ({circuitBreakers.filter((c) => c.state === "CLOSED").length})</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>HALF_OPEN ({circuitBreakers.filter((c) => c.state === "HALF_OPEN").length})</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-400 font-bold border border-rose-500/30">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>OPEN ({circuitBreakers.filter((c) => c.state === "OPEN").length})</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {circuitBreakers.map((cb) => {
                const isClosed = cb.state === "CLOSED";
                const isHalfOpen = cb.state === "HALF_OPEN";
                const isOpen = cb.state === "OPEN";

                const stateBadgeColor = isClosed
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : isHalfOpen
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                  : "bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse";

                return (
                  <div
                    key={cb.id}
                    className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                      isOpen
                        ? "bg-rose-950/20 border-rose-500/50 shadow-lg shadow-rose-500/10"
                        : isHalfOpen
                        ? "bg-amber-950/20 border-amber-500/50 shadow-md"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md"
                    }`}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${
                            isOpen
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                              : isHalfOpen
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          }`}>
                            <Zap className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-mono font-black text-sm text-slate-900 dark:text-white">
                              {cb.name}
                            </h4>
                            <span className="text-[10px] font-bold text-indigo-400">{cb.tier}</span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-black border ${stateBadgeColor}`}>
                          {cb.state}
                        </span>
                      </div>

                      {/* Telemetry Metrics */}
                      <div className="grid grid-cols-2 gap-2 pt-4 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono">
                          <span className="text-slate-400 text-[10px] block">שיעור כשל (Fail Rate):</span>
                          <span className={`font-black text-sm ${cb.failureRate > 50 ? "text-rose-400" : "text-emerald-400"}`}>
                            {cb.failureRate}%
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono">
                          <span className="text-slate-400 text-[10px] block">קריאות אטיות:</span>
                          <span className={`font-black text-sm ${cb.slowCallRate > 50 ? "text-amber-400" : "text-slate-200"}`}>
                            {cb.slowCallRate}%
                          </span>
                        </div>
                      </div>

                      {/* Fallback routing mechanism description */}
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-[11px]">
                        <span className="text-slate-400 font-bold block mb-0.5">מנגנון עקיפה (Fallback):</span>
                        <p className="text-slate-300 font-mono text-[10px] leading-relaxed">{cb.fallbackMechanism}</p>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-mono text-[10px] text-slate-500">Port :{cb.port}</span>
                      <div className="flex items-center gap-1.5">
                        {isOpen ? (
                          <button
                            onClick={() => {
                              setCircuitBreakers((prev) =>
                                prev.map((c) => (c.id === cb.id ? { ...c, state: "CLOSED", failureRate: 0.5, fallbackActive: false } : c))
                              );
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition"
                          >
                            סגור מעגל
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setCircuitBreakers((prev) =>
                                prev.map((c) => (c.id === cb.id ? { ...c, state: "OPEN", failureRate: 75.0, fallbackActive: true } : c))
                              );
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition"
                          >
                            נתק מעגל
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
