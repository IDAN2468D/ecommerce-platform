"use client";

import React from "react";
import { Scale, X, ShoppingCart, Check, ShieldCheck, Box } from "lucide-react";
import { Button } from "../ui/Button";
import { useCurrency } from "../../context/CurrencyContext";

export interface ComparisonProduct {
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
}

export interface ProductComparisonModalProps {
  products: ComparisonProduct[];
  comparedSkus: string[];
  isModalOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onRemoveSku: (sku: string) => void;
  onClearAll: () => void;
  onAddToCart: (product: any) => void;
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  products,
  comparedSkus,
  isModalOpen,
  onOpenModal,
  onCloseModal,
  onRemoveSku,
  onClearAll,
  onAddToCart,
}) => {
  const { formatPrice } = useCurrency();
  const comparedList = products.filter((p) => comparedSkus.includes(p.skuCode));

  if (comparedSkus.length === 0) return null;

  return (
    <>
      {/* 1. Floating Bottom Tray */}
      <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-6 sm:left-6 z-40 max-w-2xl mx-auto bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl backdrop-blur-md flex items-center justify-between gap-4 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold">השוואת מוצרים פעילה ({comparedSkus.length}/3)</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {comparedSkus.join(" • ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenModal}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20"
          >
            פתח השוואה
          </button>
          <button onClick={onClearAll} className="p-2 text-slate-400 hover:text-rose-500" title="נקה הכל">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Detailed Comparison Modal */}
      {isModalOpen && (
        <div
          onClick={onCloseModal}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-slate-100 text-lg">
                <Scale className="w-5 h-5 text-amber-500" />
                <span>השוואת מפרט מוצרים</span>
              </div>
              <button onClick={onCloseModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparedList.map((p) => {
                const isUrl = Boolean(p.image && (p.image.startsWith("http") || p.image.startsWith("/")));
                const available = p.stock?.availableQuantity ?? 0;
                const isOutOfStock = p.stock !== undefined && available <= 0;

                return (
                  <div
                    key={p.skuCode}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="relative h-44 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800">
                        {isUrl ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2" />
                        ) : (
                          <div className="text-6xl">{p.image || "📦"}</div>
                        )}
                        <button
                          onClick={() => onRemoveSku(p.skuCode)}
                          className="absolute top-2 left-2 p-1 rounded-full bg-slate-900/60 text-white hover:bg-rose-500 transition"
                          title="הסר מהשוואה"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs font-mono text-slate-400">{p.skuCode}</div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 line-clamp-2">{p.name}</h4>
                      <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">{formatPrice(p.price)}</div>

                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between">
                          <span>קטגוריה:</span>
                          <strong className="text-slate-800 dark:text-slate-200">{p.category}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>זמינות במחסן:</span>
                          <strong className={isOutOfStock ? "text-rose-500" : "text-emerald-500"}>
                            {isOutOfStock ? "אזל" : `${available} יח׳`}
                          </strong>
                        </div>
                        <div className="pt-1">
                          <p className="line-clamp-3 text-[11px] leading-relaxed">{p.description}</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => onAddToCart({ ...p, quantity: 1 })}
                      disabled={isOutOfStock}
                      size="sm"
                      className="w-full bg-amber-500 text-slate-950 font-bold"
                    >
                      <ShoppingCart className="w-4 h-4 ml-1.5" />
                      הוסף לסל
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
