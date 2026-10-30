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

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentToken, setPaymentToken] = useState("pm_card_visa_ok");
  const [currency, setCurrency] = useState("ILS");
  const [loading, setLoading] = useState(false);
  const [sagaStep, setSagaStep] = useState<number>(0);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(saved);
    }
  }, []);

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

    // Reset applied coupon if cart items change
    if (appliedCoupon) {
      setAppliedCoupon(null);
      setCouponError("סכום העגלה השתנה. אנא החל את הקופון מחדש.");
    }
  };

  const removeItem = (skuCode: string) => {
    const updated = cart.filter((item) => item.skuCode !== skuCode);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    if (appliedCoupon) {
      setAppliedCoupon(null);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

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

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setErrorMsg(null);
    setOrderResult(null);

    // Step 1: Inventory
    setSagaStep(1);
    await new Promise((r) => setTimeout(r, 400));

    // Step 2: Payment
    setSagaStep(2);
    await new Promise((r) => setTimeout(r, 400));

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
      if (savedToken) {
        headers["Authorization"] = `Bearer ${savedToken}`;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.detail || "הזמנה נכשלה בסרבר");
      }

      setSagaStep(3);
      setOrderResult(data);
      localStorage.removeItem("cart");
      setCart([]);
      setAppliedCoupon(null);
    } catch (err: any) {
      setErrorMsg(err.message);
      setSagaStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">עגלת קניות ותשלום</h1>
          <p className="text-sm text-slate-500">
            תזמור טרנזקציית SAGA מקצה לקצה, בדיקת קופונים והפצת אירועים ב-Kafka
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5"
        >
          <span>המשך בקניות</span>
          <ArrowRight className="w-4 h-4 rotate-180" />
        </Link>
      </div>

      {orderResult && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold">ההזמנה נוצרה ואושרה בהצלחה! (201 Created)</h3>
              <p className="text-xs text-emerald-700">
                אירוע הופץ ב-Apache Kafka ונשלח עדכון ל-Notification Service
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white/80 p-4 rounded-2xl text-xs font-mono">
            <div>
              <span className="text-slate-500 block">מזהה הזמנה:</span>
              <span className="font-bold text-slate-900">#{orderResult.orderId.substring(0, 8)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">סטטוס SAGA:</span>
              <span className="font-bold text-emerald-700">{orderResult.status}</span>
            </div>
            <div>
              <span className="text-slate-500 block">סכום סופי שחויב:</span>
              <span className="font-bold text-slate-900">₪{orderResult.totalAmount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block">קופון שנוצל:</span>
              <span className="font-bold text-brand-600">{orderResult.couponCode || "ללא"}</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Link href="/orders">
              <Button variant="success" size="md">
                צפה בהזמנה בלוח המעקב
              </Button>
            </Link>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 shadow-subtle animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold block">שגיאה בתזמור ההזמנה:</span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {cart.length === 0 && !orderResult ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-subtle">
          <div className="text-5xl">🛒</div>
          <h3 className="text-xl font-bold text-slate-800">עגלת הקניות שלך ריקה</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
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
            <div className="bg-white rounded-3xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-subtle">
              {cart.map((item) => (
                <div key={item.skuCode} className="p-4 sm:p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl overflow-hidden p-1 flex-shrink-0">
                      {item.image && (item.image.startsWith("http") || item.image.startsWith("/")) ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain rounded-lg" />
                      ) : (
                        item.image || "📦"
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">{item.name}</h4>
                      <span className="text-xs font-mono text-slate-400">{item.skuCode}</span>
                      <div className="font-black text-slate-900 text-sm mt-1">
                        ₪{item.price.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.skuCode, -1)}
                        className="p-1.5 hover:bg-slate-200 transition text-slate-600"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.skuCode, 1)}
                        className="p-1.5 hover:bg-slate-200 transition text-slate-600"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.skuCode)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Coupon Helper Cards */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <TicketPercent className="w-4 h-4 text-brand-600" />
                <span>קודי קופון זמינים לניסיון:</span>
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCouponInput("WELCOME10")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-brand-500 text-xs text-slate-700 font-mono transition"
                >
                  WELCOME10 (10% הנחה)
                </button>
                <button
                  type="button"
                  onClick={() => setCouponInput("SUPER500")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-brand-500 text-xs text-slate-700 font-mono transition"
                >
                  SUPER500 (₪500 מעל ₪3,000)
                </button>
                <button
                  type="button"
                  onClick={() => setCouponInput("VIP20")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-brand-500 text-xs text-slate-700 font-mono transition"
                >
                  VIP20 (20% מעל ₪5,000)
                </button>
              </div>
            </div>
          </div>

          {/* Checkout & Coupon Box */}
          <div className="space-y-4">
            <Card className="p-6 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
                סיכום הזמנה (Checkout)
              </h3>

              {/* Coupon Input Box */}
              <div className="space-y-2 pb-4 border-b border-slate-100">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-600" />
                  <span>קוד קופון / שובר הנחה:</span>
                </label>

                {appliedCoupon ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <Check className="w-3.5 h-3.5" />
                        <span>קופון פעיל: {appliedCoupon.code}</span>
                      </div>
                      <p className="text-[11px] text-emerald-700">{appliedCoupon.message}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1 hover:bg-emerald-100 rounded-md text-emerald-800 transition"
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
                      className="font-mono uppercase"
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
                  <p className="text-xs text-rose-600 font-medium animate-fade-in">{couponError}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>סכום ביניים:</span>
                  <span className="font-semibold">₪{subtotal.toLocaleString()}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-bold animate-fade-in">
                    <span>הנחת קופון ({appliedCoupon.code}):</span>
                    <span>- ₪{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>משלוח מהיר עד הבית:</span>
                  <span className="text-emerald-600 font-semibold">חינם</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-black text-slate-900">
                  <span>סה״כ לתשלום:</span>
                  <span className="text-brand-600 text-xl">₪{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Simulation Options */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">
                  סימולציית תשלום (Payment Gateway):
                </label>
                <select
                  value={paymentToken}
                  onChange={(e) => setPaymentToken(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="pm_card_visa_ok">כרטיס תקין (סליקה מאושרת)</option>
                  <option value="pm_card_visa_decline">כרטיס חסום (בדיקת פיצוי SAGA)</option>
                </select>
              </div>

              {/* SAGA Step Flow */}
              {loading && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs animate-fade-in">
                  <div className="flex items-center gap-2 text-brand-700 font-bold">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>תזמור SAGA מבוזר בפעולה:</span>
                  </div>
                  <div className="space-y-1 text-slate-600 text-[11px]">
                    <div className={sagaStep >= 1 ? "text-emerald-700 font-bold" : ""}>
                      {sagaStep >= 1 ? "✓" : "○"} 1. שריון מלאי פסימי ב-Inventory Service
                    </div>
                    <div className={sagaStep >= 2 ? "text-emerald-700 font-bold" : ""}>
                      {sagaStep >= 2 ? "✓" : "○"} 2. סליקת תשלום אידמפוטנטית ב-Payment Service
                    </div>
                    <div className={sagaStep >= 3 ? "text-emerald-700 font-bold" : ""}>
                      {sagaStep >= 3 ? "✓" : "○"} 3. הפצת OrderCreatedEvent ב-Apache Kafka
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
    </div>
  );
}
