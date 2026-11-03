"use client";

import React, { useState } from "react";
import { ShieldCheck, Tag, Sparkles, Check, RefreshCw, CreditCard } from "lucide-react";
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

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    await onApplyCoupon(couponInput.trim().toUpperCase());
    setCouponLoading(false);
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
      <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-emerald-500" />
        <span>סיכום הזמנה ותשלום מאובטח</span>
      </h3>

      {/* Coupon Form */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">קוד קופון / הטבת VIP:</label>
        {appliedCoupon ? (
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              קופון {appliedCoupon.code} פעיל ({appliedCoupon.percent}% הנחה)
            </span>
            <button onClick={onRemoveCoupon} className="text-xs text-rose-500 font-bold hover:underline">
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

        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>משלוח אקספרס עד הבית:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">חינם</span>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between text-base font-black text-slate-900 dark:text-slate-100">
          <span>סה״כ לתשלום:</span>
          <span className="text-amber-600 dark:text-amber-400 font-mono text-xl">{formatPrice(finalTotal)}</span>
        </div>
      </div>

      {/* Payment Selection */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <label className="font-bold text-slate-700 dark:text-slate-300 block">אמצעי תשלום:</label>
        <div className="grid grid-cols-1 gap-1.5">
          {[
            { id: "pm_card_visa_ok", label: "💳 Visa Platinum (•••• 4242)", sub: "כרטיס ראשי" },
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
            <span>מעבד את הזמנתך באופן מאובטח:</span>
          </div>
          <div className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
            <div className={checkoutStep >= 1 ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>
              {checkoutStep >= 1 ? "✓" : "○"} 1. בדיקת זמינות ושריון המוצרים במחסן הלוגיסטי
            </div>
            <div className={checkoutStep >= 2 ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>
              {checkoutStep >= 2 ? "✓" : "○"} 2. אימות תשלום מאובטח והנפקת אסמכתא
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
        {loading ? "מאמת תשלום ומשריין משלוח..." : "אישור הזמנה ותשלום מאובטח"}
      </Button>

      <div className="text-center text-[10px] text-slate-400">
        🔒 רכישה מאובטחת בתקן SSL 256-Bit ו-PCI-DSS Level 1
      </div>
    </div>
  );
};
