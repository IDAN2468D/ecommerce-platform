"use client";

import React, { useState } from "react";
import { ShoppingCart, Check, Heart, Eye, Sparkles, Truck, Copy, Plus, Minus, Box, Flame, Star, Scale, BadgePercent } from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";

export interface ProductCardProps {
  skuCode: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock?: { availableQuantity: number; reservedQuantity: number };
  onAddToCart: (product: any) => void;
  isCompared?: boolean;
  onToggleCompare?: (skuCode: string) => void;
  onOpenQuickView?: (product: any) => void;
  isFeatured?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  skuCode,
  name,
  price,
  description,
  image,
  category,
  stock,
  onAddToCart,
  isCompared = false,
  onToggleCompare,
  onOpenQuickView,
  isFeatured = false,
}) => {
  const { formatPrice } = useCurrency();
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [copiedSku, setCopiedSku] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const isUrl = Boolean(image && (image.startsWith("http") || image.startsWith("/")));
  const available = stock?.availableQuantity ?? 0;
  const isOutOfStock = stock !== undefined && available <= 0;
  const isLowStock = stock !== undefined && available > 0 && available <= 10;
  const originalPrice = Math.round(price * 1.18);
  const discountAmount = Math.max(0, originalPrice - price);
  const cashbackReward = Math.round(price * 0.05);

  const handleAdd = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isOutOfStock) return;
    onAddToCart({
      skuCode,
      name,
      productName: name,
      price,
      unitPrice: price,
      image,
      imageUrl: image,
      quantity,
    });
    setIsAdded(true);
    window.dispatchEvent(new Event("open-cart-drawer"));
    setTimeout(() => {
      setIsAdded(false);
      setQuantity(1);
    }, 1800);
  };

  const handleCopySku = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(skuCode);
      setCopiedSku(true);
      setTimeout(() => setCopiedSku(false), 1500);
    }
  };

  return (
    <div className={`group relative flex flex-col justify-between rounded-[2rem] bg-white dark:bg-[#0c0d14]/90 backdrop-blur-2xl border border-slate-200/90 dark:border-amber-500/15 hover:border-amber-500/50 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden ${
      isFeatured ? "electric-border-card" : ""
    }`}>
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-300 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30 pointer-events-none" />

      <div className="relative z-10">
        {/* Visual Box */}
        <div
          onClick={() => onOpenQuickView?.({ skuCode, name, price, description, image, category, stock })}
          className="relative h-72 sm:h-80 w-full bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950/40 dark:via-slate-900/60 dark:to-slate-950 overflow-hidden cursor-pointer flex items-center justify-center p-6 border-b border-slate-200/60 dark:border-slate-800/80"
        >
          {isUrl && !imgError ? (
            <img src={image} alt={name} loading="lazy" onError={() => setImgError(true)} className={`w-full h-full object-contain transform transition-transform duration-700 ease-out group-hover:scale-108 ${isOutOfStock ? "grayscale opacity-50" : ""}`} />
          ) : (
            <div className="text-8xl sm:text-9xl select-none group-hover:scale-110 duration-500">{image && !isUrl ? image : "📦"}</div>
          )}

          {/* Top Badges */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between gap-2 z-20">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-amber-300 backdrop-blur-md shadow-md border border-slate-200 dark:border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {category}
            </span>
            <div>
              {stock === undefined ? (
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300">מסנכרן...</span>
              ) : isOutOfStock ? (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-600 text-white shadow-md">אזל מהמלאי</span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-current" /> נותרו {available} בלבד!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-md">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> במלאי ({available})
                </span>
              )}
            </div>
          </div>

          {/* Floating Actions */}
          <div className="absolute left-4 top-16 flex flex-col gap-2 z-20 opacity-100 sm:opacity-0 sm:-translate-x-3 sm:group-hover:opacity-100 sm:group-hover:translate-x-0 transition-all duration-300">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
              title="הוסף למועדפים"
              className={`w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md border transition-all shadow-lg active:scale-90 ${isWishlisted ? "bg-rose-500 text-white border-rose-400" : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:text-rose-500"}`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
            {onToggleCompare && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggleCompare(skuCode); }}
                title="השוואת מוצרים"
                className={`w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md border transition-all shadow-lg active:scale-90 ${isCompared ? "bg-amber-500 text-slate-950 border-amber-400 font-bold" : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:text-amber-500"}`}
              >
                <Scale className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenQuickView?.({ skuCode, name, price, description, image, category, stock }); }}
              title="תצוגה מהירה"
              className="w-10 h-10 rounded-2xl bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-amber-500 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all shadow-lg active:scale-90"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Bar: SKU & Cashback */}
          <div className="absolute bottom-3 inset-x-4 flex items-center justify-between gap-2 z-20">
            <button type="button" onClick={handleCopySku} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 text-xs font-mono border border-slate-200 dark:border-slate-800 shadow-xs">
              <span>{copiedSku ? "הועתק! ✓" : skuCode}</span>
              <Copy className="w-3 h-3 text-slate-400" />
            </button>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-black shadow-xs">
              <BadgePercent className="w-3.5 h-3.5 text-amber-500" />
              +5% Cashback ({formatPrice(cashbackReward)})
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              <Star className="w-3.5 h-3.5 fill-current" /> 4.9 (18 ביקורות)
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <Truck className="w-3.5 h-3.5" /> משלוח חינם
            </span>
          </div>

          <h3 onClick={() => onOpenQuickView?.({ skuCode, name, price, description, image, category, stock })} className="font-black text-slate-900 dark:text-slate-100 text-lg sm:text-xl leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 cursor-pointer">
            {name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {description}
          </p>

          {stock !== undefined && (
            <div className="pt-1 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Box className="w-3.5 h-3.5 text-amber-500" /> זמינות במרלו״ג:</span>
                <span className={`font-black ${isOutOfStock ? "text-rose-500" : isLowStock ? "text-amber-500" : "text-emerald-500"}`}>{available} יח׳</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${isOutOfStock ? "bg-rose-500 w-0" : isLowStock ? "bg-amber-500 w-1/3" : "bg-emerald-500 w-3/4"}`} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Pricing & CTA */}
      <div className="relative z-20 p-6 pt-4 bg-slate-50/70 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs sm:text-sm text-slate-400 line-through font-medium">{formatPrice(originalPrice)}</span>
              {discountAmount > 0 && (
                <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  חיסכון {formatPrice(discountAmount)}
                </span>
              )}
            </div>
            <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight leading-none">
              {formatPrice(price)}
            </div>
          </div>
          <div className="text-left">
            <span className="text-xs text-slate-400 block">עד 12 תשלומים</span>
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">{formatPrice(Math.round(price / 12))} / חודש</span>
          </div>
        </div>

        {/* Deal Negotiator Quick Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(
              new CustomEvent("open-negotiate-modal", {
                detail: {
                  product: {
                    skuCode,
                    productName: name,
                    unitPrice: price,
                    imageUrl: image,
                  },
                },
              })
            );
          }}
          className="w-full py-1.5 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>משא ומתן על המחיר עם סוכן AI</span>
        </button>

        <div className="flex items-center gap-3 relative z-30">
          {!isOutOfStock && (
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl h-12 px-1.5 shrink-0">
              <button type="button" onClick={(e) => { e.stopPropagation(); setQuantity(Math.max(1, quantity - 1)); }} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"><Minus className="w-4 h-4" /></button>
              <span className="w-8 text-center text-sm font-black text-slate-800 dark:text-slate-100 font-mono">{quantity}</span>
              <button type="button" onClick={(e) => { e.stopPropagation(); setQuantity(Math.min(available || 10, quantity + 1)); }} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"><Plus className="w-4 h-4" /></button>
            </div>
          )}
          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`flex-1 h-12 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-95 cursor-pointer ${
              isAdded
                ? "bg-emerald-500 text-slate-950"
                : isOutOfStock
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 text-slate-950 shadow-amber-500/25"
            }`}
          >
            {isAdded ? <><Check className="w-5 h-5 stroke-[3]" /> <span>נוסף לעגלה!</span></> : isOutOfStock ? <span>אזל מהמלאי</span> : <><ShoppingCart className="w-5 h-5" /> <span>הוסף לסל</span></>}
          </button>
        </div>
      </div>
    </div>
  );
};
