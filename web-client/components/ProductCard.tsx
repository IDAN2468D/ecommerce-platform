"use client";

import React, { useState, useEffect } from "react";
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
  Zap,
  Scale,
  MessageSquare,
  ThumbsUp,
  UserCheck,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { useCurrency } from "../context/CurrencyContext";

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
  isCompared?: boolean;
  onToggleCompare?: (skuCode: string) => void;
}

interface ReviewItem {
  id: string;
  skuCode: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
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
}) => {
  const { formatPrice } = useCurrency();
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [copiedSku, setCopiedSku] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");
  const [quantity, setQuantity] = useState(1);

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [averageRating, setAverageRating] = useState<number>(4.8);
  const [totalReviews, setTotalReviews] = useState<number>(12);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const isUrl = Boolean(image && (image.startsWith("http") || image.startsWith("/")));
  const available = stock?.availableQuantity ?? 0;
  const reserved = stock?.reservedQuantity ?? 0;
  const totalCapacity = Math.max(available + reserved, 50);
  const stockPercent = stock === undefined ? 100 : Math.min(100, Math.round((available / totalCapacity) * 100));

  const isOutOfStock = stock !== undefined && available <= 0;
  const isLowStock = stock !== undefined && available > 0 && available <= 15;

  const originalPrice = Math.round(price * 1.14);
  const monthlyPayment = Math.round(price / 12);

  // Load reviews when quick view is opened
  useEffect(() => {
    if (quickViewOpen) {
      setReviewsLoading(true);
      fetch(`/api/reviews/${skuCode}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            if (data.reviews && Array.isArray(data.reviews)) {
              setReviews(data.reviews);
            }
            if (data.averageRating) setAverageRating(Number(data.averageRating));
            if (data.totalReviews) setTotalReviews(Number(data.totalReviews));
          }
        })
        .catch(() => {})
        .finally(() => setReviewsLoading(false));
    }
  }, [quickViewOpen, skuCode]);

  const handleAdd = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isOutOfStock) return;
    onAddToCart({ skuCode, name, price, image, quantity });
    setIsAdded(true);
    // Dispatch open-cart-drawer event for slide-over mini cart
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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      let customerId = "usr_demo";
      let customerName = "רוכש מאומת";
      try {
        const savedUser = JSON.parse(localStorage.getItem("auth_user") || "null");
        if (savedUser?.userId) customerId = savedUser.userId;
        if (savedUser?.fullName) customerName = savedUser.fullName;
      } catch {}

      const res = await fetch(`/api/reviews/${skuCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          customerName,
          rating: newRating,
          comment: newComment.trim(),
        }),
      });

      if (res.ok) {
        const createdReview = await res.json();
        setReviews((prev) => [createdReview, ...prev]);
        setNewComment("");
        setTotalReviews((prev) => prev + 1);
        alert("ביקורת המוצר נשלחה בהצלחה ואושרה במערכת!");
      } else {
        alert("שגיאה בשמירת הביקורת");
      }
    } catch (err: any) {
      alert("שגיאת תקשורת: " + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
      <div className="group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-2xl hover:shadow-brand-600/10 hover:border-brand-500/40 dark:hover:border-brand-500/40 transition-all duration-500 hover:-translate-y-1.5 overflow-hidden">
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
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 dark:from-slate-800 to-slate-200 dark:to-slate-900 text-7xl select-none transform transition-transform duration-500 group-hover:scale-110">
                {image && !isUrl ? image : "📦"}
              </div>
            )}

            {/* Ambient Gradient Overlay for Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-slate-950/35 pointer-events-none" />

            {/* Top Floating Bar: Category, Cache Hit & Live Stock */}
            <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between gap-2 z-20">
              <div className="flex items-center gap-1.5">
                {/* Category Glass Pill */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-slate-100 shadow-sm border border-white/60 dark:border-slate-700">
                  <Sparkles className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                  {category}
                </span>

                {/* Sub-5ms Redis Cache Hit Badge */}
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 backdrop-blur-md border border-amber-400/30">
                  <Zap className="w-2.5 h-2.5 fill-current animate-pulse text-amber-300" />
                  <span>Redis &lt;5ms</span>
                </span>
              </div>

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

            {/* Side Floating Action Buttons (Wishlist, Compare, Quick View) */}
            <div className="absolute left-2.5 sm:left-3.5 top-12 sm:top-14 flex flex-col gap-1.5 sm:gap-2 z-20 opacity-100 sm:opacity-0 sm:-translate-x-2 sm:group-hover:opacity-100 sm:group-hover:translate-x-0 transition-all duration-300">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWishlisted(!isWishlisted);
                }}
                title="הוסף למועדפים"
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all shadow-md active:scale-95 ${
                  isWishlisted
                    ? "bg-rose-500 text-white border-rose-400 scale-105"
                    : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-white/60 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:text-rose-500"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? "fill-current" : ""}`} />
              </button>

              {onToggleCompare && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCompare(skuCode);
                  }}
                  title={isCompared ? "הסר מהשוואה" : "הוסף להשוואת מוצרים"}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all shadow-md active:scale-95 ${
                    isCompared
                      ? "bg-brand-600 text-white border-brand-500 scale-105"
                      : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-white/60 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:text-brand-500"
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuickViewOpen(true);
                }}
                title="תצוגה מהירה, מפרט וביקורות"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 backdrop-blur-md border border-white/60 dark:border-slate-700 flex items-center justify-center transition-all shadow-md active:scale-95"
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
              <button
                type="button"
                onClick={() => {
                  setActiveTab("reviews");
                  setQuickViewOpen(true);
                }}
                className="inline-flex items-center gap-1 text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800 hover:bg-amber-100 transition"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{averageRating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal text-[11px]">({totalReviews} ביקורות)</span>
              </button>

              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/40">
                <Truck className="w-3 h-3" />
                משלוח חינם
              </span>
            </div>

            {/* Product Name */}
            <h3
              onClick={() => setQuickViewOpen(true)}
              className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1 cursor-pointer"
              title={name}
            >
              {name}
            </h3>

            {/* Product Description */}
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
              {description}
            </p>

            {/* Live Warehouse Capacity Bar */}
            {stock !== undefined && (
              <div className="pt-1 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 dark:text-slate-400 font-medium flex items-center gap-1">
                    <Box className="w-3 h-3 text-slate-400" />
                    זמינות במחסן הלוגיסטי
                  </span>
                  <span
                    className={`font-bold ${
                      isOutOfStock
                        ? "text-rose-600 dark:text-rose-400"
                        : isLowStock
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {available} יח׳ זמינות
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
        <div className="px-5 py-4 bg-gradient-to-b from-slate-50/50 to-slate-100/70 dark:from-slate-850 dark:to-slate-800/80 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 line-through font-medium">
                  {formatPrice(originalPrice)}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800">
                  מחיר השקה
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none mt-1">
                {formatPrice(price)}
              </div>
            </div>

            <div className="text-left">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">עד 12 תשלומים</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {formatPrice(monthlyPayment)} / חודש
              </span>
            </div>
          </div>

          {/* Quantity & Add to Cart Row */}
          <div className="flex items-center gap-2 pt-1">
            {!isOutOfStock && (
              <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 sm:h-10 px-1 shadow-sm shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 active:scale-90 transition"
                  title="הפחת כמות"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-black text-slate-900 dark:text-slate-100">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(available || 10, quantity + 1))}
                  className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 active:scale-90 transition"
                  title="הוסף כמות"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`flex-1 h-11 sm:h-10 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-sm active:scale-[0.97] ${
                isAdded
                  ? "bg-emerald-500 text-white shadow-emerald-500/25 shadow-lg"
                  : isOutOfStock
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-brand-600 hover:via-indigo-600 hover:to-brand-700 text-white shadow-md hover:shadow-lg hover:shadow-brand-600/25"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>נוסף לסל!</span>
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

      {/* Quick View & Reviews Modal */}
      {quickViewOpen && (
        <div
          onClick={() => setQuickViewOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 max-h-[85vh] sm:max-h-[90vh]"
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
              <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 backdrop-blur-md">
                {category}
              </span>
              <span className="absolute bottom-4 right-4 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white font-mono text-xs">
                {skuCode}
              </span>
            </div>

            {/* Details & Reviews Column */}
            <div className="p-6 sm:p-7 flex flex-col justify-between space-y-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={isOutOfStock ? "destructive" : "success"} dot>
                    {isOutOfStock ? "אזל מהמלאי" : `זמין במלאי (${available} יח׳)`}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => setQuickViewOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-snug">{name}</h2>

                {/* Tabs Switcher: Details vs Reviews */}
                <div className="flex border-b border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`pb-2 px-3 text-xs font-bold border-b-2 transition ${
                      activeTab === "details"
                        ? "border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400"
                        : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    מפרט וארכיטקטורה
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`pb-2 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                      activeTab === "reviews"
                        ? "border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400"
                        : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    <span>ביקורות רוכשים ({totalReviews})</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </button>
                </div>

                {activeTab === "details" ? (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>

                    {/* Live Microservices Telemetry Box */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-brand-600" />
                        <span>נתוני מערכת מבוזרת בזמן אמת:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                        <div>
                          זמין במחסן: <strong className="text-emerald-700 dark:text-emerald-400">{available} יח׳</strong>
                        </div>
                        <div>
                          משוריין ב-SAGA: <strong className="text-amber-700 dark:text-amber-400">{reserved} יח׳</strong>
                        </div>
                      </div>
                      <div className="text-[11px] text-brand-600 dark:text-brand-400 font-medium pt-1 border-t border-slate-200/60 dark:border-slate-700">
                        💡 השתמש בקופון <span className="font-mono font-bold">WELCOME10</span> בעגלה ל-10% הנחה!
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Reviews Tab */
                  <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                    {/* Add Review Form */}
                    <form onSubmit={handleSubmitReview} className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">הוסף חוות דעת:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              className="text-amber-400 hover:scale-125 transition"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  star <= newRating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="כתוב את חוות דעתך על המוצר..."
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-brand-500 outline-none resize-none"
                      />
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          loading={submittingReview}
                          icon={<MessageSquare className="w-3.5 h-3.5" />}
                        >
                          שלח ביקורת
                        </Button>
                      </div>
                    </form>

                    {/* Reviews List */}
                    {reviewsLoading ? (
                      <div className="text-center py-6 text-slate-400 text-xs">טוען ביקורות מקאש Redis...</div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">עדיין אין ביקורות למוצר זה. היה הראשון לדרג!</div>
                    ) : (
                      <div className="space-y-2.5">
                        {reviews.map((rev) => (
                          <div
                            key={rev.id}
                            className="p-3 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                                <span>{rev.customerName}</span>
                                {rev.verifiedPurchase && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-normal">
                                    <UserCheck className="w-3 h-3 text-emerald-600" />
                                    רוכש מאומת
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-0.5 text-amber-400">
                                {[...Array(rev.rating)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-current" />
                                ))}
                              </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">מחיר לצרכן:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-slate-400 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                      {formatPrice(price)}
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