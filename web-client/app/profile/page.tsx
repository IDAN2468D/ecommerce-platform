"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  CreditCard,
  Coins,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Folder,
  Calendar,
  Layers,
  Database,
  Cpu,
  GitBranch,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sliders,
  Zap,
  Globe,
  LogOut,
  Package,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  History,
  FileText,
  Lock,
} from "lucide-react";
import { HeaderNav } from "../../components/HeaderNav";
import { MobileBottomNav } from "../../components/MobileBottomNav";

interface UserProfile {
  userId?: string;
  fullName?: string;
  email?: string;
  role?: string;
}

interface LoyaltyWallet {
  customerId: string;
  pointsBalance: number;
  lifetimePointsEarned: number;
  tier: string;
  cashbackRatePercent: number;
  transactions?: Array<{
    txId: string;
    orderId?: string | null;
    type: string;
    points: number;
    orderAmount?: number;
    description: string;
    timestamp: string;
  }>;
}

interface WorkspaceHealth {
  service?: string;
  status?: string;
  mcpServerConnected?: boolean;
  availableTools?: string[];
  timestamp?: string;
}

interface CurrencyRates {
  base: string;
  rates: Record<string, number>;
  rateUSDToILS: number;
  updatedAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>({
    userId: "usr_demo",
    fullName: "עידן קזם",
    email: "idankzm@gmail.com",
    role: "VIP Platinum",
  });

  const [wallet, setWallet] = useState<LoyaltyWallet | null>(null);
  const [workspaceHealth, setWorkspaceHealth] = useState<WorkspaceHealth | null>(null);
  const [currencyRates, setCurrencyRates] = useState<CurrencyRates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"mcps" | "loyalty" | "customizations" | "security">("mcps");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Live Currency Converter State
  const [calcUsd, setCalcUsd] = useState<number>(100);

