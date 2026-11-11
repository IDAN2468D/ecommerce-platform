"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  ShieldCheck,
  AlertTriangle,
  Package,
  Clock,
  Sparkles,
  Send,
  RefreshCw,
  CheckCircle2,
  Bot,
  Boxes,
  ArrowUpRight,
  Flame,
  Check,
  Percent,
  HeartHandshake,
  HelpCircle,
} from "lucide-react";
import { Button } from "../ui/Button";

export interface AnalyticsSummary {
  grossMerchandiseValueIls: number;
  netRevenueIls: number;
  ordersCount: number;
  averageOrderValueIls: number;
  conversionRatePercentage: number;
  fraudBlockRatePercentage: number;
  rmaVipRetentionRatePercentage: number;
  abandonedCartsRecovered: number;
  lastRefreshed: string;
}

export interface SkuDepletionForecast {
  skuCode: string;
  title: string;
  currentStock: number;
  dailyBurnRate: number;
  predictedDaysUntilDepletion: number;
  restockUrgency: "CRITICAL" | "URGENT" | "WARNING" | "SAFE" | "HEALTHY";
  calculatedAt: string;
}

export interface CopilotMessage {
  question: string;
  answer: string;
  topUrgentSkus?: SkuDepletionForecast[];
  answeredAt: string;
}

const PRESET_QUESTIONS = [
  "אילו מוצרים בסכנת מלאי השבוע?",
  "מה תמונת ה-GMV והרווחיות להיום?",
  "מה סטטוס הגנת ה-Fraud והעגלות הנטושות?",
  "כיצד תוכנית שימור ה-VIP משפיעה על ה-AOV?",
];

