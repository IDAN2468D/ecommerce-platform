"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Zap,
  Users,
  Bot,
  Gavel,
  Gift,
  Eye,
  CreditCard,
  CheckCircle2,
  Activity,
  RefreshCw,
} from "lucide-react";

export const HeroBanner: React.FC = () => {
  const [secondsLeft, setSecondsLeft] = useState(5068); // 01:24:28 live countdown
  const [snipeLocked, setSnipeLocked] = useState(false);
  const [activeAgentIdx, setActiveAgentIdx] = useState(0);

  const SWARM_AGENTS_TICKER = [
    { name: "AuctionSniperFlashAgent", label: "סוכן צלף מכרזים חי", ms: "9ms", icon: "⚡" },
    { name: "BnplFinancialAdvisorAgent", label: "יועץ אשראי 4-Pay BNPL", ms: "11ms", icon: "💳" },
    { name: "GroupSquadMatchmakerAgent", label: "שדכן קבוצות רכישה (-28%)", ms: "14ms", icon: "👥" },
    { name: "WarrantyEscrowArbitratorAgent", label: "בורר נאמנות SHA-256", ms: "8ms", icon: "🛡️" },
    { name: "TradeInValuationAgent", label: "שמאי טרייד-אין ויזואלי", ms: "16ms", icon: "♻️" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 10 ? prev - 1 : 5068));
    }, 1000);
    const agentInterval = setInterval(() => {
      setActiveAgentIdx((prev) => (prev + 1) % SWARM_AGENTS_TICKER.length);
    }, 2800);
    return () => {
      clearInterval(timer);
      clearInterval(agentInterval);
    };
  }, []);

  const formatCountdown = (totalSec: number) => {
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSec % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const handleScrollToCatalog = () => {
    const el = document.getElementById("catalog-products");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 520, behavior: "smooth" });
    }
  };

  const handleTriggerSwarmPrompt = (prompt: string) => {
    window.dispatchEvent(
      new CustomEvent("open-rag-drawer", {
        detail: { initialQuery: prompt },
      })
    );
  };

  const handleOpenRoomVisualizer = () => {
    window.dispatchEvent(
      new CustomEvent("open-room-visualizer", {
        detail: { productName: "Apple MacBook Pro 16 M3 Max / Sony WH-1000XM5" },
      })
    );
  };

  return (
    <div
      className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-[#0a0f1e] to-indigo-950 text-white p-5 sm:p-8 lg:p-10 shadow-2xl border border-slate-800/90 dark:border-amber-500/25"
      dir="rtl"
    >
      {/* Ambient Glow Orbs */}
      <div className="absolute -top-24 -end-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -start-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Interactive Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
        {/* TILE 1: Main Command Showcase (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-emerald-500/20 text-amber-300 text-xs font-black border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Enterprise v7.0 • 25 מיקרו-שירותים • 15 סוכני AI אוטונומיים</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>SAGA & Smart Escrow פעיל</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15] text-white">
              זירת המסחר האוטונומית <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                מונחית נחיל 15 סוכני AI
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              חוויית קנייה מהדור הבא: צליפת מכרזים בזמן אמת, פריסת תשלומי <code className="text-amber-300 font-mono">BNPL 0%</code>, רכישה קבוצתית חברתית, הדמיית מוצרים בחלל החדר (<code className="text-cyan-300 font-mono">Gemini Vision AR</code>), שמאות טרייד-אין מיידית ותעודת אחריות דיגיטלית חתומה ב-<code className="text-emerald-300 font-mono">SHA-256</code>.
            </p>

            {/* Quick AI Swarm Command Pills */}
            <div className="pt-1 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 font-mono block">
                ⚡ הפעלה מהירה של סוכני ה-Swarm בלחיצה אחת:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    icon: "🎯",
                    label: "צלף לי מכרז חי",
                    prompt: "תפעיל את סוכן צלף המכרזים על MacBook Pro ותנעל לי מלאי ב-Flash Sale",
                  },
                  {
                    icon: "💳",
                    label: "חיתום BNPL ב-0% ריבית",
                    prompt: "תבדוק לי זכאות לפריסת BNPL ב-4 תשלומים ללא ריבית ושילוב קופון VIP",
                  },
                  {
                    icon: "♻️",
                    label: "שמאות טרייד-אין חכמה",
                    prompt: "כמה שווה האייפון או המקבוק הישן שלי בטרייד-אין לקיזוז מיידי בקופה?",
                  },
                  {
                    icon: "👥",
                    label: "שדך לי קבוצת רכישה",
                    prompt: "תמצא לי קבוצת רכישה פתוחה עם הנחת 28% ותצרף אותי לחדר הפעיל",
                  },
                ].map((cmd, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTriggerSwarmPrompt(cmd.prompt)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950/90 hover:bg-indigo-950/80 text-slate-200 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>{cmd.icon}</span>
                    <span>{cmd.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Primary CTA Dock */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleScrollToCatalog}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 hover:scale-102 active:scale-95 transition flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span>קטלוג חכם</span>
            </button>

            <Link
              href="/arena"
              className="px-4 py-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 font-bold text-xs sm:text-sm border border-rose-500/30 transition flex items-center gap-1.5 active:scale-95"
            >
              <Gavel className="w-4 h-4 text-rose-400" />
              <span>זירת מכרזים ו-Flash</span>
            </Link>

            <Link
              href="/gifting"
              className="px-4 py-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 font-bold text-xs sm:text-sm border border-emerald-500/30 transition flex items-center gap-1.5 active:scale-95"
            >
              <Gift className="w-4 h-4 text-emerald-400" />
              <span>מתנות, טרייד-אין ו-B2B</span>
            </Link>

            <button
              type="button"
              onClick={handleOpenRoomVisualizer}
              className="px-4 py-3 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 font-bold text-xs sm:text-sm border border-cyan-500/30 transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>הדמיה בחדר (AI AR)</span>
            </button>
          </div>
        </div>

        {/* RIGHT BENTO COLUMN (5 Cols): Live Interactive Microservice Widgets */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* TILE 2: Flash Drop & Live Auction Sniper Widget (Full width of 5 cols) */}
          <div className="sm:col-span-2 rounded-3xl bg-gradient-to-r from-slate-900/90 via-rose-950/30 to-slate-900/90 border border-rose-500/30 p-5 flex flex-col justify-between space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-black text-rose-300 uppercase tracking-wide">
                  LIVE FLASH AUCTION • זירת מכרזים חיה
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-slate-950/90 border border-rose-500/40 font-mono text-xs font-black text-amber-400">
                ⏱️ {formatCountdown(secondsLeft)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">
                  Apple MacBook Pro 16 M3 Max
                </h3>
                <p className="text-[11px] text-slate-400">
                  הצעה נוכחית: <strong className="text-emerald-400 font-mono">₪8,450</strong> (מחירון ₪11,900 • 14 מציעים)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSnipeLocked(true)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  snipeLocked
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-slate-950 shadow-lg shadow-rose-500/20"
                }`}
              >
                {snipeLocked ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>צלף AI דרוך!</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>הפעל Auto-Snipe</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* TILE 3: Social Group Squad Progress */}
          <div className="rounded-3xl bg-slate-900/80 border border-indigo-500/30 p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>קבוצת רכישה חיה</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">
                -28% הנחה
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Sony WH-1000XM5</span>
                <strong className="text-amber-400 font-mono">8/10 הצטרפו</strong>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" />
              </div>
              <p className="text-[10px] text-slate-400">נותרו 2 מקומות לנעילת מחיר קבוצתי של ₪1,070</p>
            </div>

            <Link
              href="/arena"
              className="w-full py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-center text-xs font-bold text-indigo-200 transition"
            >
              הצטרף לחדר הקבוצה →
            </Link>
          </div>

          {/* TILE 4: FinTech BNPL + Trade-In & SHA-256 Escrow */}
          <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>FinTech & Trade-In</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                SHA-256
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-slate-300">
              <div className="flex items-center justify-between">
                <span>💳 פריסת BNPL:</span>
                <strong className="text-amber-300 font-mono">4 × 0% ריבית</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>♻️ זיכוי טרייד-אין:</span>
                <strong className="text-emerald-300 font-mono">עד ₪4,200</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>🔐 חשבון נאמנות:</span>
                <strong className="text-cyan-300 font-mono">Smart Escrow</strong>
              </div>
            </div>

            <Link
              href="/gifting"
              className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-center text-xs font-bold text-emerald-200 transition"
            >
              מחשבון טרייד-אין ומתנות →
            </Link>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR: Live 15-Agent Swarm Telemetry & Command Strip */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Bot className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black text-slate-200">נחיל 15 סוכנים בזמן אמת:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-indigo-500/30 text-indigo-200 font-mono text-[11px]">
              <span>{SWARM_AGENTS_TICKER[activeAgentIdx].icon}</span>
              <strong>{SWARM_AGENTS_TICKER[activeAgentIdx].label}</strong>
              <span className="text-emerald-400">({SWARM_AGENTS_TICKER[activeAgentIdx].ms})</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 font-bold text-[11px] transition"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>חדר בקרה (26 שירותים)</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