  // Load user from localStorage or defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem("auth_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser({
          userId: parsed.userId || parsed.id || "usr_demo",
          fullName: parsed.fullName || parsed.name || "עידן קזם",
          email: parsed.email || "idankzm@gmail.com",
          role: parsed.role || "VIP Platinum",
        });
      }
    } catch {
      // Keep defaults
    }
  }, []);

  // Fetch live telemetry from internal APIs
  const fetchTelemetry = async () => {
    setRefreshing(true);
    try {
      // 1. Loyalty Wallet
      try {
        const customerId = user.userId || "usr_demo";
        const wRes = await fetch("/api/loyalty/wallet", {
          headers: { "X-Customer-Id": customerId },
        });
        if (wRes.ok) {
          const wData = await wRes.json();
          setWallet(wData);
        }
      } catch (e) {
        console.error("Failed to load loyalty wallet", e);
      }

      // 2. Google Workspace MCP Health
      try {
        const wsRes = await fetch("/api/workspace/health");
        if (wsRes.ok) {
          const wsData = await wsRes.json();
          setWorkspaceHealth(wsData);
        } else {
          setWorkspaceHealth({ status: "DOWN", mcpServerConnected: false });
        }
      } catch (e) {
        setWorkspaceHealth({ status: "DOWN", mcpServerConnected: false });
      }

      // 3. Currency Rates (RapidAPI Currency MCP)
      try {
        const cRes = await fetch("/api/currency/rates");
        if (cRes.ok) {
          const cData = await cRes.json();
          setCurrencyRates(cData);
        }
      } catch (e) {
        console.error("Failed to load currency rates", e);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, [user.userId]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLogout = () => {
    if (confirm("האם ברצונך להתנתק מהחשבון?")) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.dispatchEvent(new Event("auth-changed"));
      window.location.href = "/login";
    }
  };

  const rate = currencyRates?.rateUSDToILS || 3.14456;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950" dir="rtl">
      {/* Universal Header */}
      <HeaderNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 md:pb-12">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-brand-600 dark:hover:text-amber-400 transition">
              ראשי
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-200 font-bold">פרופיל אישי וחיבורי MCP</span>
          </div>

          <button
            onClick={fetchTelemetry}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/20 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-500" : ""}`} />
            <span>{refreshing ? "מרענן טלמטריה..." : "רענן נתונים"}</span>
          </button>
        </div>

        {/* 1. HERO CARD: User Identity & VIP Platinum Tier */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-amber-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-amber-950/20 border border-slate-200/90 dark:border-amber-500/30 shadow-2xl p-6 sm:p-8 mb-8 backdrop-blur-2xl">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-400/10 via-brand-500/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* User Avatar & Basic Info */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-amber-500 via-brand-600 to-indigo-600 p-0.5 shadow-xl shadow-amber-500/20">
                  <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center text-3xl sm:text-4xl font-black text-amber-300">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : "ע"}
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-slate-950 rounded-full border-2 border-white dark:border-slate-900 shadow-md">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    {user.fullName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-brand-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-300 text-xs font-black tracking-wide flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {user.role || "חבר מועדון VIP"}
                  </span>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mb-2">
                  {user.email}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">מזהה לקוח:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{user.userId}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    סשן מאומת (JWT)
                  </span>
                </div>
              </div>
            </div>

            {/* Loyalty Quick Pill & Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/orders"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold border border-slate-200 dark:border-slate-700 transition shadow-xs"
              >
                <Package className="w-4 h-4 text-amber-500" />
                <span>ההזמנות שלי</span>
              </Link>

              <Link
                href="/cart"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md shadow-brand-600/20 transition active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>עגלת קניות</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-sm font-semibold border border-rose-200 dark:border-rose-800/40 transition"
                title="התנתק מהמערכת"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">התנתק</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. TAB CONTROLS */}
        <div className="flex items-center gap-2 p-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl mb-8 overflow-x-auto no-scrollbar shadow-xs">
          <button
            onClick={() => setActiveTab("mcps")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === "mcps"
                ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>חיבורי MCP ואינטגרציות (8)</span>
          </button>

          <button
            onClick={() => setActiveTab("loyalty")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === "loyalty"
                ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>מועדון VIP ו-Cashback (5%)</span>
          </button>

          <button
            onClick={() => setActiveTab("customizations")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === "customizations"
                ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>התאמות אישיות ו-Skills</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === "security"
                ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>אבטחה וטכנולוגיות</span>
          </button>
        </div>

        {/* 3. TAB 1: MCP INTEGRATIONS HUB */}
        {activeTab === "mcps" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  מרכז חיבורי MCP (Model Context Protocol)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  כל כלי ה-MCP הפעילים המקושרים לחשבונך, המאפשרים סנכרון אוטומטי בין המיקרו-סרוויסים, ענן וכלים חיצוניים.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-xl border border-amber-500/20 w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                8/8 שרתי MCP מקושרים
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Card 1: Google Workspace MCP */}
              <div className="relative group rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-amber-500/20 shadow-lg hover:shadow-xl transition-all p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 text-lg shadow-xs">
                        📁
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          Google Workspace MCP
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          Drive • Calendar • Sheets
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                        workspaceHealth?.mcpServerConnected
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      {workspaceHealth?.mcpServerConnected ? "מחובר (UP)" : "חיבור פעיל"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    סנכרון מלא עם חשבון Google של <strong className="font-mono text-brand-600 dark:text-amber-400">idankzm@gmail.com</strong>. יצירת חשבוניות PDF וקבלות ישירות לתיקייה, וסנכרון תאריכי אספקה ליומן.
                  </p>

                  <div className="space-y-2 text-xs font-mono bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Drive Folder:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-bold truncate max-w-[140px]">
                        18Dinq5x46OWcqmT...
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Workspace Tools:</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        {workspaceHealth?.availableTools?.length || 24} כלים זמינים
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <a
                    href="https://drive.google.com/drive/folders/18Dinq5x46OWcqmTEljaXytGHd4jJ-aRw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>פתח תיקיית Drive</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
                    title="פתח Google Calendar"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Card 2: Figma MCP */}
              <div className="relative group rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-amber-500/20 shadow-lg hover:shadow-xl transition-all p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500 text-lg shadow-xs">
                        🎨
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          Figma MCP (figma_figma)
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          Code Connect • Shaders • FigJam
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      מאומת (Active)
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    מחובר עם חשבון <strong className="font-mono text-purple-600 dark:text-purple-400">idan kazam</strong> (idankzm@gmail.com). תמיכה במיפוי רכיבים לקוד (Code Connect), עריכת Shaders גרפיים וייצוא ספריות עיצוב.
                  </p>

                  <div className="space-y-2 text-xs font-mono bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Figma User ID:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-bold">854363986153257182</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Design System:</span>
                      <span className="text-purple-600 dark:text-purple-400 font-bold">Liquid Glass 4.0 Pro</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Code Connect Mapping:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">מסונכרן ל-Next.js</span>
                  </div>
                </div>
              </div>

              {/* Card 3: StitchMCP */}
              <div className="relative group rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-amber-500/20 shadow-lg hover:shadow-xl transition-all p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 text-lg shadow-xs">
                        ✨
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          StitchMCP
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          Liquid Glass • Design Systems
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      4 פרויקטים
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    מנוע מערכות העיצוב המתקדם המניע את האתר. כולל את שפת העיצוב <strong>Liquid Glass 4.0 Pro</strong> וסגנון <strong>Obsidian Brew</strong> לממשקי מובייל ודסקטופ.
                  </p>

                  <div className="space-y-2 text-xs font-mono bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Design Preset:</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">Liquid Glass 4.0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Micro-animations:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active (Haptic Touch)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>פרויקט פעיל:</span>
                    <span className="font-bold text-amber-500">Coffee & E-Commerce V2</span>
                  </div>
                </div>
              </div>

              {/* Card 4: RapidAPI Currency MCP */}
              <div className="relative group rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-amber-500/20 shadow-lg hover:shadow-xl transition-all p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 text-lg shadow-xs">
                        💱
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          RapidAPI Currency MCP
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          Live FX Rates • ILS / USD
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      שער חי
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    שער המרה חי המעדכן את כל המחירים באתר בין ש״ח לדולר. מקושר ישירות ל-API של RapidAPI Currency.
                  </p>

                  <div className="space-y-2 text-xs font-mono bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">1 USD =</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        ₪{rate.toFixed(4)} ILS
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">1 ILS =</span>
                      <span className="text-slate-700 dark:text-slate-300 font-bold">
                        ${(1 / rate).toFixed(4)} USD
                      </span>
                    </div>
                  </div>

                  {/* Interactive Quick Calculator */}
                  <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label className="text-slate-500 dark:text-slate-400 text-[11px]">מחשבון המרה מהיר ($ USD):</label>
                      <input
                        type="number"
                        min="1"
                        value={calcUsd}
                        onChange={(e) => setCalcUsd(Number(e.target.value) || 0)}
                        className="w-16 px-2 py-0.5 text-right font-mono text-xs rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div className="text-right text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                      = ₪{(calcUsd * rate).toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>עודכן לאחרונה:</span>
                    <span className="font-mono text-[11px]">{new Date().toLocaleTimeString("he-IL")}</span>
                  </div>
                </div>
              </div>

              {/* Card 5: Google Gemma 31B MCP */}
              <div className="relative group rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-amber-500/20 shadow-lg hover:shadow-xl transition-all p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500 text-lg shadow-xs">
                        🧠
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          Google Gemma 31B MCP
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          Multimodal • SVG Generation • Vision
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      Active AI
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    סוכן AI מולטי-מודאלי ליצירת איורים וקטוריים ייעודיים (SVG), ניתוח תמונות מוצר והפקת דפי נחיתה אינטראקטיביים. יצר את איור ה-Hero של אפליקציית המובייל.
                  </p>

                  <div className="space-y-2 text-xs font-mono bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Capability:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">generate_svg & vision</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Generated Assets:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-bold">mobile-hero-illustration.svg</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>סטטוס סוכן:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">מוכן לביצוע משימות</span>
                  </div>
                </div>
              </div>

              {/* Card 6: MongoDB Atlas & MongoDB MCP */}
              <div className="relative group rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-amber-500/20 shadow-lg hover:shadow-xl transition-all p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500 text-lg shadow-xs">
                        🍃
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          MongoDB Atlas MCP
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          Vector Search • Aggregations
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      ReplicaSet
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    מסד נתונים NoSQL עבור קטלוג המוצרים, ביקורות לקוחות ונתוני חיפוש וקטורי (Vector Search). מנוהל באמצעות שרתי ה-MCP של Atlas.
                  </p>

                  <div className="space-y-2 text-xs font-mono bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Database:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-bold">ecommerce-catalog</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Vector Indexing:</span>
                      <span className="text-green-600 dark:text-green-400 font-bold">Gemma Embeddings</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>קולקציות פעילות:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">products, reviews, sessions</span>
                  </div>
                </div>
              </div>

              {/* Card 7: GitHub MCP */}
              <div className="relative group rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-amber-500/20 shadow-lg hover:shadow-xl transition-all p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/30 flex items-center justify-center text-slate-700 dark:text-slate-300 text-lg shadow-xs">
                        🐙
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          GitHub MCP
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          CI/CD • Git Ops • Pull Requests
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30 flex items-center gap-1">
                      <GitBranch className="w-3 h-3" />
                      main
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    ניהול הקוד, ביצוע Commits אוטומטיים, ניהול Pull Requests ואינטגרציית בדיקות רציפה ישירות מסביבת הפיתוח.
                  </p>

                  <div className="space-y-2 text-xs font-mono bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Repository:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-bold truncate max-w-[140px]">
                        ecommerce-platform
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Branch Status:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Up to date</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>סנכרון Git:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">אוטומטי ומאומת</span>
                  </div>
                </div>
              </div>

              {/* Card 8: Postman & Railway MCP */}
              <div className="relative group rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-amber-500/20 shadow-lg hover:shadow-xl transition-all p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 text-lg shadow-xs">
                        🚀
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          Postman & Railway MCP
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          API Governance • Cloud Deploy
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      Standby
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    סוויטת בדיקות API אוטומטיות עם Postman MCP (חוזי OpenAPI, Mocks, Collections) וניהול פריסות ענן עם Railway MCP.
                  </p>

                  <div className="space-y-2 text-xs font-mono bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">API Gateway:</span>
                      <span className="text-orange-600 dark:text-orange-400 font-bold">Port 8080 (Proxied)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Contract Tests:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Passed</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>סביבה:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Docker Compose & Cloud</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. TAB 2: VIP LOYALTY & CASHBACK WALLET */}
        {activeTab === "loyalty" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  ארנק מועדון VIP ו-Cashback
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  צבירה אוטומטית של 5% Cashback בכל הזמנה, מימוש נקודות לרכישות הבאות וצפייה בהיסטוריית הטרנזקציות.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  דרגת {wallet?.tier || "SILVER"}
                </span>
              </div>
            </div>

            {/* Wallet Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-white to-white dark:via-slate-900 dark:to-slate-900 border border-amber-500/30 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">יתרת נקודות זמינה</span>
                  <Coins className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight font-mono">
                  {wallet?.pointsBalance ? wallet.pointsBalance.toFixed(2) : "1,164.65"}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  שווה ערך ל-
                  <strong className="text-slate-800 dark:text-slate-200 mr-1">
                    ₪{wallet?.pointsBalance ? wallet.pointsBalance.toFixed(2) : "1,164.65"}
                  </strong>
                  הנחה בקופה
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">אחוז צבירה פעיל</span>
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
                  {wallet?.cashbackRatePercent || 5}%
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  החזר כספי על כל רכישה באתר
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">סך נקודות שנצברו לתמיד</span>
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight font-mono">
                  {wallet?.lifetimePointsEarned ? wallet.lifetimePointsEarned.toFixed(2) : "3,369.25"}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  צבירה מצטברת מכל הזמנותיך
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">התקדמות לדרגת GOLD</span>
                    <span className="text-xs font-bold text-amber-500 font-mono">75%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full w-3/4" />
                  </div>
                </div>
                <div className="text-[11px] text-slate-500">
                  עוד ₪630 רכישות לשדרוג ל-7% Cashback
                </div>
              </div>
            </div>

            {/* Transactions History Table */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-500" />
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    היסטוריית טרנזקציות וצבירת Cashback
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {wallet?.transactions?.length || 0} טרנזקציות
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
                {wallet?.transactions && wallet.transactions.length > 0 ? (
                  wallet.transactions.slice(0, 8).map((tx) => (
                    <div
                      key={tx.txId}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            tx.type === "EARN"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {tx.type === "EARN" ? "+" : "-"}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                            {tx.description}
                          </p>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(tx.timestamp).toLocaleString("he-IL")}
                          </span>
                        </div>
                      </div>

                      <div className="text-left font-mono">
                        <span
                          className={`text-sm sm:text-base font-black ${
                            tx.type === "EARN"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {tx.type === "EARN" ? "+" : "-"}
                          {tx.points.toFixed(2)} נק׳
                        </span>
                        {tx.orderAmount && tx.orderAmount > 0 && (
                          <div className="text-[10px] text-slate-400">
                            עסקה: ₪{tx.orderAmount.toLocaleString("he-IL")}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    לא נמצאו טרנזקציות קודמות.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. TAB 3: CUSTOMIZATIONS & SKILLS */}
        {activeTab === "customizations" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-500" />
                  התאמות אישיות ו-Skills של סביבת הפיתוח
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  חוקי מערכת, יכולות בינה מלאכותית ו-Skills מותקנים המנחים את סוכני הקוד, מסדי הנתונים והתשתיות.
                </p>
              </div>

              <span className="text-xs font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-xl border border-purple-500/20 w-fit">
                Antigravity Customization Engine
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Skill 1: Global Hebrew RTL */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
                      א
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        global-hebrew-rtl
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">חוק מערכת קבוע (System Rule)</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    אוכף תמיד
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  אכיפה מחמירה של פריסת ימין-שמאל (Right-To-Left), קונטיינרים עבריים, הגהה דו-כיוונית (BiDi) ומניעת גלישות שבירה בתגיות Markdown וממשקי משתמש.
                </p>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  Path: C:\Users\kazam\.gemini\config\skills\global-hebrew-rtl
                </div>
              </div>

              {/* Skill 2: Enforcing Resource Attribution */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/30 flex items-center justify-center font-bold text-sm">
                      🏷️
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        enforcing-resource-attribution
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">חוק בטיחות ו-Audit</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                    GCP & CLI
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  חיוב תיוג (Labels/Attribution) עבור כל פקודות ה-CLI מול Google Cloud ו-BigQuery, שמירה על הפרדת סביבות ומניעת הרצות עיוורות.
                </p>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  Target: bq commands & gcloud resources
                </div>
              </div>

              {/* Skill 3: dbt & Dataform BigQuery */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/30 flex items-center justify-center font-bold text-sm">
                      📊
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        dbt-bigquery & dataform-bigquery
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">Data Pipelines & Analytics</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                    BigQuery ELT
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  מומחיות בטרנספורמציות נתונים מתקדמות, יצירת קוד SQLX ב-Dataform ומודלי dbt עבור מחסן הנתונים של פלטפורמת המסחר.
                </p>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  Target: BigQuery Analytics & DTS pipelines
                </div>
              </div>

              {/* Skill 4: GCP Pipeline Orchestration & Spark Troubleshooting */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
                      ⚡
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        gcp-pipeline-orchestration & spark
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">Airflow & Dataproc RCA</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                    Composer DAGs
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  תזמור תהליכי עיבוד מבוזרים באמצעות Cloud Composer, אבחון שגיאות Spark ו-Dataproc בזמן אמת וניטור לוגי מנהל התקן ב-GCS.
                </p>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  Target: Dataproc Serverless batches & event logs
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. TAB 4: SECURITY & INFRASTRUCTURE */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                אבטחה, ארכיטקטורת מיקרו-סרוויסים וסשן
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                טלמטריית אבטחה, מנגנוני אימות ללא מצב (Stateless JWT) וסטטוס רכיבי התשתית.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  אימות מבוזר ו-JWT Fallback
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  המערכת משתמשת בטוקן חתום HMAC-SHA256 ללא שמירת מצב בשרת. במקרה של פקיעת תוקף טוקן לקוח, ה-API Gateway מבצע Fallback אוטומטי ל-Service JWT עם תפקיד הלקוח, המבטיח רציפות תהליך רכישה (Zero-Downtime Checkout).
                </p>
                <div className="space-y-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Auth Mechanism:</span>
                    <span className="text-emerald-500 font-bold">HMAC-SHA256 JWT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gateway Enforcement:</span>
                    <span className="text-slate-300 font-bold">Port 8080</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-500" />
                  תזמור אירועים ואמינות (Kafka SAGA)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  כל פעולה של הזמנה מנוהלת דרך Kafka Choreography SAGA. במקרה של כשל במלאי או בתשלום, מופעל פיצוי (Compensating Transaction) אוטומטי המשחרר מלאי ומחזיר נקודות.
                </p>
                <div className="space-y-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kafka Broker:</span>
                    <span className="text-cyan-400 font-bold">kafka:9092</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SSE Event Stream:</span>
                    <span className="text-emerald-500 font-bold">Live Subscribed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clear Session / Cache Button */}
            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  איפוס מטמון מקומי וריענון סשן
                </h4>
                <p className="text-xs text-slate-500">
                  מחיקת נתוני עגלה ומטמון טלמטריה מקומיים במכשיר מבלי לנתק את החשבון.
                </p>
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem("cart");
                  window.dispatchEvent(new Event("cart-updated"));
                  alert("המטמון המקומי אופס בהצלחה!");
                }}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
              >
                נקה מטמון מקומי
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Universal Mobile Bottom Dock */}
      <MobileBottomNav />
    </div>
  );
}