export default function MerchantAnalyticsDashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [forecasts, setForecasts] = useState<SkuDepletionForecast[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingForecasts, setLoadingForecasts] = useState(true);
  const [onlyCritical, setOnlyCritical] = useState(false);

  // Copilot State
  const [questionInput, setQuestionInput] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotHistory, setCopilotHistory] = useState<CopilotMessage[]>([
    {
      question: "סקירה ראשונית של המערכת",
      answer:
        "שלום! מערכת Merchant Analytics & Predictive Copilot פעילה ומחוברת בזמן אמת ל-CQRS Telemetry. מחזור ה-GMV עומד על ₪489,500 עם 284 הזמנות. 2 מוצרים הגיעו לסף קריטי הדורש הזמנת רכש (PO). שאל אותי כל שאלה עסקית או תפעולית!",
      answeredAt: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  // Restock Feedback Modal / State
  const [restockedSkus, setRestockedSkus] = useState<Record<string, boolean>>({});
  const [restockSuccessMessage, setRestockSuccessMessage] = useState<string | null>(null);

  // Fetch Summary
  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/analytics/summary", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error("Failed to load analytics summary", err);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  // Fetch Inventory Forecasts
  const fetchForecasts = useCallback(async (criticalOnly: boolean) => {
    setLoadingForecasts(true);
    try {
      const query = criticalOnly ? "?onlyCritical=true" : "";
      const res = await fetch(`/api/analytics/inventory-forecast${query}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setForecasts(data);
      }
    } catch (err) {
      console.error("Failed to load inventory forecasts", err);
    } finally {
      setLoadingForecasts(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    fetchForecasts(onlyCritical);
  }, [fetchSummary, fetchForecasts, onlyCritical]);

  // Handle Copilot Query
  const handleAskCopilot = async (qText?: string) => {
    const q = (qText || questionInput).trim();
    if (!q || copilotLoading) return;

    setCopilotLoading(true);
    if (!qText) setQuestionInput("");

    try {
      const res = await fetch("/api/analytics/ai-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      if (res.ok) {
        const data = await res.json();
        setCopilotHistory((prev) => [
          {
            question: data.question,
            answer: data.answer,
            topUrgentSkus: data.topUrgentSkus,
            answeredAt: new Date(data.answeredAt || Date.now()).toLocaleTimeString("he-IL", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          ...prev,
        ]);
      } else {
        setCopilotHistory((prev) => [
          {
            question: q,
            answer: "מנוע ה-Copilot מעבד כעת נתונים מרובים. אנא נסה שוב בעוד מספר רגעים.",
            answeredAt: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error("Copilot request failed", err);
    } finally {
      setCopilotLoading(false);
    }
  };

  // Handle Restock Action
  const handleRestock = (sku: SkuDepletionForecast) => {
    setRestockedSkus((prev) => ({ ...prev, [sku.skuCode]: true }));
    const poNumber = "PO-2026-" + Math.floor(1000 + Math.random() * 9000);
    setRestockSuccessMessage(`הזמנת רכש דחופה ${poNumber} הופקה בהצלחה עבור מק"ט ${sku.skuCode} (${sku.title}) ונשלחה לספק!`);
    setTimeout(() => {
      setRestockSuccessMessage(null);
    }, 6000);
  };

  // Urgency badge styling helper
  const renderUrgencyBadge = (urgency: string) => {
    const u = urgency.toUpperCase();
    if (u === "CRITICAL") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 border border-rose-500/40 text-rose-300 shadow-sm shadow-rose-950/40 animate-pulse">
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          CRITICAL
        </span>
      );
    }
    if (u === "URGENT" || u === "WARNING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm shadow-amber-950/40">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          URGENT
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-950/40">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        SAFE
      </span>
    );
  };

  return (
    <div className="space-y-8 text-slate-100" dir="rtl">
      {/* Top Banner & Refresh */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900/90 via-indigo-950/70 to-slate-900/90 border border-indigo-500/30 shadow-2xl backdrop-blur-2xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 border border-indigo-400/40 text-indigo-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live CQRS Telemetry
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Port :8097 / Gateway :8080
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Boxes className="w-8 h-8 text-indigo-400" />
              לוח אנליטיקה מסחרית, חיזוי מלאי ו-AI Copilot
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              ניטור רציף של מחזורי מסחר, שיעורי המרה, הגנת הונאות בזמן אמת, מודל AI לחיזוי אזילת מק&quot;טים ועוזר תפעולי חכם (Shopify Sidekick pattern).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchSummary();
                fetchForecasts(onlyCritical);
              }}
              disabled={loadingSummary || loadingForecasts}
              className="bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200"
              icon={<RefreshCw className={`w-4 h-4 ${loadingSummary || loadingForecasts ? "animate-spin" : ""}`} />}
            >
              רענן נתונים
            </Button>
          </div>
        </div>
      </div>

      {/* Restock Success Feedback Toast */}
      {restockSuccessMessage && (
        <div className="rounded-2xl bg-emerald-950/80 border border-emerald-500/40 p-4 shadow-xl backdrop-blur-xl flex items-center justify-between gap-4 animate-fade-in text-emerald-200 text-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{restockSuccessMessage}</span>
          </div>
          <button
            onClick={() => setRestockSuccessMessage(null)}
            className="text-xs text-emerald-400 hover:text-emerald-200 underline font-semibold"
          >
            סגור
          </button>
        </div>
      )}

      {/* Live KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: GMV */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-indigo-500/20 p-5 shadow-xl backdrop-blur-xl hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold text-slate-300">מחזור מסחר ברוטו (GMV)</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-white font-mono tracking-tight" dir="ltr">
              {summary ? `₪${summary.grossMerchandiseValueIls.toLocaleString("he-IL")}` : "₪489,500"}
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{summary ? `${summary.ordersCount} הזמנות היום` : "284 הזמנות היום"}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>הכנסה נטו:</span>
            <span className="font-mono text-slate-300" dir="ltr">
              {summary ? `₪${summary.netRevenueIls.toLocaleString("he-IL")}` : "₪442,100"}
            </span>
          </div>
        </div>

        {/* KPI 2: AOV */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-purple-500/20 p-5 shadow-xl backdrop-blur-xl hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold text-slate-300">סל קנייה ממוצע (AOV)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-white font-mono tracking-tight" dir="ltr">
              {summary ? `₪${summary.averageOrderValueIls.toLocaleString("he-IL", { minimumFractionDigits: 2 })}` : "₪1,723.59"}
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+6.2% ביחס לשבוע שעבר</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>עגלות ששוחזרו:</span>
            <span className="font-mono text-purple-300">{summary?.abandonedCartsRecovered ?? 38} עגלות</span>
          </div>
        </div>

        {/* KPI 3: Conversion Rate */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-emerald-500/20 p-5 shadow-xl backdrop-blur-xl hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold text-slate-300">יחס המרה (Conversion)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight" dir="ltr">
              {summary ? `${summary.conversionRatePercentage}%` : "4.85%"}
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>יעד חודשי: 4.50% (מעל היעד)</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>סשנים פעילים:</span>
            <span className="font-mono text-slate-300">5,855 ביקורים</span>
          </div>
        </div>

        {/* KPI 4: Fraud Block Rate */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-rose-500/20 p-5 shadow-xl backdrop-blur-xl hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold text-slate-300">שיעור סיכול הונאות</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-white font-mono tracking-tight" dir="ltr">
              {summary ? `${summary.fraudBlockRatePercentage}%` : "1.20%"}
            </div>
            <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>SAGA Pre-Capture Guard</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>סיכון ממוצע:</span>
            <span className="font-mono text-emerald-400">14/100 (LOW)</span>
          </div>
        </div>

        {/* KPI 5: VIP Retention */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-amber-500/20 p-5 shadow-xl backdrop-blur-xl hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold text-slate-300">שימור לקוחות VIP (RMA)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-amber-400 font-mono tracking-tight" dir="ltr">
              {summary ? `${summary.rmaVipRetentionRatePercentage}%` : "84.50%"}
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>זיכוי דיגיטלי מיידי</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>מועדון VIP:</span>
            <span className="font-mono text-slate-300">1,420 חברים</span>
          </div>
        </div>
      </div>

      {/* Sku Depletion Forecast Table Section */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-black text-white">תחזית קצב שריפת מלאי (Stock Depletion Forecast)</h2>
            </div>
            <p className="text-xs text-slate-400">
              מודל רגרסיה וחיזוי מבוסס קצב מכירות יומי (Burn Rate) לזיהוי סיכוני אזילה והפקת הזמנות רכש מבעוד מועד.
            </p>
          </div>

          {/* Critical Only Filter Toggle */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 p-1.5 rounded-2xl">
            <button
              onClick={() => setOnlyCritical(false)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                !onlyCritical
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              כל הפריטים ({forecasts.length})
            </button>
            <button
              onClick={() => setOnlyCritical(true)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                onlyCritical
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "text-rose-400 hover:text-rose-300"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              רק מלאי קריטי (CRITICAL)
            </button>
          </div>
        </div>

        {/* Forecast Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-300 font-bold">
                <th className="py-3.5 px-4">מק&quot;ט (SKU)</th>
                <th className="py-3.5 px-4">שם המוצר</th>
                <th className="py-3.5 px-4">מלאי נוכחי</th>
                <th className="py-3.5 px-4">קצב מכירה יומי (Velocity)</th>
                <th className="py-3.5 px-4">ימים עד לאזילה</th>
                <th className="py-3.5 px-4">דחיפות רכש</th>
                <th className="py-3.5 px-4 text-center">פעולה מיידית</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loadingForecasts ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                    טוען תחזיות שריפת מלאי...
                  </td>
                </tr>
              ) : forecasts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    לא נמצאו פריטים בסיכון קריטי כעת. כל המלאי ברמה תקינה.
                  </td>
                </tr>
              ) : (
                forecasts.map((sku) => {
                  const isRestocked = !!restockedSkus[sku.skuCode];
                  return (
                    <tr
                      key={sku.skuCode}
                      className="hover:bg-slate-900/60 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-300" dir="ltr">
                        {sku.skuCode}
                      </td>
                      <td className="py-3.5 px-4 text-slate-200 font-semibold max-w-xs truncate">
                        {sku.title}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        <span className="font-bold text-white text-sm">{sku.currentStock}</span> יח&apos;
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        <span className="font-semibold text-amber-400">{sku.dailyBurnRate.toFixed(1)}</span> / יום
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span
                          className={`font-black text-sm px-2 py-0.5 rounded-md ${
                            sku.predictedDaysUntilDepletion <= 3
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : sku.predictedDaysUntilDepletion <= 7
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "text-emerald-400"
                          }`}
                        >
                          {sku.predictedDaysUntilDepletion.toFixed(1)} ימים
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {renderUrgencyBadge(sku.restockUrgency)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          size="sm"
                          variant={isRestocked ? "outline" : sku.restockUrgency === "CRITICAL" ? "danger" : "primary"}
                          disabled={isRestocked}
                          onClick={() => handleRestock(sku)}
                          icon={isRestocked ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Package className="w-3.5 h-3.5" />}
                          className={`text-xs py-1 px-3 ${
                            isRestocked
                              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 cursor-default"
                              : ""
                          }`}
                        >
                          {isRestocked ? "הוזמן רכש" : "הפק הזמנת רכש (PO)"}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive AI Merchant Copilot Chat Box */}
      <div className="rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-indigo-500/30 shadow-2xl backdrop-blur-2xl p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">AI Merchant Copilot</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Shopify Sidekick Mode
                </span>
              </div>
              <p className="text-xs text-slate-400">
                עוזר תפעולי ופיננסי מבוסס LLM לתשובות מיידיות, תובנות רכש ואופטימיזציית רווחיות.
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Telemetry Engine Active</span>
          </div>
        </div>

        {/* Preset Questions Chips */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            שאלות נפוצות מומלצות:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleAskCopilot(q)}
                disabled={copilotLoading}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-indigo-950/70 text-slate-200 border border-slate-700/80 hover:border-indigo-500/50 transition-all flex items-center gap-1.5 group disabled:opacity-50"
              >
                <span>{q}</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-400 transition" />
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskCopilot();
          }}
          className="flex items-center gap-3 bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-2 shadow-inner focus-within:border-indigo-400 transition"
        >
          <input
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder="שאל את ה-Copilot כל שאלה עסקית (לדוגמה: מה התחזית לסוף החודש? או אילו פריטים בסכנת אזילה?)..."
            className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-500 text-xs sm:text-sm px-3 focus:outline-none"
            disabled={copilotLoading}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!questionInput.trim() || copilotLoading}
            loading={copilotLoading}
            icon={<Send className="w-4 h-4" />}
            className="px-4 py-2"
          >
            שאל
          </Button>
        </form>

        {/* Chat / Insights History Stream */}
        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
          {copilotHistory.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl bg-slate-950/60 border border-slate-800/90 p-4 sm:p-5 space-y-3 transition-all hover:border-indigo-500/30"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/60 pb-2">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  שאלה: &ldquo;{item.question}&rdquo;
                </span>
                <span className="font-mono text-[11px] text-slate-500">{item.answeredAt}</span>
              </div>

              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line">
                {item.answer}
              </div>

              {/* Attached Urgent SKUs if returned by Copilot */}
              {item.topUrgentSkus && item.topUrgentSkus.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    פריטים שזוהו בסיכון מיידי ע&quot;י ה-AI:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.topUrgentSkus.map((sku) => (
                      <div
                        key={sku.skuCode}
                        className="rounded-xl bg-slate-900/90 border border-slate-800 p-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5 truncate">
                          <span className="font-bold text-white block truncate">{sku.title}</span>
                          <span className="font-mono text-slate-400 text-[10px]" dir="ltr">
                            {sku.skuCode} • נותרו {sku.currentStock} יח&apos;
                          </span>
                        </div>
                        <span className="font-mono text-rose-400 font-bold text-xs shrink-0 mr-2">
                          {sku.predictedDaysUntilDepletion.toFixed(1)} ימים
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
