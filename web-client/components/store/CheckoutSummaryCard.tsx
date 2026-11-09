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
  Zap,
  ArrowRight,
  Smartphone,
  BadgePercent,
  Check,
  Coins,
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
  const tradeInCode = "TRD-AI-850";

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
    <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl shadow-amber-500/5 space-y-6">
      {/* Decorative top ambient glow */}
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500" />

      {/* Header with Smart Escrow badge */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h3 className="font-black text-xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400">
              <Zap className="w-5 h-5 fill-current" />
            </span>
            <span>קופת FinTech מאוחדת</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            סליקה חכמה, פריסה ב-0% ריבית ונאמנות דיגיטלית
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Escrow 256-Bit</span>
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">מאומת ומבוטח</span>
        </div>
      </div>

      {/* Interactive Virtual FinTech Card Display */}
      <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-xl border border-slate-700/60">
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-6 rounded bg-gradient-to-r from-amber-400 to-amber-200 shadow-inner flex items-center justify-center text-[9px] font-black text-slate-900">
              CHIP
            </div>
            <span className="text-[11px] font-mono text-slate-400 tracking-wider">NFC CONTACTLESS</span>
          </div>
          <span className="text-xs font-black tracking-widest text-amber-400 font-mono">FINTECH BLACK</span>
        </div>

        <div className="space-y-1 my-3">
          <div className="text-[11px] text-slate-400 font-mono">סך הכל לחיוב:</div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300 tracking-tight">
            {formatPrice(netPayableTotal)}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[11px] font-mono text-slate-300">
          <div>
            <span className="text-[9px] text-slate-500 block uppercase">מחזיק כרטיס</span>
            <span className="font-bold">עידן קזם (VIP MEMBER)</span>
          </div>
          <div className="text-left">
            <span className="text-[9px] text-slate-500 block uppercase">מסלול נבחר</span>
            <span className="font-bold text-amber-400 uppercase">
              {fintechMode === "bnpl" && "4 תשלומים 0%"}
              {fintechMode === "standard" && "חיוב מלא"}
              {fintechMode === "split" && "פיצול 4 שותפים"}
              {fintechMode === "b2b" && "שוטף + 60"}
            </span>
          </div>
        </div>
      </div>

      {/* Unified FinTech Mode Switcher */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-500" />
            <span>בחר מסלול תשלום חכם:</span>
          </span>
          <span className="text-[10px] text-amber-500 font-semibold font-mono">ללא עמלות הסדר</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            {
              id: "bnpl",
              label: "4 תשלומים (0%)",
              sub: `4 × ${formatPrice(bnplInstallment)}`,
              icon: <Sparkles className="w-4 h-4 text-amber-500" />,
            },
            {
              id: "standard",
              label: "אשראי / ארנק",
              sub: "חיוב מיידי",
              icon: <CreditCard className="w-4 h-4 text-emerald-500" />,
            },
            {
              id: "split",
              label: "פיצול תשלום (Split)",
              sub: "שיתוף חברים בקישור",
              icon: <Users className="w-4 h-4 text-indigo-500" />,
            },
            {
              id: "b2b",
              label: "רכש B2B (Net-60)",
              sub: "הוראת קבע / חשבונית",
              icon: <Building2 className="w-4 h-4 text-sky-500" />,
            },
          ].map((tab) => {
            const isSelected = fintechMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectFintechMode(tab.id as any)}
                className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-amber-500/10 dark:bg-amber-400/10 border-amber-500 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-amber-500/40"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                  {tab.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BNPL Visual Schedule Breakdown */}
      {fintechMode === "bnpl" && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-500/30 space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>לוח פריסת 4 תשלומים (0% ריבית והצמדה):</span>
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">
              {formatPrice(bnplInstallment)} לתשלום
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
            {[
              { label: "היום", status: "מיידי" },
              { label: "עוד 30 יום", status: "0% ריבית" },
              { label: "עוד 60 יום", status: "0% ריבית" },
              { label: "עוד 90 יום", status: "תשלום סופי" },
            ].map((st, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-[10px]">
                <div className="font-bold text-slate-800 dark:text-slate-200">{st.label}</div>
                <div className="font-mono text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                  {formatPrice(bnplInstallment)}
                </div>
                <div className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-0.5">{st.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive AI Trade-In Voucher Offset */}
      <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
              ♻️
            </span>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                שובר טרייד-אין חכם (AI Trade-In):
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                הערכת שווי מכשיר ישן עם קיזוז מיידי בקופה
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTradeInApplied(!tradeInApplied)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
              tradeInApplied
                ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                : "bg-cyan-600 hover:bg-cyan-500 text-white"
            }`}
          >
            {tradeInApplied ? "✓ שובר קוזז" : "הפעל שובר (850 ₪)"}
          </button>
        </div>
        {tradeInApplied && (
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-mono pt-1.5 border-t border-cyan-500/20">
            <span>אסמכתא: {tradeInCode}</span>
            <strong className="text-sm font-bold">- {formatPrice(tradeInCreditAmount)}</strong>
          </div>
        )}
      </div>

      {/* Coupon Form */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <BadgePercent className="w-4 h-4 text-amber-500" />
            <span>קוד קופון / הטבת VIP סוכנים:</span>
          </span>
          <span className="text-[10px] text-slate-400">קוד לדוגמה: SWARM-VIP10</span>
        </label>
        {appliedCoupon ? (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                קופון {appliedCoupon.code} פעיל ({appliedCoupon.percent}% הנחה הוחלו)
              </span>
            </div>
            <button
              onClick={onRemoveCoupon}
              className="text-xs text-rose-500 font-bold hover:underline cursor-pointer"
            >
              הסר קופון
            </button>
          </div>
        ) : (
          <form onSubmit={handleCouponSubmit} className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="הזן קוד (למשל: SWARM-VIP10 או WELCOME10)"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 uppercase font-mono outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <Button type="submit" size="sm" loading={couponLoading} variant="outline" className="text-xs px-4">
              החל
            </Button>
          </form>
        )}
        {couponError && <p className="text-xs text-rose-500 font-medium">{couponError}</p>}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2.5 text-xs pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>סכום ביניים קטלוג:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">{formatPrice(subtotal)}</span>
        </div>

        {appliedCoupon && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
            <span>הנחת סוכן VIP ({appliedCoupon.code}):</span>
            <span className="font-mono">- {formatPrice(discountAmount)}</span>
          </div>
        )}

        {tradeInApplied && (
          <div className="flex justify-between text-cyan-600 dark:text-cyan-400 font-bold">
            <span>קיזוז טרייד-אין ({tradeInCode}):</span>
            <span className="font-mono">- {formatPrice(tradeInCreditAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>משלוח אקספרס עד הבית (דואר ישראל אקספרס):</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">חינם (0 ₪)</span>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline text-base font-black text-slate-900 dark:text-slate-100">
          <div>
            <span className="block text-sm">סה״כ נטו לתשלום:</span>
            <span className="text-[10px] text-slate-400 font-normal">כולל מע״מ ואחריות יבואן רשמי</span>
          </div>
          <span className="text-amber-500 dark:text-amber-400 font-mono text-2xl font-black">
            {formatPrice(netPayableTotal)}
          </span>
        </div>
      </div>

      {/* Cryptographic SHA-256 Digital Warranty & Escrow Stamp */}
      <div className="p-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-semibold">תעודת אחריות ונאמנות דיגיטלית Smart Escrow</span>
        </span>
        <code className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">SHA-256 SECURED</code>
      </div>

      {/* Payment Selection Options */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
        <label className="font-bold text-slate-700 dark:text-slate-300 block">בחר אמצעי תשלום מבוקש:</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { id: "pm_card_visa_ok", label: "💳 Visa Platinum (•••• 4242)", sub: "כרטיס מועדף" },
            { id: "pm_bnpl_4_installments", label: "⚡ BNPL 4 תשלומים", sub: "0% ריבית" },
            { id: "pm_apple_pay_ok", label: "🍎 Apple / Google Pay", sub: "בנגיעה אחת" },
            { id: "pm_bit_paybox_ok", label: "📱 Bit / PayBox", sub: "ארנק ישראלי" },
          ].map((pm) => {
            const isSelected = paymentToken === pm.id;
            return (
              <button
                key={pm.id}
                type="button"
                onClick={() => onPaymentTokenChange(pm.id)}
                className={`flex items-center justify-between p-3 rounded-2xl border text-xs text-right transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 font-bold shadow-xs ring-1 ring-amber-500/30"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                <span className="text-[10px] text-slate-400">{pm.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Order Progress Stepper */}
      {loading && (
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs animate-fade-in">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>מעבד את ההזמנה באופן מאובטח ב-SAGA:</span>
          </div>
          <div className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
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

      {/* Main Action CTA Button */}
      <Button
        onClick={onCheckout}
        loading={loading}
        size="lg"
        className="w-full h-14 text-base font-black bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 rounded-2xl transition-all transform active:scale-[0.99] cursor-pointer"
        icon={<ShieldCheck className="w-5 h-5" />}
      >
        {loading
          ? "מאמת תשלום ומשריין משלוח..."
          : `אישור הזמנה ותשלום מאובטח (${formatPrice(netPayableTotal)})`}
      </Button>

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <Lock className="w-3.5 h-3.5 text-emerald-500" />
        <span>רכישה מאובטחת בתקן SSL 256-Bit, PCI-DSS Level 1 ו-Smart Escrow</span>
      </div>
    </div>
  );
};
