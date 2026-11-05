"use client";

import React, { useState } from "react";
import { Sparkles, X, CheckCircle2, TrendingDown, Tag, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useCurrency } from "../../context/CurrencyContext";

export interface DealNegotiatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    skuCode: string;
    productName: string;
    unitPrice: number;
    imageUrl?: string;
  } | null;
}

export const DealNegotiatorModal: React.FC<DealNegotiatorModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const { formatPrice } = useCurrency();
  const [userOffer, setUserOffer] = useState<string>("");
  const [round, setRound] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [negotiationResult, setNegotiationResult] = useState<any | null>(null);
  const [messages, setMessages] = useState<Array<{ sender: "agent" | "user"; text: string }>>([]);

  if (!isOpen || !product) return null;

  const handleStartOrContinue = async () => {
    const offerNum = parseFloat(userOffer);
    if (!offerNum || offerNum <= 0) return;

    setLoading(true);
    const newMessages = [...messages, { sender: "user" as const, text: `אני מעוניין לרכוש ב-₪${offerNum.toLocaleString()}` }];
    setMessages(newMessages);

    try {
      const res = await fetch("/api/agents/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skuCode: product.skuCode,
          userOffer: offerNum,
          round,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNegotiationResult(data);
        setMessages([...newMessages, { sender: "agent" as const, text: data.message }]);
        setRound((prev) => prev + 1);
      }
    } catch {
      setMessages([
        ...newMessages,
        { sender: "agent" as const, text: "שגיאה רגעית בתקשורת. בוא נסגור על הנחת 10% עם הקופון WELCOME10!" },
      ]);
    } finally {
      setLoading(false);
      setUserOffer("");
    }
  };

  const handleApplyDealAndAdd = () => {
    if (!negotiationResult?.couponCode) return;

    // Apply coupon to sessionStorage for cart
    try {
      sessionStorage.setItem("pending_coupon", negotiationResult.couponCode);
      window.dispatchEvent(
        new CustomEvent("apply-coupon", { detail: { code: negotiationResult.couponCode } })
      );
    } catch {}

    // Add product to cart
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingIdx = cart.findIndex((i: any) => i.skuCode === product.skuCode);
      if (existingIdx >= 0) {
        cart[existingIdx].quantity += 1;
      } else {
        cart.push({
          skuCode: product.skuCode,
          name: product.productName,
          title: product.productName,
          price: product.unitPrice,
          quantity: 1,
        });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));
    } catch {}

    onClose();
    window.location.href = "/cart";
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl text-white flex flex-col space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 start-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">סוכן משא ומתן אוטונומי</h3>
            <p className="text-[11px] text-slate-400">משא ומתן בזמן אמת על בסיס מרווחי יבואן ומעמד VIP</p>
          </div>
        </div>

        {/* Product Summary Strip */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-100">{product.productName}</h4>
            <span className="text-[11px] text-slate-400 font-mono">מק&quot;ט: {product.skuCode}</span>
          </div>
          <div className="text-left font-mono font-black text-amber-400 text-sm sm:text-base">
            {formatPrice(product.unitPrice)}
          </div>
        </div>

        {/* Dialogue Scroll Box */}
        <div className="min-h-[140px] max-h-[220px] overflow-y-auto space-y-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs sm:text-sm">
          {messages.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-indigo-400 animate-pulse" />
              <p>שלום! כמה תרצה לשלם על המוצר? הזן את הצעתך ונתחיל במשא ומתן.</p>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl leading-relaxed ${
                  m.sender === "user"
                    ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/30 ms-auto max-w-[85%]"
                    : "bg-slate-800 text-slate-200 border border-slate-700 me-auto max-w-[90%]"
                }`}
              >
                <span className="font-bold block mb-1 text-[11px] text-slate-400">
                  {m.sender === "user" ? "ההצעה שלך:" : "סוכן משא ומתן:"}
                </span>
                {m.text}
              </div>
            ))
          )}
        </div>

        {/* Deal Accepted / Ready Card */}
        {negotiationResult?.couponCode && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm text-emerald-300 font-bold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>הסכם הושג! מחיר סופי: {formatPrice(negotiationResult.agreedPrice)}</span>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono">
                {negotiationResult.discountPercent}% הנחה
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
              <span>קוד קופון בלעדי: <strong className="font-mono text-amber-400">{negotiationResult.couponCode}</strong></span>
              <Button
                size="sm"
                variant="primary"
                onClick={handleApplyDealAndAdd}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs"
              >
                הפעל ועבור לקופה
              </Button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-1">
          <Input
            type="number"
            placeholder={`הזן מחיר מבוקש בשקלים (למשל: ${Math.round(product.unitPrice * 0.9)})`}
            value={userOffer}
            onChange={(e) => setUserOffer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStartOrContinue()}
            className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm"
          />
          <Button
            onClick={handleStartOrContinue}
            disabled={loading || !userOffer}
            variant="primary"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shrink-0 text-xs sm:text-sm"
          >
            {loading ? "סוכן מחשב..." : "הצע מחיר"}
          </Button>
        </div>
      </div>
    </div>
  );
};
