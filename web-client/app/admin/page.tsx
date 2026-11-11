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

type AdminTab = "saga" | "analytics" | "fraud";

export default function AdminCommandCenterPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("saga");
  const [activeSagaStep, setActiveSagaStep] = useState<number>(5);
  const [simulatingSaga, setSimulatingSaga] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("ALL");

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
    </div>
  );
}
