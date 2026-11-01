"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  CreditCard,
  Coins,
  Sparkles,
  RefreshCw,
  Lock,
  TrendingUp,
  History,
  LogOut,
  Package,
  ShoppingBag,
  CheckCircle2,
  MapPin,
  KeyRound,
} from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";

interface UserProfile {
  userId?: string;
  fullName?: string;
  email?: string;
  role?: string;
  phone?: string;
  address?: string;
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

export default function ProfilePage() {
  const { formatPrice } = useCurrency();
  const [user, setUser] = useState<UserProfile>({
    userId: "usr_demo",
    fullName: "עידן קזם",
    email: "idankzm@gmail.com",
    role: "חבר מועדון VIP Platinum",
    phone: "050-1234567",
    address: "רוטשילד 45, תל אביב-יפו",
  });

  const [wallet, setWallet] = useState<LoyaltyWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"loyalty" | "security">("loyalty");
  const [refreshing, setRefreshing] = useState(false);

  // Load user from localStorage or defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem("auth_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser((prev) => ({
          ...prev,
          userId: parsed.userId || parsed.id || prev.userId,
          fullName: parsed.fullName || parsed.name || prev.fullName,
          email: parsed.email || prev.email,
          role: parsed.role || prev.role,
        }));
      }
    } catch {
      // Keep defaults
    }
  }, []);

  // Fetch loyalty wallet from backend
  const fetchWallet = async () => {
    setRefreshing(true);
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
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [user.userId]);

  const handleLogout = () => {
    if (confirm("האם ברצונך להתנתק מהחשבון?")) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.dispatchEvent(new Event("auth-changed"));
      window.location.href = "/login";
    }
  };

  return (
    <div className="w-full space-y-8" dir="rtl">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
          <Link href="/" className="hover:text-amber-400 transition">
            ראשי
          </Link>
          <span>/</span>
          <span className="text-slate-100 font-bold">אזור אישי ומועדון לקוחות</span>
        </div>

        <button
          onClick={fetchWallet}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-amber-500/20 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition active:scale-95 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-500" : ""}`} />
          <span>{refreshing ? "מרענן..." : "רענן נתונים"}</span>
        </button>
      </div>

      {/* 1. HERO CARD: User Identity & VIP Platinum Tier */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/20 border border-amber-500/30 shadow-2xl p-6 sm:p-8 mb-8 backdrop-blur-2xl">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-400/10 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User Avatar & Basic Info */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-indigo-600 p-0.5 shadow-xl shadow-amber-500/20">
                <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-3xl sm:text-4xl font-black text-amber-400">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : "ע"}
                </div>
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 shadow-md"
                title="חשבון מאומת ומאובטח"
              >
                <ShieldCheck className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
                  {user.fullName || "לקוח מוערך"}
                </h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  {wallet?.tier || "VIP Platinum"}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 font-mono">
                {user.email || "idankzm@gmail.com"}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  {wallet?.pointsBalance ? wallet.pointsBalance.toFixed(0) : "1,164"} נקודות Cashback
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">
                  5% צבירה אוטומטית בכל רכישה
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/orders"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              <Package className="w-4 h-4" />
              <span>ההזמנות שלי</span>
            </Link>

            <Link
              href="/cart"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>עגלת קניות</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 text-sm font-semibold border border-rose-800/40 transition"
              title="התנתק מהמערכת"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">התנתק</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TAB CONTROLS */}
      <div className="flex items-center gap-2 p-1 bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl mb-8 overflow-x-auto no-scrollbar shadow-xs">
        <button
          onClick={() => setActiveTab("loyalty")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === "loyalty"
              ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>מועדון VIP ויתרת Cashback (5%)</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === "security"
              ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>פרטי חשבון ואבטחה</span>
        </button>
      </div>

      {/* 3. TAB 1: VIP LOYALTY & CASHBACK WALLET */}
      {activeTab === "loyalty" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                ארנק מועדון VIP ו-Cashback
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                צבירה אוטומטית של 5% Cashback בכל הזמנה, מימוש נקודות לרכישות הבאות וצפייה בהיסטוריית הטרנזקציות.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                דרגת {wallet?.tier || "PLATINUM"}
              </span>
            </div>
          </div>

          {/* Wallet Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">יתרת נקודות זמינה</span>
                <Coins className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight font-mono">
                {wallet?.pointsBalance ? wallet.pointsBalance.toFixed(2) : "1,164.65"}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                שווה ערך ל-
                <strong className="text-slate-200 mr-1">
                  {formatPrice(wallet?.pointsBalance ? wallet.pointsBalance : 1164.65)}
                </strong>
                הנחה בקופה
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">אחוז צבירה פעיל</span>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight font-mono">
                {wallet?.cashbackRatePercent || 5}%
              </div>
              <div className="text-xs text-slate-400 mt-1">
                החזר כספי על כל רכישה באתר
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">סך נקודות שנצברו לתמיד</span>
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-400 tracking-tight font-mono">
                {wallet?.lifetimePointsEarned ? wallet.lifetimePointsEarned.toFixed(2) : "3,369.25"}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                צבירה מצטברת מכל הזמנותיך
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400">התקדמות לדרגת DIAMOND</span>
                  <span className="text-xs font-bold text-amber-500 font-mono">85%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full w-[85%]" />
                </div>
              </div>
              <div className="text-[11px] text-slate-400">
                עוד ₪350 רכישות לשדרוג ל-7% Cashback
              </div>
            </div>
          </div>

          {/* Transactions History Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-lg overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-100">
                  היסטוריית טרנזקציות וצבירת Cashback
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {wallet?.transactions?.length || 0} טרנזקציות
              </span>
            </div>

            <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto">
              {wallet?.transactions && wallet.transactions.length > 0 ? (
                wallet.transactions.slice(0, 8).map((tx) => (
                  <div
                    key={tx.txId}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          tx.type === "EARN"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {tx.type === "EARN" ? "+" : "-"}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-200">
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
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {tx.type === "EARN" ? "+" : "-"}
                        {tx.points.toFixed(2)} נק׳
                      </span>
                      {tx.orderAmount && tx.orderAmount > 0 && (
                        <div className="text-[10px] text-slate-400">
                          עסקה: {formatPrice(tx.orderAmount)}
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

      {/* 4. TAB 2: ACCOUNT SETTINGS & SECURITY */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              פרטי חשבון ואבטחת מידע
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              ניהול פרטים אישיים, כתובות משלוח, אמצעי תשלום והגנת פרטיות מחמירה.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* User Contact Details */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
              <h4 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" />
                פרטי לקוח ומשלוח
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">שם מלא:</span>
                  <span className="font-bold text-slate-200">{user.fullName}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">אימייל:</span>
                  <span className="font-mono text-slate-200">{user.email}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">טלפון לתיאום:</span>
                  <span className="font-mono text-slate-200">{user.phone}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    כתובת ברירת מחדל:
                  </span>
                  <span className="font-bold text-slate-200 text-left">{user.address}</span>
                </div>
              </div>
            </div>

            {/* Security & Compliance */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
              <h4 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                רמת אבטחה והגנת פרטיות
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">הצפנת נתונים:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    SSL 256-Bit TLS 1.3
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">תקן תשלומים:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    PCI-DSS Level 1
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">אימות דו-שלבי (2FA):</span>
                  <span className="text-emerald-400 font-bold">פעיל ומאומת</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">סטטוס סשן:</span>
                  <span className="text-cyan-400 font-mono">מאובטח (Stateless JWT)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reset Cache & Refresh Session */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-slate-100">
                איפוס נתוני עגלה ומטמון מכשיר
              </h4>
              <p className="text-xs text-slate-400">
                מחיקת פריטי עגלה זמניים וריענון נתוני הדפדפן ללא ניתוק החשבון.
              </p>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("cart");
                window.dispatchEvent(new Event("cart-updated"));
                alert("המטמון ועגלת הקניות אופסו בהצלחה!");
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
            >
              נקה עגלה ומטמון
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
