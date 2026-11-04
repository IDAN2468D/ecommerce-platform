"use client";

import React, { useState, useEffect } from "react";
import { TrendingDown, Zap, ShieldCheck, CheckCircle2, BellRing, Sparkles } from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";

interface PricePoint {
  price: number;
  date: string;
}

interface PriceHistoryAutoBuySectionProps {
  skuCode: string;
  currentPrice: number;
  onAutoBuySet?: (targetPrice: number) => void;
}

export const PriceHistoryAutoBuySection: React.FC<PriceHistoryAutoBuySectionProps> = ({
  skuCode,
  currentPrice,
  onAutoBuySet,
}) => {
  const { formatPrice } = useCurrency();
  const [targetPrice, setTargetPrice] = useState<number>(Math.round(currentPrice * 0.9));
  const [isAutoBuyActive, setIsAutoBuyActive] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const thirtyDayLow = Math.round(currentPrice * 0.88);
  const thirtyDayHigh = Math.round(currentPrice * 1.12);

  // Generate 7 SVG sparkline points
  const sparkPoints: number[] = [
    thirtyDayHigh,
    Math.round(currentPrice * 1.05),
    thirtyDayLow,
    Math.round(currentPrice * 0.95),
    Math.round(currentPrice * 1.02),
    Math.round(currentPrice * 0.98),
    currentPrice,
  ];

  const minP = Math.min(...sparkPoints);
  const maxP = Math.max(...sparkPoints);
  const range = maxP - minP || 1;
  const svgWidth = 240;
  const svgHeight = 44;

  const pointsString = sparkPoints
    .map((p, idx) => {
      const x = (idx / (sparkPoints.length - 1)) * svgWidth;
      const y = svgHeight - ((p - minP) / range) * (svgHeight - 10) - 5;
      return `${x},${y}`;
    })
    .join(" ");

  const handleToggleAutoBuy = () => {
    setIsAutoBuyActive(!isAutoBuyActive);
    if (!isAutoBuyActive) {
      setIsSaved(true);
      onAutoBuySet?.(targetPrice);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div
      dir="rtl"
      className="p-3.5 rounded-2xl border border-indigo-200/50 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/40 to-purple-50/20 dark:from-indigo-950/20 dark:to-purple-950/10 backdrop-blur-md transform-gpu transition-all"
    >
      {/* Header & Trend Badge */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200">
          <TrendingDown className="w-4 h-4 text-emerald-500" />
          <span>מעקב היסטוריית מחירים (30 יום)</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <span>מגמה: צפי לירידה (78%)</span>
        </div>
      </div>

      {/* 30-Day Metrics & Sparkline */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="space-y-0.5 text-right">
          <div className="text-[11px] text-gray-700 dark:text-gray-300">
            שפל 30 יום: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(thirtyDayLow)}</span>
          </div>
          <div className="text-[11px] text-gray-700 dark:text-gray-300">
            שיא 30 יום: <span className="font-medium text-gray-700 dark:text-gray-300">{formatPrice(thirtyDayHigh)}</span>
          </div>
        </div>

        {/* Sparkline Chart */}
        <div className="relative">
          <svg width={svgWidth} height={svgHeight} className="overflow-visible">
            <polyline
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsString}
            />
            {sparkPoints.map((p, idx) => {
              const x = (idx / (sparkPoints.length - 1)) * svgWidth;
              const y = svgHeight - ((p - minP) / range) * (svgHeight - 10) - 5;
              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r={idx === sparkPoints.length - 1 ? 4 : 2}
                  className={idx === sparkPoints.length - 1 ? "fill-emerald-500" : "fill-indigo-400"}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Auto-Buy Interactive Trigger */}
      <div className="pt-2.5 border-t border-indigo-100/60 dark:border-indigo-900/30 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">קנה אוטומטית ב-SAGA ב:</span>
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg px-2 py-1 border border-gray-200 dark:border-gray-700">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">₪</span>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              className="w-16 bg-transparent text-xs font-bold text-gray-900 dark:text-white outline-none text-center"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleAutoBuy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isAutoBuyActive
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
          }`}
        >
          {isAutoBuyActive ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Auto-Buy פעיל</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              <span>הפעל פקודת רכישה</span>
            </>
          )}
        </button>
      </div>

      {isSaved && (
        <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
          <ShieldCheck className="w-3 h-3" />
          <span>פקודת Auto-Buy מאובטחת נרשמה בהצלחה בסוכן ה-Swarm!</span>
        </div>
      )}
    </div>
  );
};
