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
  ArrowLeft,
  Smartphone,
  ChevronLeft,
  Clock,
  Layers,
  Award,
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

  // Trade-In calculation: either fixed 850 NIS or up to 35% of cart
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

  const handleSelectFintechMode = (mode: "standard" | "bnpl" | "split" | "b2b") => {
    setFintechMode(mode);
    if (mode === "bnpl") {
      onPaymentTokenChange("pm_bnpl_4_installments");
    } else if (mode === "standard") {
      onPaymentTokenChange("pm_card_visa_ok");
    }
  };

  return (
    <div
      dir="rtl"
      className="relative overflow-hidden rounded-3xl bg-slate-900/95 text-slate-100 border border-slate-800 shadow-2xl backdrop-blur-2xl p-5 sm:p-7 space-y-6"
    >
      {/* Ambient gradient top edge */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400" />
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Smart Escrow Badge */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Zap className="w-5 h-5 fill-amber-400/20" />
            </span>
            <h3 className="font-black text-xl text-white tracking-wide">
              קופת FinTech מאוחדת
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            סליקה חכמה מרובת ערוצים • פריסה בריבית 0% • נאמנות דיגיטלית
          </p>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[11px] font-mono font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SHA-256 Escrow</span>
          </div>
          <span className="text-[9px] text-emerald-400/80 font-medium mt-0.5">מאומת ומבוטח</span>
        </div>
      </div>

      {/* Smart Payment Route Switcher (מסלול תשלום חכם) */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>מסלול תשלום חכם:</span>
          </span>
          <span className="text-[10px] text-amber-400/90 font-mono font-semibold">
            ללא ריבית או עמלת הקמה
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            {
              id: "bnpl",
              title: "4 תשלומי BNPL (0%)",
              subtitle: "הנפוץ ביותר",
              badge: "0% ריבית",
              icon: <Sparkles className="w-4 h-4 text-amber-400" />,
            },
            {
              id: "standard",
              title: "אשראי / ארנק",
              subtitle: "חיוב מיידי רגיל",
              badge: "מיידי",
              icon: <CreditCard className="w-4 h-4 text-emerald-400" />,
            },
            {
              id: "split",
              title: "פיצול עם חברים",
              subtitle: "קישור תשלום קבוצתי",
              badge: "Split-Pay",
              icon: <Users className="w-4 h-4 text-indigo-400" />,
            },
            {
              id: "b2b",
              title: "רכש B2B (Net-60)",
              subtitle: "הוראת קבע / חשבונית",
              badge: "עסקים",
              icon: <Building2 className="w-4 h-4 text-sky-400" />,
            },
          ].map((track) => {
            const isSelected = fintechMode === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => handleSelectFintechMode(track.id as any)}
                className={`group relative p-3 rounded-2xl border text-right transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/80 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-[12px]">
                    {track.icon}
                    <span>{track.title}</span>
                  </div>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{track.subtitle}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md font-mono font-bold ${
                      isSelected
                        ? "bg-amber-400/20 text-amber-300"
                        : "bg-slate-700/50 text-slate-400"
                    }`}
                  >
                    {track.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Coupon Code / VIP Promotion */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-300 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>קוד קופון / הטבת VIP:</span>
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">קודים זמינים:</span>
            <button
              type="button"
              onClick={() => handleApplyPresetCoupon("SWARM-VIP10")}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition cursor-pointer"
            >
              SWARM-VIP10 (-10%)
            </button>
          </div>
        </div>

        {appliedCoupon ? (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-emerald-300">
                  קופון {appliedCoupon.code} פעיל
                </span>
                <span className="text-[11px] text-emerald-200/80 mr-1.5">
                  ({appliedCoupon.percent}% הנחה נטו נוספה לסל)
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onRemoveCoupon}
              className="text-xs text-rose-400 font-bold hover:text-rose-300 underline cursor-pointer"
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
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-white placeholder-slate-500 uppercase font-mono outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition"
            />
            <Button
              type="submit"
              size="sm"
              loading={couponLoading}
              variant="outline"
              className="text-xs px-5 border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              החל
            </Button>
          </form>
        )}
        {couponError && <p className="text-xs text-rose-400 font-medium">{couponError}</p>}
      </div>

      {/* AI Trade-In Voucher Module */}
      <div className="relative overflow-hidden p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm">
              ♻️
            </span>
            <div>
              <span className="font-bold text-white block">
                קיזוז שובר טרייד-אין (AI Trade-In):
              </span>
              <span className="text-[10px] text-cyan-200/70">
                שמאות מהירה למכשיר ישן בקיזוז מיידי בסל
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTradeInApplied(!tradeInApplied)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5 ${
              tradeInApplied
                ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black shadow-emerald-500/20"
                : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/40"
            }`}
          >
            {tradeInApplied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>שובר קוזז (₪850)</span>
              </>
            ) : (
              <span>החל שובר שמאות</span>
            )}
          </button>
        </div>

        {tradeInApplied && (
          <div className="flex items-center justify-between text-xs text-cyan-300 font-mono pt-1.5 border-t border-cyan-500/20">
            <span className="text-[11px] text-cyan-200/80">
              אסמכתת שמאות דיגיטלית: <strong className="text-white font-mono">{tradeInCode}</strong>
            </span>
            <strong className="text-sm font-black text-emerald-400">
              - {formatPrice(tradeInCreditAmount)}
            </strong>
          </div>
        )}
      </div>

      {/* Price Summary Breakdown */}
      <div className="space-y-2 text-xs pt-3 border-t border-slate-800">
        <div className="flex justify-between text-slate-400">
          <span>סכום ביניים:</span>
          <span className="font-bold text-slate-200 font-mono text-sm">{formatPrice(subtotal)}</span>
        </div>

        {appliedCoupon && (
          <div className="flex justify-between text-emerald-400 font-medium">
            <span>הנחת סוכן VIP ({appliedCoupon.code}):</span>
            <span className="font-mono font-bold">- {formatPrice(discountAmount)}</span>
          </div>
        )}

        {tradeInApplied && (
          <div className="flex justify-between text-cyan-400 font-medium">
            <span>קיזוז שובר טרייד-אין ({tradeInCode}):</span>
            <span className="font-mono font-bold">- {formatPrice(tradeInCreditAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-400">
          <span>משלוח אקספרס עד הבית:</span>
          <span className="text-emerald-400 font-bold">חינם</span>
        </div>

        {/* Final Payable Amount */}
        <div className="pt-3 border-t border-slate-800/80 flex justify-between items-baseline">
          <div>
            <span className="block text-sm font-black text-white">סה״כ נטו לתשלום:</span>
            <span className="text-[10px] text-slate-400">כולל מע״מ ואחריות יבואן רשמית</span>
          </div>
          <span className="text-amber-400 font-mono text-3xl font-black tracking-tight drop-shadow-md">
            {formatPrice(netPayableTotal)}
          </span>
        </div>
      </div>

      {/* LUXURY FINTECH HIGHLIGHT CARD (Redesigned Blue Box from Screenshot) */}
      <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 border border-amber-500/30 shadow-xl space-y-3.5">
        <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-amber-400/40 via-emerald-400/40 to-indigo-400/40" />

        {/* BNPL Schedule Header & Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>פריסת BNPL חכמה (4 תשלומים ב-0% ריבית):</span>
            </span>
            <span className="font-mono text-emerald-400 font-black text-sm">
              4 × {formatPrice(bnplInstallment)}
            </span>
          </div>

          {/* 4-Step Visual Timeline */}
          <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
            {[
              { label: "היום", sub: "מיידי" },
              { label: "+30 יום", sub: "0% ריבית" },
              { label: "+60 יום", sub: "0% ריבית" },
              { label: "+90 יום", sub: "סופי" },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] relative overflow-hidden"
              >
                <div className="text-[10px] font-bold text-slate-300">{step.label}</div>
                <div className="font-mono text-amber-400 font-bold mt-0.5 text-[11px]">
                  {formatPrice(bnplInstallment)}
                </div>
                <div className="text-[9px] text-emerald-400 font-medium mt-0.5">{step.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Guaranteed Future Buyback / Value Retention */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400">
              <Award className="w-3.5 h-3.5" />
            </span>
            <span className="text-slate-300 font-medium">
              שמירת ערך מובטחת (24 חודשים):
            </span>
          </div>
          <div className="text-left font-mono">
            <span className="text-emerald-400 font-black text-xs">
              {formatPrice(guaranteedRetentionValue)}
            </span>
            <span className="text-[10px] text-slate-400 mr-1 font-semibold">(74%)</span>
          </div>
        </div>

        {/* Digital Warranty & Smart Escrow Verification Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-300">
              תעודת אחריות דיגיטלית ונאמנות Smart Escrow
            </span>
          </div>
          <span className="font-mono text-emerald-400 font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            SHA-256 VERIFIED
          </span>
        </div>
      </div>

      {/* Payment Selection List (אמצעי תשלום) */}
      <div className="space-y-2 pt-2 border-t border-slate-800 text-xs relative z-10">
        <label className="font-bold text-slate-300 block">אמצעי תשלום:</label>
        <div className="grid grid-cols-1 gap-2">
          {[
            {
              id: "pm_card_visa_ok",
              label: "Visa Platinum (•••• 4242)",
              sub: "כרטיס ראשי",
              brandIcon: "💳",
            },
            {
              id: "pm_bnpl_4_installments",
              label: `BNPL Split-Pay (4 × ${formatPrice(bnplInstallment)})`,
              sub: "0% ריבית מיידי",
              brandIcon: "⚡",
            },
            {
              id: "pm_card_mastercard_ok",
              label: "Mastercard World Elite (•••• 8899)",
              sub: "מועדון VIP",
              brandIcon: "💳",
            },
            {
              id: "pm_apple_pay_ok",
              label: "Apple Pay / Google Pay",
              sub: "תשלום מהיר",
              brandIcon: "🍎",
            },
            {
              id: "pm_bit_paybox_ok",
              label: "Bit / PayBox",
              sub: "ארנק דיגיטלי",
              brandIcon: "📱",
            },
          ].map((pm) => {
            const isSelected = paymentToken === pm.id;
            return (
              <button
                key={pm.id}
                type="button"
                onClick={() => onPaymentTokenChange(pm.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs text-right transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/15 border-amber-500 text-white font-bold shadow-md shadow-amber-500/10 ring-1 ring-amber-500/40"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? "border-amber-400 bg-amber-400"
                        : "border-slate-600 bg-slate-900"
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  </span>
                  <span className="text-sm shrink-0">{pm.brandIcon}</span>
                  <span className={isSelected ? "text-white font-bold" : "text-slate-200"}>
                    {pm.label}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    isSelected ? "text-amber-300 font-bold" : "text-slate-400"
                  }`}
                >
                  {pm.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SAGA Real-Time Order Stepper (when loading) */}
      {loading && (
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/40 space-y-2 text-xs animate-fade-in relative z-10 shadow-lg">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            <span>מעבד את ההזמנה באופן מאובטח ב-SAGA:</span>
          </div>
          <div className="space-y-1.5 text-slate-300 text-[11px]">
            <div className={checkoutStep >= 1 ? "text-emerald-400 font-bold flex items-center gap-1.5" : "flex items-center gap-1.5 text-slate-500"}>
              <span>{checkoutStep >= 1 ? "✓" : "○"}</span>
              <span>1. שריון מלאי פסימי ונעילת כספי Smart Escrow</span>
            </div>
            <div className={checkoutStep >= 2 ? "text-emerald-400 font-bold flex items-center gap-1.5" : "flex items-center gap-1.5 text-slate-500"}>
              <span>{checkoutStep >= 2 ? "✓" : "○"}</span>
              <span>2. אימות תשלום והנפקת תעודת אחריות דיגיטלית SHA-256</span>
            </div>
            <div className={checkoutStep >= 3 ? "text-emerald-400 font-bold flex items-center gap-1.5" : "flex items-center gap-1.5 text-slate-500"}>
              <span>{checkoutStep >= 3 ? "✓" : "○"}</span>
              <span>3. תיאום שליח אקספרס וזיכוי 5% נקודות VIP</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Luxury CTA Button (אישור הזמנה ותשלום) */}
      <div className="relative z-10 pt-1">
        <Button
          onClick={onCheckout}
          loading={loading}
          size="lg"
          className="w-full h-14 text-base font-black bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 rounded-2xl transition-all transform active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          icon={<ShieldCheck className="w-5 h-5 stroke-[2.5]" />}
        >
          {loading
            ? "מאמת תשלום ומשריין משלוח..."
            : `אישור הזמנה ותשלום (${formatPrice(netPayableTotal)})`}
        </Button>
      </div>

      {/* Trust & Security Footer */}
      <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5 pt-1 relative z-10">
        <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
        <span>רכישה מאובטחת בתקן SSL 256-Bit, PCI-DSS | Smart Escrow-1 Level 1</span>
      </div>
    </div>
  );
};
