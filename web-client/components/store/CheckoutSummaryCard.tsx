"use client";

import React, { useState } from "react";
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
  Tag,
  Check,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Award,
  Wallet,
  ArrowLeft,
  Sliders,
  DollarSign,
  BadgeCheck,
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
  const [fintechMode, setFintechMode] = useState<"bnpl" | "card" | "wallet" | "b2b">("bnpl");
  const [tradeInApplied, setTradeInApplied] = useState(false);
  const tradeInCode = "TRD-AI-850";

  // Calculations
  const tradeInCreditAmount = tradeInApplied ? Math.min(850, Math.round(finalTotal * 0.35)) : 0;
  const netPayableTotal = Math.max(0, finalTotal - tradeInCreditAmount);
  const bnplInstallment = netPayableTotal / 4;
  const guaranteedRetentionValue = Math.round(netPayableTotal * 0.74);

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    await onApplyCoupon(couponInput.trim().toUpperCase());
    setCouponLoading(false);
  };

  const handleApplyPresetCoupon = async (code: string) => {
    setCouponInput(code);
    setCouponLoading(true);
    await onApplyCoupon(code);
    setCouponLoading(false);
  };

  const handleSelectFintechMode = (mode: "bnpl" | "card" | "wallet" | "b2b") => {
    setFintechMode(mode);
    if (mode === "bnpl") {
      onPaymentTokenChange("pm_bnpl_4_installments");
    } else if (mode === "card") {
      onPaymentTokenChange("pm_card_visa_ok");
    } else if (mode === "wallet") {
      onPaymentTokenChange("pm_apple_pay_ok");
    } else if (mode === "b2b") {
      onPaymentTokenChange("pm_b2b_net60");
    }
  };

  return (
    <div
      dir="rtl"
      className="relative overflow-hidden rounded-3xl bg-slate-900/95 text-slate-100 border border-slate-800 shadow-2xl backdrop-blur-2xl p-5 sm:p-7 space-y-6"
    >
      {/* Top luxury ambient gradient bar */}
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400" />
      <div className="absolute -top-28 -left-28 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -right-28 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER BAR (רוחבי מלא עם סטטוסים ואבטחה) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Zap className="w-5 h-5 fill-amber-400/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg sm:text-xl text-white tracking-wide">
                קופת FinTech מאוחדת
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold">
                PRO CHECKOUT
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              פריסה חכמה ב-0% ריבית • קיזוז טרייד-אין מיידי • נאמנות קריפטוגרפית
            </p>
          </div>
        </div>

        {/* Security badges row */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SHA-256 Escrow Verified</span>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-slate-400 font-mono">
            SSL 256-Bit • PCI-DSS Level 1
          </span>
        </div>
      </div>

      {/* 3-COLUMN HORIZONTAL GRID (פריסה לרוחב: 3 עמודות מסודרות) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">

        {/* ================= COLUMN 1: מסלול תשלום ו-BNPL ================= */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>1. ערוץ סליקה מבוקש:</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                0% עמלות
              </span>
            </div>

            {/* 4 Mode Grid */}
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { id: "bnpl", label: "4 תשלומים (0%)", badge: "מומלץ", icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" /> },
                { id: "card", label: "אשראי רגיל", badge: "מיידי", icon: <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> },
                { id: "wallet", label: "Apple / Bit", badge: "ארנק", icon: <Wallet className="w-3.5 h-3.5 text-sky-400" /> },
                { id: "b2b", label: "רכש עסקי", badge: "Net-60", icon: <Building2 className="w-3.5 h-3.5 text-indigo-400" /> },
              ].map((tab) => {
                const isSelected = fintechMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectFintechMode(tab.id as any)}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-amber-500/20 border-amber-500 text-white font-bold ring-1 ring-amber-500/40 shadow-xs"
                        : "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold">
                        {tab.icon}
                        <span>{tab.label}</span>
                      </div>
                      {isSelected && (
                        <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">{tab.badge}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub-Selection Details */}
            <div className="pt-2 border-t border-slate-800/80">
              {fintechMode === "bnpl" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-bold">לוח 4 חיובים שווים:</span>
                    <span className="font-mono text-emerald-400 font-bold">4 × {formatPrice(bnplInstallment)}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center font-mono text-[9px]">
                    {[
                      { t: "היום", s: "מיידי" },
                      { t: "+30", s: "0%" },
                      { t: "+60", s: "0%" },
                      { t: "+90", s: "סופי" },
                    ].map((step, idx) => (
                      <div key={idx} className="p-1 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-slate-400">{step.t}</div>
                        <div className="text-amber-300 font-bold mt-0.5">{formatPrice(bnplInstallment)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {fintechMode === "card" && (
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] text-slate-400 block">כרטיס מוגדר לחיוב:</span>
                  {[
                    { id: "pm_card_visa_ok", name: "Visa Platinum", digits: "•••• 4242", sub: "ראשי" },
                    { id: "pm_card_mastercard_ok", name: "Mastercard Elite", digits: "•••• 8899", sub: "VIP" },
                  ].map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => onPaymentTokenChange(card.id)}
                      className={`w-full p-2 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                        paymentToken === card.id
                          ? "bg-amber-500/15 border-amber-500 text-white font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span className="text-[11px] font-bold">💳 {card.name}</span>
                      <span className="font-mono text-[10px] text-amber-300">{card.digits} ({card.sub})</span>
                    </button>
                  ))}
                </div>
              )}

              {fintechMode === "wallet" && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => onPaymentTokenChange("pm_apple_pay_ok")}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                      paymentToken === "pm_apple_pay_ok"
                        ? "bg-white text-slate-950 border-white"
                        : "bg-slate-900 border-slate-800 text-slate-200"
                    }`}
                  >
                    <span>🍎</span>
                    <span>Apple / Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onPaymentTokenChange("pm_bit_paybox_ok")}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                      paymentToken === "pm_bit_paybox_ok"
                        ? "bg-amber-500 text-slate-950 border-amber-500"
                        : "bg-slate-900 border-slate-800 text-slate-200"
                    }`}
                  >
                    <span>📱</span>
                    <span>Bit / PayBox</span>
                  </button>
                </div>
              )}

              {fintechMode === "b2b" && (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-200 mb-0.5">
                    <span>חשבונית מס שוטף + 60</span>
                    <span className="text-sky-400 font-mono text-[10px]">B2B VERIFIED</span>
                  </div>
                  <p className="text-[10px] text-slate-400">אישור אשראי ארגוני מידי על בסיס מספר ח.פ</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2: הטבות, שובר טרייד-אין ו-Escrow ================= */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between space-y-3.5">
          <div className="space-y-3">
            <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>2. שוברים והטבות VIP:</span>
            </span>

            {/* AI Trade-In Card */}
            <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">♻️</span>
                  <div>
                    <span className="font-bold text-white block text-[11px]">שובר AI Trade-In</span>
                    <span className="text-[9px] text-cyan-200/70">שמאות מכשיר ישן בקיזוז מיידי</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTradeInApplied(!tradeInApplied)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                    tradeInApplied
                      ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                      : "bg-cyan-600 hover:bg-cyan-500 text-white"
                  }`}
                >
                  {tradeInApplied ? (
                    <>
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>קוזז (850 ₪-)</span>
                    </>
                  ) : (
                    <span>החל שובר (850 ₪)</span>
                  )}
                </button>
              </div>

              {tradeInApplied && (
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 pt-1 border-t border-cyan-500/20">
                  <span>אסמכתא: {tradeInCode}</span>
                  <span className="font-black text-emerald-400">- {formatPrice(tradeInCreditAmount)}</span>
                </div>
              )}
            </div>

            {/* Coupon Code Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-bold">קוד קופון:</span>
                {!appliedCoupon && (
                  <button
                    type="button"
                    onClick={() => handleApplyPresetCoupon("SWARM-VIP10")}
                    className="text-[9px] font-mono text-amber-400 hover:underline"
                  >
                    הפעל SWARM-VIP10 (-10%)
                  </button>
                )}
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-[11px]">
                  <span className="font-bold text-emerald-300">
                    ✓ קופון {appliedCoupon.code} פעיל ({appliedCoupon.percent}% הנחה)
                  </span>
                  <button
                    type="button"
                    onClick={onRemoveCoupon}
                    className="text-rose-400 font-bold hover:underline cursor-pointer"
                  >
                    הסר
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCouponSubmit} className="flex gap-1.5">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="הזן קוד (למשל SWARM-VIP10)"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white uppercase font-mono outline-none"
                  />
                  <Button type="submit" size="sm" loading={couponLoading} variant="outline" className="text-xs px-3">
                    החל
                  </Button>
                </form>
              )}
              {couponError && <p className="text-[10px] text-rose-400">{couponError}</p>}
            </div>

            {/* Future Buyback Guarantee & Escrow Stamp */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>שמירת ערך מובטחת (24 חודשים):</span>
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {formatPrice(guaranteedRetentionValue)} (74%)
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-slate-500">
                <span>נאמנות Escrow:</span>
                <span className="font-mono text-emerald-400 font-bold">SHA-256 VERIFIED</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 3: סיכום כספי ואישור תשלום ================= */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-950 to-indigo-950/40 border border-amber-500/30 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>3. סיכום לתשלום:</span>
            </span>

            {/* Price breakdown lines */}
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>סכום ביניים קטלוג:</span>
                <span className="font-mono text-slate-200">{formatPrice(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>הנחת סוכן VIP:</span>
                  <span className="font-mono font-bold">- {formatPrice(discountAmount)}</span>
                </div>
              )}
              {tradeInApplied && (
                <div className="flex justify-between text-cyan-400 font-medium">
                  <span>קיזוז טרייד-אין:</span>
                  <span className="font-mono font-bold">- {formatPrice(tradeInCreditAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>משלוח אקספרס עד הבית:</span>
                <span className="text-emerald-400 font-bold">חינם</span>
              </div>
            </div>

            {/* Net Total Display */}
            <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
              <div>
                <span className="block text-xs font-bold text-white">סה״כ נטו לתשלום:</span>
                <span className="text-[9px] text-slate-500">כולל מע״מ ואחריות</span>
              </div>
              <span className="text-amber-400 font-mono text-3xl font-black tracking-tight drop-shadow-md">
                {formatPrice(netPayableTotal)}
              </span>
            </div>
          </div>

          {/* SAGA Progress Stepper (when loading) */}
          {loading && (
            <div className="bg-slate-950/90 p-2.5 rounded-xl border border-amber-500/40 text-[10px] space-y-1 text-slate-300">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>סליקה מאובטחת ב-SAGA:</span>
              </div>
              <div className="space-y-0.5 pr-1">
                <div className={checkoutStep >= 1 ? "text-emerald-400 font-bold" : ""}>
                  {checkoutStep >= 1 ? "✓" : "○"} 1. נעילת Smart Escrow ושריון מלאי
                </div>
                <div className={checkoutStep >= 2 ? "text-emerald-400 font-bold" : ""}>
                  {checkoutStep >= 2 ? "✓" : "○"} 2. אימות כרטיס וחתימת SHA-256
                </div>
                <div className={checkoutStep >= 3 ? "text-emerald-400 font-bold" : ""}>
                  {checkoutStep >= 3 ? "✓" : "○"} 3. הפקת שטר מטען וזיכוי VIP
                </div>
              </div>
            </div>
          )}

          {/* Luxury Main CTA Button */}
          <div className="space-y-1.5">
            <Button
              onClick={onCheckout}
              loading={loading}
              size="lg"
              className="w-full h-13 text-sm sm:text-base font-black bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-xl shadow-blue-600/30 rounded-2xl transition-all transform active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              icon={<ShieldCheck className="w-5 h-5 stroke-[2.5]" />}
            >
              {loading
                ? "מעבד תשלום מאובטח..."
                : `אישור הזמנה ותשלום (${formatPrice(netPayableTotal)})`}
            </Button>
            <div className="text-center text-[9px] text-slate-500 flex items-center justify-center gap-1">
              <Lock className="w-2.5 h-2.5 text-emerald-400" />
              <span>רכישה מאובטחת SSL 256-Bit • תקן PCI-DSS • Smart Escrow</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
