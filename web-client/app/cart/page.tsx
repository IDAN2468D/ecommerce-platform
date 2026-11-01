"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Tag,
  X,
  TicketPercent,
  Check,
  RefreshCw,
  Clock,
  Sparkles,
  Award,
  Zap,
  ShoppingBag,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";

interface CartItem {
  skuCode: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface AppliedCoupon {
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
  message: string;
}

interface RecommendedItem {
  skuCode: string;
  name: string;
  price: number;
  reason: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentToken, setPaymentToken] = useState("pm_card_visa_ok");
  const [currency, setCurrency] = useState("ILS");
  const [loading, setLoading] = useState(false);
  const [sagaStep, setSagaStep] = useState<number>(0);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 10-Minute Flash Sale Reservation Countdown
  const [reservationSeconds, setReservationSeconds] = useState(600);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Loyalty VIP Wallet state
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(150);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [pointsRedeemedApplied, setPointsRedeemedApplied] = useState<number>(0);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(saved);
    }
  }, []);

  // Countdown timer for 10 minutes inventory hold
  useEffect(() => {
    if (cart.length === 0) return;
    const interval = setInterval(() => {
      setReservationSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cart.length]);

  // Fetch Loyalty points & cross-sell recommendations
  useEffect(() => {
    let customerId = "usr_demo";
    try {
      const savedUser = JSON.parse(localStorage.getItem("auth_user") || "null");
      if (savedUser?.userId) customerId = savedUser.userId;
    } catch {}

    fetch("/api/loyalty/wallet", {
      headers: { "x-customer-id": customerId },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.pointsBalance !== undefined) {
          setLoyaltyPoints(data.pointsBalance);
        }
      })
      .catch(() => {});

    if (cart.length > 0) {
      const primarySku = cart[0].skuCode;
      fetch(`/api/recommendations/${primarySku}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.recommendedProducts)) {
            setRecommendations(data.recommendedProducts);
          } else if (Array.isArray(data)) {
            setRecommendations(data);
          }
        })
        .catch(() => {});
    }
  }, [cart.length]);

  const updateQuantity = (skuCode: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.skuCode === skuCode) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cart-updated"));

    if (appliedCoupon) {
      setAppliedCoupon(null);
      setCouponError("סכום העגלה השתנה. אנא החל את הקופון מחדש.");
    }
  };

  const removeItem = (skuCode: string) => {
    const updated = cart.filter((item) => item.skuCode !== skuCode);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cart-updated"));
    if (appliedCoupon) {
      setAppliedCoupon(null);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const loyaltyDiscount = pointsRedeemedApplied; // 1 point = 1 ILS
  const finalTotal = Math.max(0, subtotal - discountAmount - loyaltyDiscount);

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch("/api/orders/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode: couponInput.trim(),
          orderAmount: subtotal,
        }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
        setCouponError(null);
      } else {
        setAppliedCoupon(null);
        setCouponError(data.message || "קוד קופון זה אינו תקף.");
      }
    } catch (e: any) {
      setCouponError("שגיאת תקשורת באימות הקופון: " + e.message);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  };

  const handleApplyPoints = () => {
    if (pointsToRedeem <= 0 || pointsToRedeem > loyaltyPoints) return;
    setPointsRedeemedApplied(pointsToRedeem);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setErrorMsg(null);
    setOrderResult(null);

    // Step 1: Inventory
    setSagaStep(1);
    await new Promise((r) => setTimeout(r, 350));

    // Step 2: Payment
    setSagaStep(2);
    await new Promise((r) => setTimeout(r, 350));

    try {
      const savedToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      let customerId = "usr_demo";
      try {
        const savedUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("auth_user") || "null") : null;
        if (savedUser && savedUser.userId) {
          customerId = savedUser.userId;
        }
      } catch {}

      const payload = {
        currency,
        paymentMethodToken: paymentToken,
        customerId: customerId,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        items: cart.map((item) => ({
          skuCode: item.skuCode,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      };

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (savedToken && !["null", "undefined", ""].includes(savedToken.trim())) {
        headers["Authorization"] = `Bearer ${savedToken}`;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      let data: any = {};
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: "תגובת שרת לא תקינה" };
      }

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("auth_token");
        }
        throw new Error(data.error || data.detail || data.message || "הזמנה נכשלה בשרת");
      }

      setSagaStep(3);
      setOrderResult(data);
      localStorage.removeItem("cart");
      setCart([]);
      setAppliedCoupon(null);
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err: any) {
      setErrorMsg(err.message);
      setSagaStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">עגלת קניות ותשלום</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            תזמור טרנזקציית SAGA מקצה לקצה, שריון מלאי 10 דקות, צבירת 5% קאשבק והפצת אירועים ב-Kafka
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1.5"
        >
          <span>המשך בקניות</span>
          <ArrowRight className="w-4 h-4 rotate-180" />
        </Link>
      </div>

      {/* 10-Minute Flash Sale Reservation Banner */}
      {cart.length > 0 && !orderResult && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-400/40 text-amber-900 dark:text-amber-200 flex items-center justify-between text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse flex-shrink-0" />
            <span>
              <strong>המלאי בעגלה משוריין עבורך ל-10 דקות</strong> (נעילה פסימית ב-Inventory Service).
            </span>
          </div>
          <div className="font-mono font-black text-sm bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-400/30">
            {formatTimer(reservationSeconds)}
          </div>
        </div>
      )}

      {/* Order Success Card */}
      {orderResult && (
        <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 space-y-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold">ההזמנה נוצרה ואושרה בהצלחה! (201 Created)</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                אירוע הופץ ב-Apache Kafka, שילוח תואם אוטומטית ונצבר 5% Cashback בארנק ה-VIP!
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl text-xs font-mono border border-emerald-200/60 dark:border-emerald-800">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">מזהה הזמנה:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">#{orderResult.orderId.substring(0, 8)}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">סטטוס SAGA:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{orderResult.status}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">סכום סופי שחויב:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">₪{orderResult.totalAmount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">קופון שנוצל:</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">{orderResult.couponCode || "ללא"}</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Link href="/orders">
              <Button variant="success" size="md">
                צפה בהזמנה בלוח המעקב והורד קבלה (PDF)
              </Button>
            </Link>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-3 shadow-subtle animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold block">שגיאה בתזמור ההזמנה:</span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {cart.length === 0 && !orderResult ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4 shadow-subtle">
          <div className="text-5xl">🛒</div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">עגלת הקניות שלך ריקה</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            בחר מוצרים מתוך הקטלוג כדי לראות את תהליך ה-SAGA, בדיקת הקופונים והשריון מול Apache Kafka.
          </p>
          <Link href="/">
            <Button variant="primary" size="lg">
              חזרה לקטלוג
            </Button>
          </Link>
        </div>
      ) : cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-subtle">
              {cart.map((item) => (
                <div key={item.skuCode} className="p-4 sm:p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-3xl overflow-hidden p-1 flex-shrink-0">
                      {item.image && (item.image.startsWith("http") || item.image.startsWith("/")) ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain rounded-lg" />
                      ) : (
                        item.image || "📦"
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">{item.name}</h4>
                      <span className="text-xs font-mono text-slate-400">{item.skuCode}</span>
                      <div className="font-black text-slate-900 dark:text-slate-100 text-sm mt-1">
                        ₪{item.price.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                      <button
                        onClick={() => updateQuantity(item.skuCode, -1)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-600 dark:text-slate-300"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-900 dark:text-slate-100">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.skuCode, 1)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-600 dark:text-slate-300"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.skuCode)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Coupon Helper Cards */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <TicketPercent className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>קודי קופון זמינים לניסיון:</span>
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCouponInput("WELCOME10")}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-xs text-slate-700 dark:text-slate-300 font-mono transition"
                >
                  WELCOME10 (10% הנחה)
                </button>
                <button
                  type="button"
                  onClick={() => setCouponInput("SUPER500")}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-xs text-slate-700 dark:text-slate-300 font-mono transition"
                >
                  SUPER500 (₪500 מעל ₪3,000)
                </button>
                <button
                  type="button"
                  onClick={() => setCouponInput("VIP20")}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-xs text-slate-700 dark:text-slate-300 font-mono transition"
                >
                  VIP20 (20% מעל ₪5,000)
                </button>
              </div>
            </div>

            {/* Cross-Sell Recommendations */}
            {recommendations.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>לקוחות שקנו פריטים אלו הוסיפו גם:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendations.slice(0, 2).map((rec) => (
                    <div
                      key={rec.skuCode}
                      className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{rec.name || rec.skuCode}</div>
                        <div className="text-slate-500 font-mono">₪{rec.price?.toLocaleString() || "199"}</div>
                      </div>
                      <button
                        onClick={() => {
                          const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
                          currentCart.push({
                            skuCode: rec.skuCode,
                            name: rec.name || rec.skuCode,
                            price: rec.price || 199,
                            quantity: 1,
                            image: "📦",
                          });
                          localStorage.setItem("cart", JSON.stringify(currentCart));
                          setCart(currentCart);
                          window.dispatchEvent(new Event("cart-updated"));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 hover:bg-brand-100 font-bold transition"
                      >
                        + הוסף
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Checkout & Coupon Box */}
          <div className="space-y-4">
            <Card className="p-6 space-y-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800">
                סיכום הזמנה (Checkout)
              </h3>

              {/* Loyalty VIP Wallet Section */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 dark:from-amber-950/30 to-orange-50 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-200">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>ארנק VIP Cashback (5%):</span>
                  </div>
                  <span className="font-mono text-sm">{loyaltyPoints} נקודות</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  צברת נקודות אלו מקניות קודמות (1 נקודה = ₪1).
                </p>
                {loyaltyPoints > 0 && (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="number"
                      max={loyaltyPoints}
                      min={1}
                      value={pointsToRedeem || ""}
                      onChange={(e) => setPointsToRedeem(Math.min(loyaltyPoints, Number(e.target.value)))}
                      placeholder="כמות למימוש"
                      className="w-24 p-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-xs text-center"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPoints}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition text-xs flex-1"
                    >
                      ממש נקודות (הנחה)
                    </button>
                  </div>
                )}
                {pointsRedeemedApplied > 0 && (
                  <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    ✓ מומשו {pointsRedeemedApplied} נקודות (₪{pointsRedeemedApplied} הנחה)!
                  </div>
                )}
              </div>

              {/* Coupon Input Box */}
              <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>קוד קופון / שובר הנחה:</span>
                </label>

                {appliedCoupon ? (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        <span>קופון פעיל: {appliedCoupon.code}</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300">{appliedCoupon.message}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1 hover:bg-emerald-100 rounded-md text-emerald-800 dark:text-emerald-200 transition"
                      title="הסר קופון"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="הזן קוד (למשל WELCOME10)"
                      className="font-mono uppercase bg-white dark:bg-slate-800 dark:border-slate-700"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      loading={validatingCoupon}
                      variant="outline"
                      size="md"
                      className="flex-shrink-0"
                    >
                      החל
                    </Button>
                  </div>
                )}

                {couponError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium animate-fade-in">{couponError}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>סכום ביניים:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">₪{subtotal.toLocaleString()}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold animate-fade-in">
                    <span>הנחת קופון ({appliedCoupon.code}):</span>
                    <span>- ₪{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                {pointsRedeemedApplied > 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold animate-fade-in">
                    <span>מימוש נקודות VIP ({pointsRedeemedApplied} נק'):</span>
                    <span>- ₪{pointsRedeemedApplied.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>משלוח מהיר עד הבית:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">חינם</span>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-base font-black text-slate-900 dark:text-slate-100">
                  <span>סה״כ לתשלום:</span>
                  <span className="text-brand-600 dark:text-brand-400 text-xl">₪{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Simulation Options */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  סימולציית תשלום (Payment Gateway):
                </label>
                <select
                  value={paymentToken}
                  onChange={(e) => setPaymentToken(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="pm_card_visa_ok">כרטיס תקין (סליקה מאושרת)</option>
                  <option value="pm_card_visa_decline">כרטיס חסום (בדיקת פיצוי SAGA)</option>
                </select>
              </div>

              {/* SAGA Step Flow */}
              {loading && (
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs animate-fade-in">
                  <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-bold">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>תזמור SAGA מבוזר בפעולה:</span>
                  </div>
                  <div className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                    <div className={sagaStep >= 1 ? "text-emerald-700 dark:text-emerald-400 font-bold" : ""}>
                      {sagaStep >= 1 ? "✓" : "○"} 1. שריון מלאי פסימי ב-Inventory Service
                    </div>
                    <div className={sagaStep >= 2 ? "text-emerald-700 dark:text-emerald-400 font-bold" : ""}>
                      {sagaStep >= 2 ? "✓" : "○"} 2. סליקת תשלום אידמפוטנטית ב-Payment Service
                    </div>
                    <div className={sagaStep >= 3 ? "text-emerald-700 dark:text-emerald-400 font-bold" : ""}>
                      {sagaStep >= 3 ? "✓" : "○"} 3. הפצת OrderCreatedEvent ב-Apache Kafka & תיאום שילוח
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleCheckout}
                loading={loading}
                variant="primary"
                size="lg"
                className="w-full"
                icon={<ShieldCheck className="w-5 h-5" />}
              >
                בצע הזמנה מאובטחת
              </Button>
            </Card>
          </div>
        </div>
      ) : null}

      {/* Mobile Sticky Bottom Checkout Floating Dock */}
      {cart.length > 0 && !orderResult && (
        <div className="md:hidden fixed bottom-16 inset-x-0 z-30 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200/90 dark:border-amber-500/20 shadow-2xl flex items-center justify-between gap-3 animate-slide-up">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">סה״כ לתשלום:</span>
            <span className="text-lg font-black text-slate-900 dark:text-amber-400">₪{finalTotal.toLocaleString()}</span>
          </div>
          <Button
            onClick={handleCheckout}
            loading={loading}
            variant="primary"
            size="md"
            className="flex-1 max-w-[210px] h-11 text-xs font-bold"
            icon={<ShieldCheck className="w-4 h-4" />}
          >
            {loading ? "מתזמר SAGA..." : "הזמן עכשיו ב-SAGA"}
          </Button>
        </div>
      )}
    </div>
  );
}