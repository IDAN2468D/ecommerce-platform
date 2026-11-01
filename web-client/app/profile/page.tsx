"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Coins,
  Lock,
  RefreshCw,
  History,
  ShieldCheck,
  User,
  MapPin,
  CheckCircle2,
  Package,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";
import { VipMembershipCard } from "../../components/store/VipMembershipCard";

interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  phone: string;
  address: string;
}

interface LoyaltyWallet {
  customerId: string;
  pointsBalance: number;
  lifetimePointsEarned: number;
  tier: string;
  cashbackRatePercent: number;
  transactions?: Array<{
    txId: string;
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
  const [activeTab, setActiveTab] = useState<"loyalty" | "security">("loyalty");
  const [refreshing, setRefreshing] = useState(false);

  const fetchWallet = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/loyalty/wallet", {
        headers: { "X-Customer-Id": user.userId },
      });
      if (res.ok) setWallet(await res.json());
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("auth_user");
      if (stored) {
        const p = JSON.parse(stored);
        setUser((prev) => ({ ...prev, fullName: p.fullName || prev.fullName, email: p.email || prev.email }));
      }
    } catch {}
    fetchWallet();
  }, []);

  const handleLogout = () => {
    if (confirm("האם ברצונך להתנתק מהחשבון?")) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.dispatchEvent(new Event("auth-changed"));
      window.location.href = "/login";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16" dir="rtl">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">אזור אישי ומועדון לקוחות VIP</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            ניהול צבירת 5% Cashback, היסטוריית טרנזקציות, פרטי חשבון ואבטחת מידע
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/orders" className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition">
            ההזמנות שלי
          </Link>
          <button onClick={handleLogout} className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 transition">
            התנתק
          </button>
        </div>
      </div>

      {/* 1. Holographic VIP Pass Card */}
      <VipMembershipCard
        fullName={user.fullName}
        userId={user.userId}
        tier={wallet?.tier || "VIP PLATINUM"}
        pointsBalance={wallet?.pointsBalance ?? 1164.65}
        lifetimePoints={wallet?.lifetimePointsEarned ?? 3369.25}
        cashbackRatePercent={wallet?.cashbackRatePercent ?? 5}
      />

      {/* 2. Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab("loyalty")}
          className={`flex-1 py-2.5 rounded-xl transition ${
            activeTab === "loyalty"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-amber-400 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          ארנק Cashback וטרנזקציות
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex-1 py-2.5 rounded-xl transition ${
            activeTab === "security"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-amber-400 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          פרטי חשבון ואבטחה
        </button>
      </div>

      {/* 3. Tab 1: Loyalty Transactions History */}
      {activeTab === "loyalty" && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-500" />
              <span>היסטוריית צבירת נקודות Cashback</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">{wallet?.transactions?.length || 0} טרנזקציות</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
            {wallet?.transactions && wallet.transactions.length > 0 ? (
              wallet.transactions.slice(0, 8).map((tx) => (
                <div key={tx.txId} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{tx.description}</p>
                    <span className="text-[11px] text-slate-400 font-mono">{new Date(tx.timestamp).toLocaleString("he-IL")}</span>
                  </div>
                  <span className={`font-mono font-black text-sm ${tx.type === "EARN" ? "text-emerald-500" : "text-rose-500"}`}>
                    {tx.type === "EARN" ? "+" : "-"}{tx.points.toFixed(2)} נק׳
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">אין טרנזקציות קודמות עדיין.</div>
            )}
          </div>
        </div>
      )}

      {/* 4. Tab 2: Security & Profile Details */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-md">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" />
              <span>פרטי לקוח ומשלוח</span>
            </h4>
            <div className="space-y-2 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span>שם מלא:</span>
                <strong className="text-slate-900 dark:text-slate-100">{user.fullName}</strong>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span>אימייל:</span>
                <span className="font-mono">{user.email}</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span>טלפון:</span>
                <span className="font-mono">{user.phone}</span>
              </div>
              <div className="flex justify-between">
                <span>כתובת:</span>
                <span>{user.address}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-md">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>אבטחה והגנת פרטיות</span>
            </h4>
            <div className="space-y-2 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span>הצפנת נתונים:</span>
                <span className="text-emerald-500 font-bold">SSL 256-Bit TLS 1.3</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span>תקן תשלומים:</span>
                <span className="text-emerald-500 font-bold">PCI-DSS Level 1</span>
              </div>
              <div className="flex justify-between">
                <span>אימות חשבון:</span>
                <span className="text-cyan-500 font-bold">פעיל ומאומת</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
