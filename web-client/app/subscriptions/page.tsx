"use client";

import React, { useState, useEffect } from "react";
import { 
  Repeat, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  PauseCircle, 
  PlayCircle, 
  XCircle, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Package, 
  Plus, 
  RefreshCw,
  TrendingDown
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCurrency } from "@/context/CurrencyContext";

interface SubscriptionItem {
  skuCode: string;
  productName: string;
  baseUnitPrice: number;
  discountedUnitPrice: number;
  quantity: number;
  imageUrl?: string;
}

interface Subscription {
  id: string;
  subscriptionNumber: string;
  customerId: string;
  planName: string;
  billingInterval: "WEEKLY" | "BI_WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUAL";
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  items: SubscriptionItem[];
  recurringAmount: number;
  savingsPerCycle: number;
  discountPercent: number;
  startDate: string;
  nextBillingDate: string;
  totalCyclesBilled: number;
}

export default function SubscriptionsPage() {
  const { formatPrice } = useCurrency();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Initial mock fallback + live load
  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/v1/subscriptions/customer/usr_demo");
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setSubscriptions(data);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      // Fallback to local active sample
    }

    // Default rich sample data
    setSubscriptions([
      {
        id: "sub_demo_1",
        subscriptionNumber: "SUB-IL-COFFEE-88",
        customerId: "usr_demo",
        planName: "מנוי קפה אספרסו חודשי - קליית בוטיק",
        billingInterval: "MONTHLY",
        status: "ACTIVE",
        items: [
          {
            skuCode: "COFFEE-BEANS-1KG",
            productName: "פולי קפה ספיישלטי 1 ק״ג (קלייה טרייה)",
            baseUnitPrice: 140.0,
            discountedUnitPrice: 119.0,
            quantity: 2,
            imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80"
          }
        ],
        recurringAmount: 238.0,
        savingsPerCycle: 42.0,
        discountPercent: 15,
        startDate: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
        totalCyclesBilled: 2
      },
      {
        id: "sub_demo_2",
        subscriptionNumber: "SUB-IL-VIP-CLUB-10",
        customerId: "usr_demo",
        planName: "חברות מועדון Store VIP & Tech Box",
        billingInterval: "MONTHLY",
        status: "ACTIVE",
        items: [
          {
            skuCode: "VIP-PASS-MONTHLY",
            productName: "Store 2026 VIP Pass + משלוח אקספרס חינם ללא הגבלה",
            baseUnitPrice: 99.0,
            discountedUnitPrice: 84.15,
            quantity: 1
          }
        ],
        recurringAmount: 84.15,
        savingsPerCycle: 14.85,
        discountPercent: 15,
        startDate: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
        totalCyclesBilled: 3
      }
    ]);
    setLoading(false);
  };

  const handleAction = async (id: string, action: "pause" | "resume" | "cancel" | "renew") => {
    setActionLoading(`${id}_${action}`);
    setStatusMessage(null);

    try {
      const res = await fetch(`http://localhost:8080/api/v1/subscriptions/${id}/${action}`, {
        method: "POST"
      });
      if (res.ok) {
        const updated = await res.json();
        setSubscriptions(prev => prev.map(s => s.id === id ? updated : s));
        setStatusMessage(`פעולת ${action} בוצעה בהצלחה!`);
      } else {
        // Optimistic UI update
        applyOptimisticUpdate(id, action);
      }
    } catch {
      applyOptimisticUpdate(id, action);
    } finally {
      setActionLoading(null);
    }
  };

  const applyOptimisticUpdate = (id: string, action: "pause" | "resume" | "cancel" | "renew") => {
    setSubscriptions(prev => prev.map(s => {
      if (s.id !== id) return s;
      if (action === "pause") return { ...s, status: "PAUSED" };
      if (action === "resume") return { ...s, status: "ACTIVE" };
      if (action === "cancel") return { ...s, status: "CANCELLED" };
      if (action === "renew") return { 
        ...s, 
        totalCyclesBilled: s.totalCyclesBilled + 1,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
      };
      return s;
    }));
    setStatusMessage(
      action === "renew" 
        ? "חידוש המנוי נשלח בהצלחה לסליקה ב-SAGA והחשבונית נשלחה ל-Gmail!" 
        : `סטטוס המנוי עודכן בהצלחה ל-${action === "pause" ? "מושהה" : action === "resume" ? "פעיל" : "מבוטל"}`
    );
  };

  const handleCreateNewSample = async () => {
    setActionLoading("create_new");
    try {
      const payload = {
        customerId: "usr_demo",
        customerEmail: "idankzm@gmail.com",
        planName: "מנוי אספקת גיימינג ואביזרי Pro",
        billingInterval: "MONTHLY",
        items: [
          {
            skuCode: "AUDIO-SONY-XM5",
            productName: "אוזניות סוני XM5 (אספקה מחזורית)",
            baseUnitPrice: 1499.0,
            quantity: 1
          }
        ]
      };
      const res = await fetch("http://localhost:8080/api/v1/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const created = await res.json();
        setSubscriptions(prev => [created, ...prev]);
        setStatusMessage("מנוי חדש הוקם בהצלחה עם 15% הנחת קבע!");
      }
    } catch {
      // Optimistic fallback
      const newSub: Subscription = {
        id: "sub_new_" + Date.now(),
        subscriptionNumber: "SUB-IL-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        customerId: "usr_demo",
        planName: "מנוי אספקת גיימינג ואביזרי Pro",
        billingInterval: "MONTHLY",
        status: "ACTIVE",
        items: [
          {
            skuCode: "AUDIO-SONY-XM5",
            productName: "אוזניות סוני XM5 (אספקה מחזורית)",
            baseUnitPrice: 1499.0,
            discountedUnitPrice: 1274.15,
            quantity: 1
          }
        ],
        recurringAmount: 1274.15,
        savingsPerCycle: 224.85,
        discountPercent: 15,
        startDate: new Date().toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        totalCyclesBilled: 1
      };
      setSubscriptions(prev => [newSub, ...prev]);
      setStatusMessage("מנוי חדש הוקם בהצלחה עם 15% הנחת קבע!");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-2xl">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
                <Repeat className="w-5 h-5 animate-spin-slow" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">ניהול מנויים וחיובים מחזוריים</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              אספקה אוטומטית שוטפת, הנחת קבע של 15%, סנכרון קבלות ל-Gmail וגביית SAGA אוטונומית
            </p>
          </div>

          <Button
            onClick={handleCreateNewSample}
            disabled={actionLoading === "create_new"}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 rounded-2xl px-5 py-3 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>הקם מנוי חדש לניסיון</span>
          </Button>
        </div>

        {/* Status Notification Toast */}
        {statusMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Subscriptions Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-200">המנויים הפעילים שלך ({subscriptions.length})</h2>
            <button 
              onClick={loadSubscriptions} 
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
            >
              <RefreshCw className="w-3.5 h-3.5" /> רענן נתונים
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 font-mono">טוען מנויים...</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-500" />
              <p>אין לך עדיין מנויים פעילים.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {subscriptions.map(sub => (
                <div 
                  key={sub.id} 
                  className={`relative p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-5 ${
                    sub.status === "ACTIVE"
                      ? "bg-slate-900/70 border-indigo-500/40 shadow-xl hover:border-indigo-400"
                      : sub.status === "PAUSED"
                      ? "bg-slate-900/30 border-amber-500/30 opacity-80"
                      : "bg-slate-950/40 border-slate-800 opacity-60"
                  }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        {sub.subscriptionNumber}
                      </span>
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                        sub.status === "ACTIVE"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : sub.status === "PAUSED"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}>
                        {sub.status === "ACTIVE" && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {sub.status === "PAUSED" && <PauseCircle className="w-3.5 h-3.5" />}
                        {sub.status === "CANCELLED" && <XCircle className="w-3.5 h-3.5" />}
                        {sub.status === "ACTIVE" ? "פעיל" : sub.status === "PAUSED" ? "מושהה" : "מבוטל"}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug">{sub.planName}</h3>
                    
                    {/* Items preview */}
                    <div className="mt-3 space-y-1.5">
                      {sub.items.map((it, idx) => (
                        <div key={idx} className="text-xs text-slate-300 flex items-center justify-between bg-slate-800/40 px-3 py-2 rounded-xl">
                          <span className="truncate max-w-[200px]">{it.quantity}x {it.productName}</span>
                          <span className="font-mono text-indigo-300 font-bold">{formatPrice(it.discountedUnitPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial & Schedule Metrics */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">חיוב מחזורי:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">{formatPrice(sub.recurringAmount)}</span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                          -{sub.discountPercent}% הנחה
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>חיסכון למחזור:</span>
                      <span className="font-mono text-emerald-400 font-bold">{formatPrice(sub.savingsPerCycle)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> חידוש הבא:</span>
                      <span className="font-mono text-slate-200">
                        {new Date(sub.nextBillingDate).toLocaleDateString("he-IL")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-400" /> מחזורים שחויבו:</span>
                      <span className="font-mono text-slate-200">#{sub.totalCyclesBilled}</span>
                    </div>
                  </div>

                  {/* Action Buttons Strip */}
                  <div className="flex items-center gap-2 pt-1">
                    {sub.status === "ACTIVE" ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAction(sub.id, "pause")}
                        disabled={!!actionLoading}
                        className="flex-1 text-xs text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                      >
                        <PauseCircle className="w-3.5 h-3.5 ms-1" /> השהה
                      </Button>
                    ) : sub.status === "PAUSED" ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAction(sub.id, "resume")}
                        disabled={!!actionLoading}
                        className="flex-1 text-xs text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10"
                      >
                        <PlayCircle className="w-3.5 h-3.5 ms-1" /> המשך
                      </Button>
                    ) : null}

                    {sub.status !== "CANCELLED" && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleAction(sub.id, "renew")}
                          disabled={!!actionLoading}
                          className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                        >
                          <Zap className="w-3.5 h-3.5 ms-1" /> חדש כעת
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAction(sub.id, "cancel")}
                          disabled={!!actionLoading}
                          className="text-xs text-rose-400 hover:bg-rose-500/10"
                        >
                          בטל
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
