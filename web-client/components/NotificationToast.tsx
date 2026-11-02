"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, Bell, X, CreditCard, Box, ShoppingBag, Ticket } from "lucide-react";
import { SseNotification } from "../lib/useNotificationStream";

interface NotificationToastProps {
  toast: SseNotification | null;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toast, onDismiss }) => {
  const router = useRouter();

  useEffect(() => {
    if (!toast) return;
    const timeoutMs = toast.type === "ABANDONED_CART_COUPON" ? 12000 : 6000;
    const timer = setTimeout(() => {
      onDismiss();
    }, timeoutMs);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isSuccess = toast.type === "ORDER_CREATED" || toast.type === "PAYMENT_CAPTURED" || toast.type === "STOCK_RESERVED";
  const isCancelled = toast.type === "ORDER_CANCELLED" || toast.type === "PAYMENT_REFUNDED";
  const isCoupon = toast.type === "ABANDONED_CART_COUPON" || Boolean(toast.couponCode);

  const handleApplyCouponInCart = () => {
    if (!toast.couponCode) return;
    try {
      navigator.clipboard?.writeText(toast.couponCode).catch(() => {});
      sessionStorage.setItem("pending_coupon", toast.couponCode);
      window.dispatchEvent(new CustomEvent("apply-coupon", { detail: { code: toast.couponCode } }));
    } catch {
      // ignore
    }
    onDismiss();
    router.push("/cart");
  };

  const getIcon = () => {
    switch (toast.type) {
      case "ORDER_CREATED":
        return <ShoppingBag className="w-5 h-5 text-brand-600" />;
      case "STOCK_RESERVED":
        return <Box className="w-5 h-5 text-emerald-600" />;
      case "PAYMENT_CAPTURED":
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case "ABANDONED_CART_COUPON":
        return <Ticket className="w-5 h-5 text-amber-600" />;
      case "PAYMENT_REFUNDED":
      case "ORDER_CANCELLED":
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      default:
        return <Bell className="w-5 h-5 text-brand-600" />;
    }
  };

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 animate-slide-up pointer-events-auto" dir="rtl">
      <div
        className={`p-4 rounded-2xl border shadow-xl flex items-start gap-3.5 backdrop-blur-md transition-all ${
          isCoupon
            ? "bg-white/95 border-amber-400 text-slate-900 shadow-amber-500/20"
            : isSuccess
            ? "bg-white/95 border-emerald-300 text-slate-900 shadow-emerald-500/10"
            : isCancelled
            ? "bg-white/95 border-rose-300 text-slate-900 shadow-rose-500/10"
            : "bg-white/95 border-slate-300 text-slate-900"
        }`}
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isCoupon ? "bg-amber-100" : isSuccess ? "bg-emerald-50" : isCancelled ? "bg-rose-50" : "bg-brand-50"
          }`}
        >
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 tracking-tight">{toast.title}</h4>
            <span className="text-[10px] text-slate-400 font-mono">חי עכשיו</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{toast.message}</p>
          {isCoupon && toast.couponCode && (
            <div className="pt-1.5 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-mono font-black text-xs border border-amber-300">
                {toast.couponCode}
              </span>
              <button
                type="button"
                onClick={handleApplyCouponInCart}
                className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-black text-xs shadow-sm transition"
              >
                החל קופון בסל
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
