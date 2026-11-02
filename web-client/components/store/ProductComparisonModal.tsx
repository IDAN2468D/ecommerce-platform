"use client";

import React, { useState, useEffect } from "react";
import { Scale, X, ShoppingCart, Check, ShieldCheck, Box, Sparkles, Trophy, ThumbsUp, AlertCircle } from "lucide-react";
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

interface AiComparisonResult {
  verdictSummary?: string;
  summaryVerdict?: string;
  recommendedSku: string;
  recommendedProductTitle?: string;
  recommendedReason?: string;
  categoryWinners?: Record<string, string> | { categoryName: string; winnerSku: string; reason: string }[];
  tradeOffs?: {
    skuCode: string;
    title?: string;
    strengths?: string[];
    pros?: string[];
    tradeOffs?: string[];
    cons?: string[];
  }[];
}

const USE_CASES = [
  "עריכת וידאו ופיתוח תוכנה",
  "גיימינג וביצועים כבדים",
  "לימודים, משרד וניידות",
  "תמורה מקסימלית למחיר",
];

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
  const [selectedUseCase, setSelectedUseCase] = useState<string>(USE_CASES[0]);
  const [aiVerdict, setAiVerdict] = useState<AiComparisonResult | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const comparedList = products.filter((p) => comparedSkus.includes(p.skuCode));

  const fetchAiComparison = async (skus: string[], useCase: string) => {
    if (skus.length < 2) {
      setAiVerdict(null);
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/rag/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ skus, userUseCase: useCase }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiVerdict(data);
      }
    } catch {
      // ignore error
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen && comparedSkus.length >= 2) {
      fetchAiComparison(comparedSkus, selectedUseCase);
    }
  }, [isModalOpen, comparedSkus.join(","), selectedUseCase]);

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
                <span>השוואת מפרט מוצרים חכמה (AI)</span>
              </div>
              <button onClick={onCloseModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Feature 5: Use Case Selector for Gemini Comparative Verdict */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>למה המוצר ישמש אותך?</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {USE_CASES.map((uc) => (
                  <button
                    key={uc}
                    type="button"
                    onClick={() => setSelectedUseCase(uc)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedUseCase === uc
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-400"
                    }`}
                  >
                    {uc}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparedList.map((p) => {
                const isUrl = Boolean(p.image && (p.image.startsWith("http") || p.image.startsWith("/")));
                const available = p.stock?.availableQuantity ?? 0;
                const isOutOfStock = p.stock !== undefined && available <= 0;
                const isAiWinner = aiVerdict?.recommendedSku === p.skuCode;

                return (
                  <div
                    key={p.skuCode}
                    className={`p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border flex flex-col justify-between space-y-4 transition ${
                      isAiWinner
                        ? "border-amber-500 ring-2 ring-amber-500/30 shadow-lg"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="space-y-3">
                      {isAiWinner && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black">
                          <Trophy className="w-3.5 h-3.5" /> המלצת ה-AI עבורך
                        </div>
                      )}
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

            {/* Feature 5: AI Comparative Verdict Below Spec Table */}
            {comparedSkus.length >= 2 && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-amber-50/60 dark:from-indigo-950/40 dark:via-slate-900 dark:to-amber-950/20 border border-indigo-200/80 dark:border-indigo-800/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm sm:text-base text-indigo-900 dark:text-indigo-200">
                    <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                    <span>פסק דין השוואתי של Gemini AI ({selectedUseCase})</span>
                  </div>
                  {aiLoading && (
                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 animate-pulse">
                      מנתח מפרטים טכניים...
                    </span>
                  )}
                </div>

                {aiVerdict && !aiLoading && (
                  <div className="space-y-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-300/70 dark:border-amber-700/50 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-black text-amber-600 dark:text-amber-400 text-sm">
                        <Trophy className="w-4 h-4" />
                        <span>
                          הבחירה המנצחת: {aiVerdict.recommendedProductTitle || aiVerdict.recommendedSku} ({aiVerdict.recommendedSku})
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                        {aiVerdict.verdictSummary || aiVerdict.summaryVerdict}
                      </p>
                      {aiVerdict.recommendedReason && (
                        <p className="text-slate-500 dark:text-slate-400">
                          <strong>נימוק:</strong> {aiVerdict.recommendedReason}
                        </p>
                      )}
                    </div>

                    {aiVerdict.categoryWinners && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {Array.isArray(aiVerdict.categoryWinners)
                          ? aiVerdict.categoryWinners.map((cw, i) => (
                              <div
                                key={i}
                                className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1"
                              >
                                <div className="text-[11px] text-slate-400 font-bold">{cw.categoryName}</div>
                                <div className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                                  🏆 {cw.winnerSku}
                                </div>
                                <div className="text-[11px] text-slate-600 dark:text-slate-300">{cw.reason}</div>
                              </div>
                            ))
                          : Object.entries(aiVerdict.categoryWinners).map(([catName, winner], i) => (
                              <div
                                key={i}
                                className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1"
                              >
                                <div className="text-[11px] text-slate-400 font-bold">{catName}</div>
                                <div className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                                  🏆 {winner}
                                </div>
                              </div>
                            ))}
                      </div>
                    )}

                    {aiVerdict.tradeOffs && aiVerdict.tradeOffs.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {aiVerdict.tradeOffs.map((to, idx) => {
                          const prosList = to.strengths || to.pros || [];
                          const consList = to.tradeOffs || to.cons || [];
                          return (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5"
                            >
                              <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                {to.title ? `${to.title} (${to.skuCode})` : to.skuCode}
                              </div>
                              <div className="space-y-0.5 text-emerald-700 dark:text-emerald-300">
                                {prosList.map((pro, pIdx) => (
                                  <div key={pIdx} className="flex items-start gap-1">
                                    <ThumbsUp className="w-3 h-3 mt-0.5 shrink-0" />
                                    <span>{pro}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="space-y-0.5 text-amber-700 dark:text-amber-300">
                                {consList.map((con, cIdx) => (
                                  <div key={cIdx} className="flex items-start gap-1">
                                    <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                    <span>{con}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
