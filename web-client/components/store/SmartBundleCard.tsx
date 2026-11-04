"use client";

import React, { useState } from "react";
import { Layers, ShoppingBag, Check, Sparkles, Plus } from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";

export interface BundleItem {
  skuCode: string;
  title: string;
  unitPrice: number;
}

export interface SmartBundlePayload {
  bundleId: string;
  bundleTitle: string;
  compatibilityScore: number;
  items: BundleItem[];
  originalTotal: number;
  bundleDiscountPercentage: number;
  bundleDiscountAmount: number;
  finalBundlePrice: number;
}

interface SmartBundleCardProps {
  bundle: SmartBundlePayload;
  onAddToCartAll?: (items: BundleItem[]) => void;
}

export const SmartBundleCard: React.FC<SmartBundleCardProps> = ({ bundle, onAddToCartAll }) => {
  const { formatPrice } = useCurrency();
  const [added, setAdded] = useState(false);

  const handleAddAll = () => {
    setAdded(true);
    onAddToCartAll?.(bundle.items);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div
      dir="rtl"
      className="p-3.5 my-2 rounded-2xl border border-indigo-200/70 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/50 via-purple-50/20 to-white/60 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-gray-900/40 backdrop-blur-md shadow-sm transform-gpu transition-all"
    >
      {/* Bundle Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-900 dark:text-indigo-200">
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span>{bundle.bundleTitle}</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>תאימות {Math.round(bundle.compatibilityScore * 100)}%</span>
        </div>
      </div>

      {/* Itemized List */}
      <div className="space-y-1.5 mb-2.5">
        {bundle.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-gray-800/50 px-2.5 py-1.5 rounded-xl border border-gray-100 dark:border-gray-800">
            <span className="truncate max-w-[200px] font-medium">{item.title}</span>
            <span className="font-semibold text-gray-900 dark:text-gray-200">{formatPrice(item.unitPrice)}</span>
          </div>
        ))}
      </div>

      {/* Pricing & Savings */}
      <div className="flex items-center justify-between pt-2 border-t border-indigo-100 dark:border-indigo-900/30 mb-2.5">
        <div className="space-y-0.5">
          <div className="text-[11px] text-gray-700 dark:text-gray-300 line-through">
            מחיר נפרד: {formatPrice(bundle.originalTotal)}
          </div>
          <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">
            מחיר חבילה: {formatPrice(bundle.finalBundlePrice)}
          </div>
        </div>
        <div className="text-left">
          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 px-2 py-0.5 rounded-full">
            חיסכון: {formatPrice(bundle.bundleDiscountAmount)} (-{bundle.bundleDiscountPercentage}%)
          </span>
        </div>
      </div>

      {/* 1-Click Action */}
      <button
        type="button"
        onClick={handleAddAll}
        className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
          added
            ? "bg-emerald-600 text-white"
            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
        }`}
      >
        {added ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>כל {bundle.items.length} המוצרים נוספו לסל!</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>הוסף את כל החבילה לסל בחיסכון {bundle.bundleDiscountPercentage}%</span>
          </>
        )}
      </button>
    </div>
  );
};
