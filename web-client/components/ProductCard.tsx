"use client";

import React, { useState } from "react";
import {
  ShoppingCart,
  Check,
  Heart,
  Eye,
  Sparkles,
  ShieldCheck,
  Truck,
  Layers,
  Copy,
  X,
  Plus,
  Minus,
  Box,
  Lock,
  Flame,
  Star,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

export interface ProductCardProps {
  skuCode: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock?: {
    availableQuantity: number;
    reservedQuantity: number;
  };
  onAddToCart: (product: any) => void;
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
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [copiedSku, setCopiedSku] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const isUrl = Boolean(image && (image.startsWith("http") || image.startsWith("/")));
  const available = stock?.availableQuantity ?? 0;
  const reserved = stock?.reservedQuantity ?? 0;
  const totalCapacity = Math.max(available + reserved, 50);
  const stockPercent = stock === undefined ? 100 : Math.min(100, Math.round((available / totalCapacity) * 100));

  const isOutOfStock = stock !== undefined && available <= 0;
  const isLowStock = stock !== undefined && available > 0 && available <= 15;

  // Original comparison price for flagship visual presentation
  const originalPrice = Math.round(price * 1.14);
  const monthlyPayment = Math.round(price / 12);

  const handleAdd = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isOutOfStock) return;
    onAddToCart({ skuCode, name, price, image, quantity });
    setIsAdded(true);
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
    <>
      <div className="group relative flex flex-col justify-between rounded-3xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-2xl hover:shadow-brand-600/10 hover:border-brand-500/40 transition-all duration-500 hover:-translate-y-1.5 overflow-hidden">
        {/* Top Accent Gradient Line on Hover */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" />

        <div>
          {/* Image Gallery Container */}
          <div
            onClick={() => setQuickViewOpen(true)}
            className="relative h-64 w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden cursor-pointer"
          >
            {/* Product Visual */}
            {isUrl && !imgError ? (
              <img
                src={image}
                alt={name}
                loading="lazy"
                onError={() => setImgError(true)}
                className={`w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-110 ${
                  isOutOfStock ? "grayscale opacity-60" : ""
                }`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-7xl select-none transform transition-transform duration-500 group-hover:scale-110">
                {image && !isUrl ? image : "📦"}
              </div>
            )}

            {/* Ambient Gradient Overlay for Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-slate-950/35 pointer-events-none" />

            {/* Top Floating Bar: Category & Live Stock */}
            <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between gap-2 z-20">
              {/* Category Glass Pill */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-slate-900 shadow-sm border border-white/60">
                <Sparkles className="w-3 h-3 text-brand-600" />
                {category}
              </span>

              {/* Stock Status Pill */}
              <div>
                {stock === undefined ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900/70 backdrop-blur-md text-slate-200 border border-white/15">
                    מסנכרן...
                  </span>
                ) : isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/95 backdrop-blur-md text-white shadow-sm">
                    אזל מהמלאי
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/95 backdrop-blur-md text-white shadow-sm">
                    <Flame className="w-3 h-3 fill-current animate-bounce" />
                    נותרו {available} בלבד!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/90 backdrop-blur-md text-white shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    במלאי ({available})
                  </span>
                )}
              </div>
            </div>

            {/* Side Floating Action Buttons (Wishlist & Quick View) */}
            <div className="absolute left-3.5 top-14 flex flex-col gap-2 z-20 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWishlisted(!isWishlisted);
                }}
                title="הוסף למועדפים"
                className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all shadow-md ${
                  isWishlisted
                    ? "bg-rose-500 text-white border-rose-400 scale-110"
                    : "bg-white/90 text-slate-700 border-white/60 hover:bg-white hover:text-rose-500"
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuickViewOpen(true);
                }}
                title="תצוגה מהירה ומפרט"
                className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-brand-600 backdrop-blur-md border border-white/60 flex items-center justify-center transition-all shadow-md"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Image Overlay: SKU & SAGA Reserved Indicator */}
            <div className="absolute bottom-3 inset-x-3.5 flex items-center justify-between gap-2 z-20">
              <button
                type="button"
                onClick={handleCopySku}
                title="העתק מקט מוצר"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/75 hover:bg-slate-900/90 backdrop-blur-md text-slate-200 text-[10px] font-mono tracking-wider uppercase border border-white/15 transition"
              >
                <span>{copiedSku ? "הועתק! ✓" : skuCode}</span>
                <Copy className="w-2.5 h-2.5 text-slate-400" />
              </button>

              {reserved > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/25 backdrop-blur-md text-amber-200 border border-amber-400/30 text-[10px] font-semibold">
                  <Lock className="w-2.5 h-2.5" />
                  {reserved} משוריין ב-SAGA
                </span>
              )}
            </div>
          </div>

          {/* Card Content Body */}
          <div className="p-5 pb-4 space-y-3.5">
            {/* Rating & Trust Micro-row */}
            <div className="flex items-center justify-between text-xs">
              <div className="inline-flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>4.9</span>
                <span className="text-slate-400 font-normal text-[11px]">(ביקורות מאומתות)</span>
              </div>

              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <Truck className="w-3 h-3" />
                משלוח חינם
              </span>
            </div>

            {/* Product Name */}
            <h3
              onClick={() => setQuickViewOpen(true)}
              className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug group-hover:text-brand-600 transition-colors line-clamp-1 cursor-pointer"
              title={name}
            >
              {name}
            </h3>

            {/* Product Description */}
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[2.5rem]">
              {description}
            </p>

            {/* Live Warehouse Capacity Bar */}
            {stock !== undefined && (
              <div className="pt-1 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Box className="w-3 h-3 text-slate-400" />
                    זמינות במחסן הלוגיסטי
                  </span>
                  <span
                    className={`font-bold ${
                      isOutOfStock
                        ? "text-rose-600"
                        : isLowStock
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {available} יח׳ זמינות
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOutOfStock
                        ? "bg-rose-500 w-0"
                        : isLowStock
                        ? "bg-gradient-to-r from-amber-500 to-orange-400"
                        : "bg-gradient-to-r from-emerald-500 to-teal-400"
                    }`}
                    style={{ width: `${isOutOfStock ? 0 : Math.max(12, stockPercent)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Pricing, Quantity Stepper & Action Button */}
        <div className="px-5 py-4 bg-gradient-to-b from-slate-50/50 to-slate-100/70 border-t border-slate-100 space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 line-through font-medium">
                  ₪{originalPrice.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200/60">
                  מחיר השקה
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-1">
                ₪{price.toLocaleString()}
              </div>
            </div>

            <div className="text-left">
              <span className="text-[11px] text-slate-500 block">עד 12 תשלומים</span>
              <span className="text-xs font-bold text-slate-700">
                ₪{monthlyPayment.toLocaleString()} / חודש
              </span>
            </div>
          </div>

          {/* Quantity & Add to Cart Row */}
          <div className="flex items-center gap-2 pt-1">
            {!isOutOfStock && (
              <div className="flex items-center bg-white border border-slate-200 rounded-xl h-10 px-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-extrabold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(available || 10, quantity + 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`flex-1 h-10 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-sm active:scale-[0.98] ${
                isAdded
                  ? "bg-emerald-500 text-white shadow-emerald-500/25 shadow-lg"
                  : isOutOfStock
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-brand-600 hover:via-indigo-600 hover:to-brand-700 text-white shadow-md hover:shadow-lg hover:shadow-brand-600/25"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>נוסף לעגלה!</span>
                </>
              ) : isOutOfStock ? (
                <span>אזל מהמלאי</span>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>הוסף לסל</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <div
          onClick={() => setQuickViewOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2"
          >
            {/* Left / Right Image Column */}
            <div className="relative h-64 md:h-auto bg-slate-900 flex items-center justify-center overflow-hidden">
              {isUrl && !imgError ? (
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="text-8xl">{image && !isUrl ? image : "📦"}</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30" />
              <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-900 backdrop-blur-md">
                {category}
              </span>
              <span className="absolute bottom-4 right-4 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white font-mono text-xs">
                {skuCode}
              </span>
            </div>

            {/* Details Column */}
            <div className="p-6 sm:p-7 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={isOutOfStock ? "destructive" : "success"} dot>
                    {isOutOfStock ? "אזל מהמלאי" : `זמין במלאי (${available} יח׳)`}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => setQuickViewOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h2 className="text-xl font-black text-slate-900 leading-snug">{name}</h2>

                <p className="text-sm text-slate-600 leading-relaxed">{description}</p>

                {/* Live Microservices Telemetry Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-brand-600" />
                    <span>נתוני מערכת מבוזרת בזמן אמת:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      זמין במחסן: <strong className="text-emerald-700">{available} יח׳</strong>
                    </div>
                    <div>
                      משוריין ב-SAGA: <strong className="text-amber-700">{reserved} יח׳</strong>
                    </div>
                  </div>
                  <div className="text-[11px] text-brand-600 font-medium pt-1 border-t border-slate-200/60">
                    💡 השתמש בקופון <span className="font-mono font-bold">WELCOME10</span> בעגלה ל-10% הנחה!
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">מחיר לצרכן:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-slate-400 line-through">
                      ₪{originalPrice.toLocaleString()}
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      ₪{price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    handleAdd();
                    setTimeout(() => setQuickViewOpen(false), 700);
                  }}
                  disabled={isOutOfStock}
                  variant={isAdded ? "success" : "primary"}
                  size="lg"
                  className="w-full"
                  icon={isAdded ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                >
                  {isAdded ? "נוסף בהצלחה לעגלה!" : "הוסף לעגלת הקניות"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
