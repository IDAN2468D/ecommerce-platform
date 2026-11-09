"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  Clock,
  CheckCircle2,
  Receipt,
  Users,
  Sparkles,
  Share2,
  Radio,
} from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";
import { CheckoutSummaryCard } from "../../components/store/CheckoutSummaryCard";
import { DigitalReceiptModal, DigitalReceiptData } from "../../components/store/DigitalReceiptModal";
import { Button } from "../../components/ui/Button";
import { CollaborativeCartBar } from "../../components/store/CollaborativeCartBar";
import { SharedCartParticipant, SharedCartActivity } from "../../lib/shared-cart-store";

interface CartItem {
  skuCode: string;
  name?: string;
  productName?: string;
  price?: number;
  unitPrice?: number;
  image?: string;
  quantity: number;
  addedBy?: string;
  lastUpdatedBy?: string;
}

export default function CartPage() {
  const { formatPrice, currency } = useCurrency();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [paymentToken, setPaymentToken] = useState("pm_card_visa_ok");
  const [orderResult, setOrderResult] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(600);

  // Collaborative Cart States
  const [sharedRoomId, setSharedRoomId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<SharedCartParticipant[]>([]);
  const [activities, setActivities] = useState<SharedCartActivity[]>([]);
  const [currentParticipantId, setCurrentParticipantId] = useState<string>("");
  const [currentParticipantName, setCurrentParticipantName] = useState<string>("אני");
  const [isStartingShared, setIsStartingShared] = useState(false);
  const [liveToast, setLiveToast] = useState<{ message: string; actor: string } | null>(null);
  const [highlightedSku, setHighlightedSku] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Initialize participant and detect ?shared= query
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) setCart(JSON.parse(stored));
    } catch {}

    // Setup user identity
    let userId = "usr_demo";
    let userName = "משתמש";
    try {
      const u = JSON.parse(localStorage.getItem("auth_user") || "null");
      if (u?.userId) userId = u.userId;
      if (u?.fullName) userName = u.fullName;
      else if (u?.email) userName = u.email.split("@")[0];
    } catch {}
    setCurrentParticipantId(userId);
    setCurrentParticipantName(userName);

    // Check URL params
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sharedParam = params.get("shared");
      if (sharedParam && sharedParam.trim()) {
        setSharedRoomId(sharedParam.trim());
      }
    }

    const interval = setInterval(() => setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 600)), 1000);
    return () => clearInterval(interval);
  }, []);

  // Connect to SSE stream when in shared mode
  useEffect(() => {
    if (!sharedRoomId) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    const sseUrl = `/api/cart/shared/${sharedRoomId}/stream?userId=${encodeURIComponent(
      currentParticipantId
    )}&userName=${encodeURIComponent(currentParticipantName)}`;

    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const { type, payload } = parsed;

        if (type === "INIT") {
          if (payload?.room?.items) {
            setCart(payload.room.items);
            localStorage.setItem("cart", JSON.stringify(payload.room.items));
            window.dispatchEvent(new Event("cart-updated"));
          }
          if (payload?.room?.participants) setParticipants(payload.room.participants);
          if (payload?.room?.activities) setActivities(payload.room.activities);
        } else if (type === "CART_UPDATED") {
          if (payload?.room?.items) {
            setCart(payload.room.items);
            localStorage.setItem("cart", JSON.stringify(payload.room.items));
            window.dispatchEvent(new Event("cart-updated"));
          }
          if (payload?.room?.participants) setParticipants(payload.room.participants);
          if (payload?.room?.activities) setActivities(payload.room.activities);

          if (payload?.lastActor && payload.lastActor !== currentParticipantName) {
            setLiveToast({ message: payload.action || "עדכן/ה את הסל", actor: payload.lastActor });
            setTimeout(() => setLiveToast(null), 4000);
          }
        } else if (type === "USER_JOINED" || type === "USER_LEFT") {
          if (payload?.room?.participants) setParticipants(payload.room.participants);
          if (payload?.room?.activities) setActivities(payload.room.activities);
        }
      } catch (err) {
        console.warn("Failed to parse SSE shared cart message:", err);
      }
    };

    es.onerror = (err) => {
      console.warn("SSE stream connection error, will auto-reconnect:", err);
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [sharedRoomId, currentParticipantId, currentParticipantName]);

  // Sync mutation to shared room if active
  const syncSharedCart = async (updatedItems: CartItem[], actionText: string, skuChanged?: string) => {
    if (!sharedRoomId) return;

    if (skuChanged) {
      setHighlightedSku(skuChanged);
      setTimeout(() => setHighlightedSku(null), 1500);
    }

    try {
      await fetch(`/api/cart/shared/${sharedRoomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updatedItems,
          actorName: currentParticipantName,
          participantId: currentParticipantId,
          action: actionText,
        }),
      });
    } catch (e) {
      console.warn("Failed to sync shared cart:", e);
    }
  };

  const updateQuantity = (skuCode: string, delta: number) => {
    const targetItem = cart.find((i) => i.skuCode === skuCode);
    const itemName = targetItem?.productName || targetItem?.name || skuCode;
    const newQty = (targetItem?.quantity || 1) + delta;

    const updated = cart
      .map((i) =>
        i.skuCode === skuCode
          ? {
              ...i,
              quantity: Math.max(1, i.quantity + delta),
              lastUpdatedBy: currentParticipantName,
            }
          : i
      )
      .filter((i) => i.quantity > 0);

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cart-updated"));

    if (sharedRoomId) {
      const actionText = delta > 0 ? `העלה כמות ל-${newQty} עבור ${itemName}` : `הוריד כמות ל-${newQty} עבור ${itemName}`;
      syncSharedCart(updated, actionText, skuCode);
    }
  };

  const removeItem = (skuCode: string) => {
    const targetItem = cart.find((i) => i.skuCode === skuCode);
    const itemName = targetItem?.productName || targetItem?.name || skuCode;
    const updated = cart.filter((i) => i.skuCode !== skuCode);

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cart-updated"));

    if (sharedRoomId) {
      syncSharedCart(updated, `הסיר/ה את ${itemName} מהסל`);
    }
  };

  const handleStartSharedCart = async () => {
    setIsStartingShared(true);
    try {
      const res = await fetch("/api/cart/shared", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostName: currentParticipantName,
          items: cart,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSharedRoomId(data.roomId);
        if (typeof window !== "undefined") {
          const newUrl = `${window.location.pathname}?shared=${data.roomId}`;
          window.history.pushState({}, "", newUrl);
        }
      }
    } catch (err) {
      alert("שגיאה ביצירת עגלה שיתופית");
    } finally {
      setIsStartingShared(false);
    }
  };

  const handleLeaveSharedCart = () => {
    if (confirm("האם ברצונך לצאת מעגלת הקניות המשותפת?")) {
      setSharedRoomId(null);
      setParticipants([]);
      setActivities([]);
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", window.location.pathname);
      }
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price || item.unitPrice || 0) * item.quantity, 0);
  const discountAmount = appliedCoupon ? Math.round((subtotal * appliedCoupon.percent) / 100) : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = async (code: string) => {
    if (!code || !code.trim()) return;
    setCouponError(null);
    try {
      const currentSubtotal =
        cart.reduce((sum, item) => sum + (item.price || item.unitPrice || 0) * item.quantity, 0) || 1000;
      const res = await fetch("/api/orders/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), couponCode: code.trim(), orderAmount: currentSubtotal }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppliedCoupon({
          code: data.code || code.trim().toUpperCase(),
          percent: Number(data.discountPercent || data.discountValue || 15),
        });
      } else {
        setCouponError("קוד קופון לא תקין או פג תוקף");
      }
    } catch {
      setCouponError("שגיאה בבדיקת הקופון");
    }
  };

  useEffect(() => {
    try {
      const pending = sessionStorage.getItem("pending_coupon");
      if (pending) {
        sessionStorage.removeItem("pending_coupon");
        handleApplyCoupon(pending);
      }
    } catch {}

    const onApplyCouponEvent = (e: any) => {
      const code = e?.detail?.code;
      if (code) {
        try {
          sessionStorage.removeItem("pending_coupon");
        } catch {}
        handleApplyCoupon(String(code));
      }
    };
    window.addEventListener("apply-coupon", onApplyCouponEvent);
    return () => window.removeEventListener("apply-coupon", onApplyCouponEvent);
  }, [cart.length]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setCheckoutStep(1);
    try {
      await new Promise((r) => setTimeout(r, 400));
      setCheckoutStep(2);
      let customerId = "usr_demo";
      try {
        const u = JSON.parse(localStorage.getItem("auth_user") || "null");
        if (u?.userId) customerId = u.userId;
      } catch {}

      const savedToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (savedToken && !["null", "undefined", ""].includes(savedToken.trim())) {
        headers["Authorization"] = `Bearer ${savedToken}`;
      }

      const orderPayload = {
        currency: currency || "ILS",
        paymentMethodToken: paymentToken || "pm_card_visa_ok",
        customerId,
        couponCode: appliedCoupon?.code || null,
        items: cart.map((i) => ({ skuCode: i.skuCode, quantity: i.quantity, unitPrice: i.price ?? i.unitPrice ?? 0 })),
      };

      const res = await fetch("/api/orders", { method: "POST", headers, body: JSON.stringify(orderPayload) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || err.detail || `שגיאה (${res.status}) בביצוע ההזמנה`);
      }
      setCheckoutStep(3);
      await new Promise((r) => setTimeout(r, 400));
      const createdOrder = await res.json();
      setOrderResult(createdOrder);
      try {
        const existingHistory = JSON.parse(localStorage.getItem("nexus_orders_history") || "[]");
        localStorage.setItem("nexus_orders_history", JSON.stringify([createdOrder, ...existingHistory]));
      } catch {}
      localStorage.removeItem("cart");
      setCart([]);
      window.dispatchEvent(new Event("cart-updated"));
      setIsReceiptOpen(true);
    } catch (err: any) {
      const rawMsg = err.message || "";
      const displayMsg =
        !rawMsg || rawMsg === "Internal Server Error" || rawMsg === "fetch failed" || rawMsg.includes("Failed to fetch")
          ? "שרת ההזמנות חווה עומס רגעי. אנא נסה שוב בעוד מספר רגעים."
          : rawMsg;
      alert("שגיאה בביצוע ההזמנה: " + displayMsg);
    } finally {
      setLoading(false);
      setCheckoutStep(0);
    }
  };

  const receiptData: DigitalReceiptData | null = orderResult
    ? {
        orderId: orderResult.orderId,
        items: orderResult.items || [],
        subtotal: orderResult.subtotal || subtotal,
        discountAmount: orderResult.discountAmount || discountAmount,
        finalTotal: orderResult.totalAmount || finalTotal,
        couponCode: orderResult.couponCode,
        createdAt: orderResult.createdAt,
      }
    : null;

  const formatTimer = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16" dir="rtl">
      {/* Live Collaboration Toast */}
      {liveToast && (
        <div className="fixed bottom-6 left-6 z-50 animate-bounce shadow-2xl">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-lg border border-emerald-400/40">
            <Radio className="w-4 h-4 animate-pulse text-emerald-200" />
            <span>{liveToast.actor}:</span>
            <span className="font-normal text-emerald-100">{liveToast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <span>עגלת קניות ותשלום</span>
            {sharedRoomId && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                שיתופית פעילה
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            רכישה מאובטחת בתקן PCI-DSS • משלוח אקספרס חינם • צבירת 5% Cashback VIP
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!sharedRoomId && !orderResult && cart.length > 0 && (
            <button
              onClick={handleStartSharedCart}
              disabled={isStartingShared}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/20 transition active:scale-95 disabled:opacity-50"
            >
              <Users className="w-4 h-4" />
              <span>{isStartingShared ? "פותח חדר שיתוף..." : "קניות ביחד (סל שיתופי)"}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </button>
          )}

          <Link
            href="/"
            className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>המשך בקניות</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </div>

      {/* Collaborative Cart Bar when Active */}
      {sharedRoomId && !orderResult && (
        <CollaborativeCartBar
          roomId={sharedRoomId}
          participants={participants}
          activities={activities}
          currentUserId={currentParticipantId}
          onLeave={handleLeaveSharedCart}
        />
      )}

      {/* Reservation Timer Bar */}
      {cart.length > 0 && !orderResult && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold">
            <Clock className="w-4 h-4 text-amber-500 animate-spin-slow" />
            <span>הפריטים בסל שמורים עבורכם למשך 10 דקות:</span>
          </div>
          <span className="font-mono font-black text-sm bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-amber-500/30">
            {formatTimer(timerSeconds)}
          </span>
        </div>
      )}

      {/* Success View */}
      {orderResult ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 text-emerald-900 dark:text-emerald-100 space-y-5 animate-fade-in shadow-xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
            <div>
              <h3 className="text-lg sm:text-xl font-black">ההזמנה נוצרה ואושרה בהצלחה!</h3>
              <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                קבלה דיגיטלית הופקה ונשלחה ל-Gmail, שליח אקספרס תואם ו-5% Cashback נוספו לארנק ה-VIP שלך!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl text-xs font-mono border border-emerald-500/20">
            <div>
              <span className="text-slate-400 block">מספר הזמנה:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                #{orderResult.orderId.substring(0, 8)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">סטטוס:</span>
              <span className="font-bold text-emerald-500">מאושרת ונארזת</span>
            </div>
            <div>
              <span className="text-slate-400 block">סכום שחויב:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {formatPrice(orderResult.totalAmount)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">קופון נוצל:</span>
              <span className="font-bold text-amber-500">{orderResult.couponCode || "ללא"}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              onClick={() => setIsReceiptOpen(true)}
              variant="primary"
              className="bg-amber-500 text-slate-950 font-bold"
              icon={<Receipt className="w-4 h-4" />}
            >
              פתח קבלה דיגיטלית
            </Button>
            <Link href="/orders">
              <Button variant="outline">מעקב הזמנות מלא</Button>
            </Link>
          </div>
        </div>
      ) : cart.length === 0 ? (
        <div className="text-center py-16 space-y-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
          <ShoppingBag className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">עגלת הקניות שלך ריקה</h3>
          <p className="text-xs text-slate-400">
            גלה את מוצרי הפרימיום שלנו ותיהנה ממשלוח חינם ו-5% Cashback בכל קנייה
          </p>
          <Link href="/">
            <Button variant="primary" className="bg-amber-500 text-slate-950 font-bold">
              התחל לקנות
            </Button>
          </Link>
        </div>
      ) : (
        /* Cart Items & Wide Horizontal FinTech Center */
        <div className="space-y-8">
          {/* Cart Items List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>מוצרים שנבחרו לרכישה</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-bold">
                  {cart.length} פריטים
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cart.map((item) => {
                const isHighlighted = highlightedSku === item.skuCode;
                return (
                  <div
                    key={item.skuCode}
                    className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-300 flex items-center justify-between gap-4 shadow-sm ${
                      isHighlighted
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl overflow-hidden shrink-0">
                        {item.image && (item.image.startsWith("http") || item.image.startsWith("/")) ? (
                          <img
                            src={item.image}
                            alt={item.name || item.skuCode}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          item.image || "📦"
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {item.productName || item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-400 font-mono">{item.skuCode}</span>
                          {item.lastUpdatedBy && sharedRoomId && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium truncate">
                              עודכן ע״י {item.lastUpdatedBy}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                          {formatPrice(item.price || item.unitPrice || 0)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 h-8 px-1">
                        <button
                          onClick={() => updateQuantity(item.skuCode, -1)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                          title="הפחת כמות"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.skuCode, 1)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                          title="הגדל כמות"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.skuCode)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                        title="הסר מהסל"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wide Horizontal FinTech Center (לרוחב) */}
          <div className="w-full">
            <CheckoutSummaryCard
              subtotal={subtotal}
              discountAmount={discountAmount}
              finalTotal={finalTotal}
              appliedCoupon={appliedCoupon}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={() => setAppliedCoupon(null)}
              couponError={couponError}
              paymentToken={paymentToken}
              onPaymentTokenChange={setPaymentToken}
              loading={loading}
              checkoutStep={checkoutStep}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      )}

      {/* Digital Thermal Receipt Modal */}
      <DigitalReceiptModal data={receiptData} isOpen={isReceiptOpen} onClose={() => setIsReceiptOpen(false)} />
    </div>
  );
}
