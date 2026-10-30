"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Truck,
  Tag,
  Clock,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface CartItem {
  skuCode: string;
  productName: string;
  name?: string;
  quantity: number;
  unitPrice: number;
  price?: number;
  imageUrl?: string;
  image?: string;
}

export const CartDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes reservation timer

  const loadCart = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("cart") || "[]");
      setItems(stored);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    loadCart();
    const handleCartUpdate = () => loadCart();
    const handleOpenDrawer = () => {
      loadCart();
      setIsOpen(true);
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    window.addEventListener("open-cart-drawer", handleOpenDrawer);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("open-cart-drawer", handleOpenDrawer);
    };
  }, []);

  // 10-minute Countdown Timer
  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [items.length]);

  const updateQuantity = (sku: string, delta: number) => {
    const next = items
      .map((item) => {
        if (item.skuCode === sku) {
          const q = (item.quantity || 1) + delta;
          return { ...item, quantity: q };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    setItems(next);
    localStorage.setItem("cart", JSON.stringify(next));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const removeItem = (sku: string) => {
    const next = items.filter((item) => item.skuCode !== sku);
    setItems(next);
    localStorage.setItem("cart", JSON.stringify(next));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const subtotal = items.reduce(
    (sum, i) => sum + (i.unitPrice || i.price || 0) * (i.quantity || 1),
    0
  );

  const FREE_SHIPPING_THRESHOLD = 500;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 end-0 max-w-full flex pl-10">
        <div
          className="w-screen max-w-md bg-white dark:bg-slate-900 border-s border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                עגלת קניות ({items.reduce((s, i) => s + (i.quantity || 1), 0)})
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Flash Sale Reservation Timer */}
          {items.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 px-4 py-2 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin-slow" />
                <span>המלאי משוריין עבורך ב-Redis:</span>
              </div>
              <span className="font-mono font-bold text-sm bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                {formatTimer(timerSeconds)}
              </span>
            </div>
          )}

          {/* Free Shipping Progress Bar */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-brand-600" />
                {remainingForFreeShipping > 0 ? (
                  <span>
                    עוד <strong className="text-brand-600 dark:text-brand-400">₪{remainingForFreeShipping}</strong> למשלוח חינם!
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    🎉 זכית במשלוח מהיר חינם!
                  </span>
                )}
              </span>
              <span className="font-mono text-slate-400 text-[11px]">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <ShoppingBag className="w-12 h-12 stroke-[1.5] mb-3 text-slate-300 dark:text-slate-700" />
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">העגלה שלך ריקה כרגע</p>
                <p className="text-xs text-slate-400 mt-1">הוסף מוצרים מהקטלוג כדי ליהנות ממשלוח מהיר</p>
              </div>
            ) : (
              items.map((item) => {
                const img = item.imageUrl || item.image;
                const unit = item.unitPrice || item.price || 0;
                return (
                  <div key={item.skuCode} className="pt-3 first:pt-0 flex items-center gap-3">
                    {img ? (
                      <img
                        src={img}
                        alt={item.productName || item.name || ""}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0">
                        📦
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {item.productName || item.name}
                      </h4>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                        ₪{unit}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                          <button
                            onClick={() => updateQuantity(item.skuCode, -1)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-slate-900 dark:text-slate-100 font-mono">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.skuCode, 1)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.skuCode)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                          title="הסר מוצר"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 space-y-3">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>סכום ביניים:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">₪{subtotal}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>דמי משלוח:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {remainingForFreeShipping === 0 ? "חינם (VIP Express)" : "₪29.00"}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>סה״כ לתשלום:</span>
                <span className="text-brand-600 dark:text-brand-400 font-mono text-lg">
                  ₪{remainingForFreeShipping === 0 ? subtotal : subtotal + 29}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition"
                >
                  <span>צפה בעגלה</span>
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition"
                >
                  <span>מעבר לתשלום</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
