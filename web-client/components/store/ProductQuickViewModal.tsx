"use client";

import React, { useState, useEffect } from "react";
import { X, Star, Check, ShoppingCart, ShieldCheck, CheckCircle2, MessageSquare, UserCheck } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useCurrency } from "../../context/CurrencyContext";

export interface QuickViewProduct {
  skuCode: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock?: { availableQuantity: number; reservedQuantity: number };
}

interface ReviewItem {
  id: string;
  skuCode: string;
  customerName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
}

export interface ProductQuickViewModalProps {
  product: QuickViewProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: any) => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [totalReviews, setTotalReviews] = useState(18);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setReviewsLoading(true);
      fetch(`/api/reviews/${product.skuCode}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.reviews && Array.isArray(data.reviews)) setReviews(data.reviews);
          if (data?.totalReviews) setTotalReviews(Number(data.totalReviews));
        })
        .catch(() => {})
        .finally(() => setReviewsLoading(false));
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const isUrl = Boolean(product.image && (product.image.startsWith("http") || product.image.startsWith("/")));
  const available = product.stock?.availableQuantity ?? 0;
  const isOutOfStock = product.stock !== undefined && available <= 0;
  const originalPrice = Math.round(product.price * 1.18);

  const handleAdd = () => {
    onAddToCart({ ...product, quantity: 1 });
    setIsAdded(true);
    setTimeout(() => { setIsAdded(false); onClose(); }, 700);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/reviews/${product.skuCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: "usr_demo", customerName: "רוכש מאומת", rating: newRating, comment: newComment.trim() }),
      });
      if (res.ok) {
        const item = await res.json();
        setReviews((prev) => [item, ...prev]);
        setNewComment("");
        setTotalReviews((prev) => prev + 1);
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in" dir="rtl">
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 max-h-[85vh] sm:max-h-[90vh]">
        {/* Left Column: Image Area */}
        <div className="relative h-64 md:h-auto bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden p-6">
          {isUrl ? <img src={product.image} alt={product.name} className="w-full h-full object-contain" /> : <div className="text-9xl">{product.image || "📦"}</div>}
          <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-amber-300 border border-slate-200 dark:border-amber-500/30">{product.category}</span>
          <span className="absolute bottom-4 right-4 px-3 py-1 rounded-xl bg-slate-900/80 text-white font-mono text-xs">{product.skuCode}</span>
        </div>

        {/* Right Column: Details & Reviews */}
        <div className="p-6 flex flex-col justify-between space-y-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant={isOutOfStock ? "destructive" : "success"} dot>{isOutOfStock ? "אזל מהמלאי" : `זמין במלאי (${available} יח׳)`}</Badge>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-snug">{product.name}</h2>

            <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold">
              <button onClick={() => setActiveTab("details")} className={`pb-2.5 px-4 border-b-2 transition ${activeTab === "details" ? "border-amber-500 text-amber-600 dark:text-amber-400" : "border-transparent text-slate-400"}`}>מפרט ואחריות</button>
              <button onClick={() => setActiveTab("reviews")} className={`pb-2.5 px-4 border-b-2 transition flex items-center gap-1.5 ${activeTab === "reviews" ? "border-amber-500 text-amber-600 dark:text-amber-400" : "border-transparent text-slate-400"}`}><span>ביקורות ({totalReviews})</span><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /></button>
            </div>

            {activeTab === "details" ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{product.description}</p>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span>יתרונות רכישה:</span></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> משלוח חינם</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> 5% Cashback VIP</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" /> אחריות יבואן</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> תשלום מאובטח</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1 text-xs">
                <form onSubmit={handleReviewSubmit} className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center font-bold text-slate-800 dark:text-slate-200">
                    <span>הוסף חוות דעת:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onClick={() => setNewRating(s)} className="text-amber-400"><Star className={`w-3.5 h-3.5 ${s <= newRating ? "fill-current" : "text-slate-300"}`} /></button>
                      ))}
                    </div>
                  </div>
                  <textarea rows={2} value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="כתוב חוות דעת..." className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none" />
                  <div className="flex justify-end"><Button type="submit" size="sm" loading={submittingReview} icon={<MessageSquare className="w-3.5 h-3.5" />}>שלח ביקורת</Button></div>
                </form>

                {reviewsLoading ? <div className="text-center py-4 text-slate-400">טוען...</div> : reviews.length === 0 ? <div className="text-center py-4 text-slate-400">אין ביקורות עדיין.</div> : (
                  reviews.map((r) => (
                    <div key={r.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className="flex items-center gap-1">{r.customerName} {r.verifiedPurchase && <UserCheck className="w-3 h-3 text-emerald-500" />}</span>
                        <div className="flex text-amber-400">{[...Array(r.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}</div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{r.comment}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">מחיר מיוחד:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-slate-400 line-through">{formatPrice(originalPrice)}</span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{formatPrice(product.price)}</span>
              </div>
            </div>
            <Button onClick={handleAdd} disabled={isOutOfStock} variant={isAdded ? "success" : "primary"} className="w-full h-11 text-sm font-black bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950" icon={isAdded ? <Check className="w-4 h-4 stroke-[3]" /> : <ShoppingCart className="w-4 h-4" />}>
              {isAdded ? "נוסף לעגלה!" : "הוסף לעגלת הקניות"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
