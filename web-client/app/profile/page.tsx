"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  History,
  ShieldCheck,
  User,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  Lock,
} from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";
import { VipMembershipCard } from "../../components/store/VipMembershipCard";
import { Button } from "../../components/ui/Button";

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

interface WarrantyCertificate {
  id: string;
  certificateNumber: string;
  orderId: string;
  skuCode: string;
  productName: string;
  serialNumber: string;
  vendorName: string;
  purchaseAmount: number;
  escrowAmountHeld: number;
  escrowStatus: string;
  warrantyStatus: string;
  sha256Signature: string;
  coverageMonths: number;
  issuedAt: string;
  expiresAt: string;
  activeClaimDescription?: string;
}

interface BnplPlan {
  id: string;
  planNumber: string;
  orderId: string;
  productSummary: string;
  totalOrderAmount: number;
  remainingBalance: number;
  totalInstallments: number;
  paidInstallments: number;
  status: string;
  schedule: Array<{
    installmentNumber: number;
    amount: number;
    dueDate: string;
    status: string;
    transactionRef?: string;
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
  const [warranties, setWarranties] = useState<WarrantyCertificate[]>([]);
  const [bnplPlans, setBnplPlans] = useState<BnplPlan[]>([]);
  const [creditLimit, setCreditLimit] = useState<number>(15000);
  const [availableCredit, setAvailableCredit] = useState<number>(13530);
  const [activeTab, setActiveTab] = useState<"loyalty" | "warranties" | "bnpl" | "security">("loyalty");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchAllProfileData = async () => {
    try {
      const [wRes, certRes, bnplRes] = await Promise.all([
        fetch("/api/loyalty/wallet", { headers: { "X-Customer-Id": user.userId } }),
        fetch("/api/warranties", { headers: { "X-Customer-Id": user.userId } }),
        fetch("/api/bnpl", { headers: { "X-Customer-Id": user.userId } }),
      ]);
      if (wRes.ok) setWallet(await wRes.json());
      if (certRes.ok) setWarranties(await certRes.json());
      if (bnplRes.ok) {
        const bData = await bnplRes.json();
        setBnplPlans(bData.plans || []);
        if (bData.eligibility) {
          setCreditLimit(bData.eligibility.maxCreditLimitILS || 15000);
          setAvailableCredit(bData.eligibility.availableCreditILS || 13530);
        }
      }
    } catch {
      // Resilient fallback handled by API routes
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
    fetchAllProfileData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleReleaseEscrow = async (cert: WarrantyCertificate) => {
    await fetch("/api/warranties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certificateId: cert.id, action: "RELEASE_ESCROW" }),
    });
    setWarranties((prev) =>
      prev.map((c) => (c.id === cert.id ? { ...c, escrowStatus: "RELEASED_TO_VENDOR", escrowAmountHeld: 0 } : c))
    );
    showToast(`כספי הנאמנות (Escrow) עבור ${cert.productName} שוחררו לסוחר ${cert.vendorName}!`);
  };

  const handlePayNextInstallment = async (plan: BnplPlan) => {
    await fetch("/api/bnpl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "PAY_NEXT", planId: plan.id }),
    });
    setBnplPlans((prev) =>
      prev.map((p) => {
        if (p.id !== plan.id) return p;
        const nextIdx = p.schedule.findIndex((s) => s.status === "SCHEDULED");
        if (nextIdx === -1) return p;
        const trancheAmt = p.schedule[nextIdx].amount;
        const updatedSchedule = p.schedule.map((s, idx) =>
          idx === nextIdx ? { ...s, status: "PAID", transactionRef: "TX-EARLY-PAID" } : s
        );
        const newPaid = p.paidInstallments + 1;
        return {
          ...p,
          paidInstallments: newPaid,
          remainingBalance: Math.max(0, p.remainingBalance - trancheAmt),
          status: newPaid >= p.totalInstallments ? "COMPLETED" : "ACTIVE",
          schedule: updatedSchedule,
        };
      })
    );
    showToast(`תשלום קרוב בתוכנית ${plan.planNumber} נפרע בהצלחה ללא ריבית!`);
  };

  const handleLogout = () => {
    if (confirm("האם ברצונך להתנתק מהחשבון?")) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.dispatchEvent(new Event("auth-changed"));
      window.location.href = "/login";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16" dir="rtl">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            אזור אישי, כספת אחריות ומועדון VIP
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            ניהול 5% Cashback, תעודות אחריות דיגיטליות חתומות (`SHA-256`), חשבון נאמנות (`Escrow`) ופריסת `BNPL`
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/arena"
            className="px-3.5 py-2 rounded-xl bg-amber-500/15 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition"
          >
            זירת Flash & קבוצתיות
          </Link>
          <Link
            href="/orders"
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition"
          >
            ההזמנות שלי
          </Link>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 transition"
          >
            התנתק
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs sm:text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold">
        {[
          { id: "loyalty", label: "ארנק Cashback" },
          { id: "warranties", label: `כספת אחריות ו-Escrow (${warranties.length})` },
          { id: "bnpl", label: `פריסת BNPL (${bnplPlans.length})` },
          { id: "security", label: "פרטי חשבון ואבטחה" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2.5 px-3 rounded-xl transition ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-amber-400 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Loyalty Transactions History */}
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

      {/* Tab 2: Digital Warranties & Smart Escrow Vault */}
      {activeTab === "warranties" && (
        <div className="space-y-4">
          {warranties.map((cert) => {
            const isHeld = cert.escrowStatus === "HELD_IN_ESCROW";
            return (
              <div
                key={cert.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-base text-slate-900 dark:text-white">{cert.productName}</h4>
                      <span className="text-xs font-mono text-slate-400">
                        תעודה: {cert.certificateNumber} • סידורי: {cert.serialNumber} • חנות: {cert.vendorName}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 font-bold text-xs">
                    אחריות יבואן רשמי ({cert.coverageMonths} חודשים)
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between gap-2 overflow-x-auto">
                  <span className="flex items-center gap-1.5 shrink-0 text-amber-500 font-bold">
                    <Lock className="w-3.5 h-3.5" /> SHA-256 Ledger Signature:
                  </span>
                  <span className="truncate">{cert.sha256Signature}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    סטטוס נאמנות (`Smart Escrow`):{" "}
                    <strong className={isHeld ? "text-amber-500" : "text-emerald-500"}>
                      {isHeld
                        ? `מוחזק בנאמנות (${formatPrice(cert.escrowAmountHeld)}) עד אישור קבלה`
                        : "שוחרר לסוחר לאחר מסירה תקינה"}
                    </strong>
                  </div>

                  {isHeld && (
                    <Button
                      onClick={() => handleReleaseEscrow(cert)}
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl"
                    >
                      אשר תקינות מוצר ושחרר Escrow לסוחר
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: BNPL 4-Installment Split Credit Plans */}
      {activeTab === "bnpl" && (
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-indigo-300">bnpl-credit-service • 0% APR</span>
              <h3 className="text-lg font-black mt-0.5">מסגרת אשראי BNPL מיידית לחברי VIP</h3>
              <p className="text-xs text-slate-400">פריסה אוטומטית ל-4 תשלומים שווים ללא ריבית וללא עמלות</p>
            </div>
            <div className="text-left">
              <span className="text-xs text-slate-400 block">יתרת אשראי זמינה לניצול:</span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                {formatPrice(availableCredit)} / {formatPrice(creditLimit)}
              </span>
            </div>
          </div>

          {bnplPlans.map((plan) => (
            <div
              key={plan.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white">{plan.productSummary}</h4>
                  <span className="text-xs font-mono text-slate-400">
                    תוכנית: {plan.planNumber} • הזמנה: {plan.orderId}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-amber-500">
                    שולמו {plan.paidInstallments}/{plan.totalInstallments} תשלומים
                  </span>
                  {plan.status === "ACTIVE" && (
                    <Button
                      onClick={() => handlePayNextInstallment(plan)}
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl"
                    >
                      <CreditCard className="w-3.5 h-3.5 ml-1" />
                      פרע תשלום קרוב כעת
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {plan.schedule.map((tr) => {
                  const isPaid = tr.status === "PAID";
                  return (
                    <div
                      key={tr.installmentNumber}
                      className={`p-3 rounded-2xl border text-xs ${
                        isPaid
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500"
                      }`}
                    >
                      <div className="flex justify-between font-bold">
                        <span>תשלום #{tr.installmentNumber}</span>
                        <span>{isPaid ? "✓ שולם" : "מתוזמן"}</span>
                      </div>
                      <div className="text-sm font-black font-mono mt-1 text-slate-900 dark:text-white">
                        {formatPrice(tr.amount)}
                      </div>
                      <div className="text-[10px] font-mono mt-0.5">
                        {new Date(tr.dueDate).toLocaleDateString("he-IL")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Security & Profile Details */}
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
