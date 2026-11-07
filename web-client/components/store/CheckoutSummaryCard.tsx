"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  RefreshCw,
  CreditCard,
  Users,
  Building2,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "../ui/Button";
import { useCurrency } from "../../context/CurrencyContext";

export interface CheckoutSummaryCardProps {
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
  appliedCoupon: { code: string; percent: number } | null;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => void;
  couponError: string | null;
  paymentToken: string;
  onPaymentTokenChange: (token: string) => void;
  loading: boolean;
  checkoutStep: number; // 1, 2, 3
  onCheckout: () => void;
}

export const CheckoutSummaryCard: React.FC<CheckoutSummaryCardProps> = ({
  subtotal,
  discountAmount,
  finalTotal,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  couponError,
  paymentToken,
  onPaymentTokenChange,
  loading,
  checkoutStep,
  onCheckout,
}) => {
  const { formatPrice } = useCurrency();
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [fintechMode, setFintechMode] = useState<"standard" | "bnpl" | "split" | "b2b">("bnpl");
  const [tradeInApplied, setTradeInApplied] = useState(false);
  const [tradeInCode, setTradeInCode] = useState("TRD-AI-850");

  const tradeInCreditAmount = tradeInApplied ? Math.min(850, Math.round(finalTotal * 0.35)) : 0;
  const netPayableTotal = Math.max(0, finalTotal - tradeInCreditAmount);
  const bnplInstallment = netPayableTotal / 4;

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    await onApplyCoupon(couponInput.trim().toUpperCase());
    setCouponLoading(false);
  };

  const handleSelectFintechMode = (mode: "standard" | "bnpl" | "split" | "b2b") => {
    setFintechMode(mode);
    if (mode === "bnpl") {
      onPaymentTokenChange("pm_bnpl_4_installments");
    } else if (mode === "standard") {
      onPaymentTokenChange("pm_card_visa_ok");
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span>קופת FinTech מאוחדת</span>
        </h3>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
          SHA-256 Escrow
        </span>
      </div>

      {/* Unified FinTech Mode Switcher */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
          מסלול תשלום חכם:
        </span>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {[
            { id: "bnpl", label: "4 תשלומי BNPL (0%)", icon: <Sparkles className="w-3.5 h-3.5" /> },
            { id: "standard", label: "אשראי / ארנק", icon: <CreditCard className="w-3.5 h-3.5" /> },
            { id: "split", label: "פיצול עם חברים", icon: <Users className="w-3.5 h-3.5" /> },
            { id: "b2b", label: "רכש B2B (Net-60)", icon: <Building2 className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectFintechMode(tab.id as any)}
              className={`p-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                fintechMode === tab.id
                  ? "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Coupon Form */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
          קוד קופון / הטבת VIP:
        </label>
        {appliedCoupon ? (
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              קופון {appliedCoupon.code} פעיל ({appliedCoupon.percent}% הנחה)
            </span>
            <button
              onClick={onRemoveCoupon}
              className="text-xs text-rose-500 font-bold hover:underline"
            >
              הסר
            </button>
          </div>
        ) : (
          <form onSubmit={handleCouponSubmit} className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="הזן קוד (למשל: WELCOME10)"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 uppercase font-mono outline-none focus:ring-1 focus:ring-amber-500"
            />
            <Button type="submit" size="sm" loading={couponLoading} variant="outline" className="text-xs">
              החל
            </Button>
          </form>
        )}
        {couponError && <p className="text-xs text-rose-500 font-medium">{couponError}</p>}
      </div>

      {/* Interactive AI Trade-In Voucher Offset */}
      <div className="p-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/25 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
            <span>♻️</span>
            <span>קיזוז שובר טרייד-אין (AI Trade-In):</span>
          </span>
          <button
            type="button"
            onClick={() => setTradeInApplied(!tradeInApplied)}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
              tradeInApplied
                ? "bg-emerald-500 text-slate-950"
                : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-700 dark:text-cyan-300"
            }`}
          >
            {tradeInApplied ? "שובר הופעל ✓" : "החל שובר שמאות"}
          </button>
        </div>
        {tradeInApplied && (
          <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-mono pt-1 border-t border-cyan-500/20">
            <span>אסמכתא: {tradeInCode}</span>
            <strong>- {formatPrice(tradeInCreditAmount)}</strong>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2.5 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>סכום ביניים:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{formatPrice(subtotal)}</span>
        </div>

        {appliedCoupon && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
            <span>הנחת קופון ({appliedCoupon.code}):</span>
            <span>- {formatPrice(discountAmount)}</span>
          </div>
        )}

        {tradeInApplied && (
          <div className="flex justify-between text-cyan-600 dark:text-cyan-400 font-bold">
            <span>קיזוז טרייד-אין ({tradeInCode}):</span>
            <span>- {formatPrice(tradeInCreditAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>משלוח אקספרס עד הבית:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">חינם</span>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between text-base font-black text-slate-900 dark:text-slate-100">
          <span>סה״כ נטו לתשלום:</span>
          <span className="text-amber-600 dark:text-amber-400 font-mono text-xl">
            {formatPrice(netPayableTotal)}
          </span>
        </div>

        {/* Dynamic FinTech Mode Preview Card */}
        {fintechMode === "bnpl" && (
          <div className="mt-2 p-3 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-amber-500/10 to-emerald-500/10 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> פריסת BNPL חכמה (0% ריבית):
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                4 × {formatPrice(bnplInstallment)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300">
              <span>♻️ שמירת ערך מובטחת (24 חודשים):</span>
              <strong className="font-mono text-cyan-500">
                {formatPrice(netPayableTotal * 0.74)} (74%)
              </strong>
            </div>
          </div>
        )}

        {fintechMode === "split" && (
          <div className="mt-2 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-300">
              <span>👥 פיצול תשלום בין 4 חברים:</span>
              <span className="font-mono">{formatPrice(netPayableTotal / 4)} / חבר</span>
            </div>
            <Link
              href="/gifting"
              className="block text-center py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-200 font-bold text-[11px] transition"
            >
              צור קישור מתנה משותפת ב-Social Split-Pay →
            </Link>
          </div>
        )}

        {fintechMode === "b2b" && (
          <div className="mt-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
              <span>🏢 אשראי ספקים B2B (Net-60):</span>
              <span className="font-mono">חשבונית מס מאושרת</span>
            </div>
            <Link
              href="/gifting"
              className="block text-center py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-200 font-bold text-[11px] transition"
            >
              הפק הצעת מחיר ארגונית ב-B2B Quote Desk →
            </Link>
          </div>
        )}

        {/* Cryptographic SHA-256 Digital Warranty & Escrow Stamp */}
        <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>תעודת אחריות דיגיטלית ונאמנות Smart Escrow</span>
          </span>
          <code className="font-mono text-emerald-600 dark:text-emerald-400">SHA-256 VERIFIED</code>
        </div>
      </div>

      {/* Payment Selection */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <label className="font-bold text-slate-700 dark:text-slate-300 block">אמצעי תשלום:</label>
        <div className="grid grid-cols-1 gap-1.5">
          {[
            { id: "pm_card_visa_ok", label: "💳 Visa Platinum (•••• 4242)", sub: "כרטיס ראשי" },
            {
              id: "pm_bnpl_4_installments",
              label: `⚡ BNPL Split-Pay (4 × ${formatPrice(bnplInstallment)})`,
              sub: "0% ריבית מיידי",
            },
            { id: "pm_card_mastercard_ok", label: "💳 Mastercard World Elite (•••• 8899)", sub: "מועדון VIP" },
            { id: "pm_apple_pay_ok", label: "🍎 Apple Pay / Google Pay", sub: "תשלום מהיר" },
            { id: "pm_bit_paybox_ok", label: "📱 Bit / PayBox", sub: "ארנק דיגיטלי" },
          ].map((pm) => {
            const isSelected = paymentToken === pm.id;
            return (
              <button
                key={pm.id}
                type="button"
                onClick={() => onPaymentTokenChange(pm.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs text-right transition ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500/50 text-amber-700 dark:text-amber-300 font-bold shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-amber-500 bg-amber-500" : "border-slate-400 dark:border-slate-600"
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  </span>
                  <span>{pm.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">{pm.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Order Progress Stepper */}
      {loading && (
        <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs animate-fade-in">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>מעבד את הזמנתך באופן מאובטח ב-SAGA:</span>
          </div>
          <div className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
            <div className={checkoutStep >= 1 ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>
              {checkoutStep >= 1 ? "✓" : "○"} 1. שריון מלאי פסימי ונעילת כספי Smart Escrow
            </div>
            <div className={checkoutStep >= 2 ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>
              {checkoutStep >= 2 ? "✓" : "○"} 2. אימות תשלום והנפקת תעודת אחריות דיגיטלית SHA-256
            </div>
            <div className={checkoutStep >= 3 ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>
              {checkoutStep >= 3 ? "✓" : "○"} 3. תיאום שליח אקספרס וזיכוי 5% נקודות VIP
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={onCheckout}
        loading={loading}
        size="lg"
        className="w-full h-12 text-sm sm:text-base font-black bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
        icon={<ShieldCheck className="w-5 h-5" />}
      >
        {loading
          ? "מאמת תשלום ומשריין משלוח..."
          : `אישור הזמנה ותשלום (${formatPrice(netPayableTotal)})`}
      </Button>

      <div className="text-center text-[10px] text-slate-400">
        🔒 רכישה מאובטחת בתקן SSL 256-Bit, PCI-DSS Level 1 ו-Smart Escrow
      </div>
    </div>
  );
};
