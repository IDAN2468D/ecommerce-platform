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
  Copy,
  X,
  Plus,
  Minus,
  Box,
  Flame,
  Star,
  Zap,
  Scale,
  MessageSquare,
  UserCheck,
  BadgePercent,
  CheckCircle2,
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
  const [averageRating, setAverageRating] = useState<number>(4.9);
  const [totalReviews, setTotalReviews] = useState<number>(18);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const isUrl = Boolean(image && (image.startsWith("http") || image.startsWith("/")));
  const available = stock?.availableQuantity ?? 0;
  const reserved = stock?.reservedQuantity ?? 0;
  const totalCapacity = Math.max(available + reserved, 50);
  const stockPercent = stock === undefined ? 100 : Math.min(100, Math.round((available / totalCapacity) * 100));

  const isOutOfStock = stock !== undefined && available <= 0;
  const isLowStock = stock !== undefined && available > 0 && available <= 10;

  const originalPrice = Math.round(price * 1.18);
  const discountAmount = Math.max(0, originalPrice - price);
  const monthlyPayment = Math.round(price / 12);
  const cashbackReward = Math.round(price * 0.05);

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
      <div className="group relative flex flex-col justify-between rounded-[2rem] bg-slate-900/80 dark:bg-[#0c0d14]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-amber-500/15 hover:border-amber-500/50 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
        {/* Top Accent Gradient Border on Hover */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-300 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" />

        <div>
          {/* 1. HERO IMAGE CONTAINER (Enlarged & Prominent) */}
          <div
            onClick={() => setQuickViewOpen(true)}
            className="relative h-72 sm:h-80 w-full bg-gradient-to-b from-slate-950/40 via-slate-900/60 to-slate-950 overflow-hidden cursor-pointer flex items-center justify-center p-6 border-b border-slate-200/60 dark:border-slate-800/80"
          >
            {/* Background Ambient Spotlight */}
            <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Product Image / Visual */}
            {isUrl && !imgError ? (
              <img
                src={image}
                alt={name}
                loading="lazy"
                onError={() => setImgError(true)}
                className={`w-full h-full object-contain object-center transform transition-transform duration-700 ease-out group-hover:scale-108 ${
                  isOutOfStock ? "grayscale opacity-50" : ""
                }`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl sm:text-9xl select-none transform transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl">
                {image && !isUrl ? image : "📦"}
              </div>
            )}

            {/* Top Bar: Category Pill & Stock Status Pill */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between gap-2 z-20">
              {/* Category Pill */}
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-900/90 text-amber-300 backdrop-blur-md shadow-md border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {category}
              </span>

              {/* Stock Status */}
              <div>
                {stock === undefined ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700">
                    מסנכרן...
                  </span>
                ) : isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-600/95 backdrop-blur-md text-white shadow-md">
                    אזל מהמלאי
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-600 to-orange-600 backdrop-blur-md text-white shadow-md animate-pulse">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    נותרו {available} בלבד!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-600/90 backdrop-blur-md text-white shadow-md">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    במלאי מיידי ({available})
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Floating Buttons (Wishlist, Compare, Quick View) */}
            <div className="absolute left-4 top-16 flex flex-col gap-2 z-20 opacity-100 sm:opacity-0 sm:-translate-x-3 sm:group-hover:opacity-100 sm:group-hover:translate-x-0 transition-all duration-300">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWishlisted(!isWishlisted);
                }}
                title="הוסף למועדפים"
                className={`w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md border transition-all shadow-lg active:scale-90 ${
                  isWishlisted
                    ? "bg-rose-500 text-white border-rose-400 scale-105"
                    : "bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800 hover:text-rose-400 hover:border-rose-400/40"
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
              </button>

              {onToggleCompare && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCompare(skuCode);
                  }}
                  title={isCompared ? "הסר מהשוואה" : "הוסף להשוואת מוצרים"}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md border transition-all shadow-lg active:scale-90 ${
                    isCompared
                      ? "bg-amber-500 text-slate-950 border-amber-400 font-bold scale-105"
                      : "bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800 hover:text-amber-400 hover:border-amber-400/40"
                  }`}
                >
                  <Scale className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuickViewOpen(true);
                }}
                title="תצוגה מהירה, מפרט וביקורות"
                className="w-10 h-10 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-amber-400 hover:border-amber-400/40 backdrop-blur-md border border-slate-700 flex items-center justify-center transition-all shadow-lg active:scale-90"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Image Overlay: SKU Copy & 5% Cashback VIP Pill */}
            <div className="absolute bottom-3 inset-x-4 flex items-center justify-between gap-2 z-20">
              <button
                type="button"
                onClick={handleCopySku}
                title="העתק מקט מוצר"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md text-slate-300 text-xs font-mono tracking-wider border border-slate-800 transition shadow-xs"
              >
                <span>{copiedSku ? "הועתק! ✓" : skuCode}</span>
                <Copy className="w-3 h-3 text-slate-400" />
              </button>

              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-500/30 text-xs font-black shadow-xs">
                <BadgePercent className="w-3.5 h-3.5 text-amber-400" />
                +5% Cashback ({formatPrice(cashbackReward)})
              </span>
            </div>
          </div>

          {/* 2. CARD CONTENT BODY */}
          <div className="p-6 space-y-4">
            {/* Reviews Rating & Trust micro-row */}
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("reviews");
                  setQuickViewOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 hover:bg-amber-500/20 transition"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{averageRating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({totalReviews} ביקורות)</span>
              </button>

              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <Truck className="w-3.5 h-3.5" />
                משלוח חינם
              </span>
            </div>

            {/* Product Name (Larger & Bold) */}
            <h3
              onClick={() => setQuickViewOpen(true)}
              className="font-black text-slate-100 text-lg sm:text-xl leading-snug group-hover:text-amber-400 transition-colors line-clamp-2 cursor-pointer tracking-tight"
              title={name}
            >
              {name}
            </h3>

            {/* Product Description */}
            <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
              {description}
            </p>

            {/* Live Stock Warehouse Indicator */}
            {stock !== undefined && (
              <div className="pt-1 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-amber-500" />
                    זמינות מלאי במרלו״ג:
                  </span>
                  <span
                    className={`font-black ${
                      isOutOfStock
                        ? "text-rose-400"
                        : isLowStock
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {available} יחידות זמינות
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOutOfStock
                        ? "bg-rose-500 w-0"
                        : isLowStock
                        ? "bg-gradient-to-r from-amber-500 to-orange-500"
                        : "bg-gradient-to-r from-emerald-500 to-teal-400"
                    }`}
                    style={{ width: `${isOutOfStock ? 0 : Math.max(12, stockPercent)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. CARD FOOTER: Pricing & Add to Cart */}
        <div className="p-6 pt-4 bg-slate-950/60 border-t border-slate-800/80 space-y-4">
          {/* Price Header */}
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs sm:text-sm text-slate-500 line-through font-medium">
                  {formatPrice(originalPrice)}
                </span>
                {discountAmount > 0 && (
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    חיסכון של {formatPrice(discountAmount)}
                  </span>
                )}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight leading-none font-mono">
                {formatPrice(price)}
              </div>
            </div>

            <div className="text-left">
              <span className="text-xs text-slate-400 block">עד 12 תשלומים</span>
              <span className="text-xs sm:text-sm font-bold text-slate-200">
                {formatPrice(monthlyPayment)} / חודש
              </span>
            </div>
          </div>

          {/* Quantity Stepper & Add to Cart Action */}
          <div className="flex items-center gap-3">
            {!isOutOfStock && (
              <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-2xl h-12 px-1.5 shadow-sm shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white active:scale-90 transition"
                  title="הפחת כמות"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-black text-slate-100 font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(available || 10, quantity + 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white active:scale-90 transition"
                  title="הוסף כמות"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`flex-1 h-12 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg active:scale-[0.97] ${
                isAdded
                  ? "bg-emerald-500 text-slate-950 shadow-emerald-500/30"
                  : isOutOfStock
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>נוסף לעגלה בהצלחה!</span>
                </>
              ) : isOutOfStock ? (
                <span>אזל זמנית מהמלאי</span>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
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
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 rounded-t-3xl sm:rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 max-h-[85vh] sm:max-h-[90vh]"
          >
            {/* Image Column */}
            <div className="relative h-64 md:h-auto bg-slate-950 flex items-center justify-center overflow-hidden p-6">
              {isUrl && !imgError ? (
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-contain object-center"
                />
              ) : (
                <div className="text-9xl">{image && !isUrl ? image : "📦"}</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30 pointer-events-none" />
              <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black bg-slate-900/90 text-amber-300 border border-amber-500/30">
                {category}
              </span>
              <span className="absolute bottom-4 right-4 px-3 py-1 rounded-xl bg-slate-900/80 text-white font-mono text-xs border border-slate-700">
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
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-100 leading-snug">{name}</h2>

                {/* Tabs Switcher: Details vs Reviews */}
                <div className="flex border-b border-slate-800">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`pb-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition ${
                      activeTab === "details"
                        ? "border-amber-400 text-amber-400 font-black"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    מפרט ואחריות
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`pb-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                      activeTab === "reviews"
                        ? "border-amber-400 text-amber-400 font-black"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>ביקורות לקוחות ({totalReviews})</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </button>
                </div>

                {activeTab === "details" ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-300 leading-relaxed">{description}</p>

                    {/* Customer Benefits Box */}
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
                      <div className="font-black text-slate-200 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>יתרונות רכישה ישירה:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>משלוח אקספרס חינם</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>5% Cashback VIP</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>אחריות יבואן רשמי</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>תשלום מאובטח SSL</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-amber-400 font-medium pt-2 border-t border-slate-800">
                        💡 השתמש בקופון <span className="font-mono font-bold">WELCOME10</span> בעגלה ל-10% הנחה!
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Reviews Tab */
                  <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                    {/* Add Review Form */}
                    <form onSubmit={handleSubmitReview} className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">הוסף חוות דעת:</span>
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
                                  star <= newRating ? "fill-amber-400 text-amber-400" : "text-slate-600"
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
                        className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-xs focus:ring-1 focus:ring-amber-500 outline-none resize-none"
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
                      <div className="text-center py-6 text-slate-400 text-xs">טוען ביקורות לקוחות...</div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">עדיין אין ביקורות למוצר זה. היה הראשון לדרג!</div>
                    ) : (
                      <div className="space-y-2.5">
                        {reviews.map((rev) => (
                          <div
                            key={rev.id}
                            className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                                <span>{rev.customerName}</span>
                                {rev.verifiedPurchase && (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                                    <UserCheck className="w-3 h-3 text-emerald-400" />
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
                            <p className="text-slate-300 leading-relaxed">{rev.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">מחיר מיוחד:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-slate-500 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
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
                  className="w-full h-12 text-base font-black bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950"
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
