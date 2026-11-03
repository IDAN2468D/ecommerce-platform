"use client";

import React from "react";
import { Sparkles, ShoppingBag, ArrowLeft, ShieldCheck, Zap, Truck } from "lucide-react";

export const HeroBanner: React.FC = () => {
  const handleOpenCart = () => {
    window.dispatchEvent(new Event("open-cart-drawer"));
  };

  const handleScrollToCatalog = () => {
    const el = document.getElementById("catalog-products");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 450, behavior: "smooth" });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-12 shadow-2xl border border-slate-800/80 dark:border-amber-500/20" dir="rtl">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 end-0 -mt-12 -me-12 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 start-0 -mb-12 -ms-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
        <div className="md:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-brand-500/20 to-indigo-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>מבצעי עונה פרימיום • 5% Cashback לחברי מועדון VIP</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            חוויית קנייה חכמה <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-400 via-indigo-300 to-brand-400 bg-clip-text text-transparent">
              עם ייעוץ מותאם אישית
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
            מבחר מוצרי אלקטרוניקה, סמארטפונים, מחשבים ניידים ואוזניות מהמותגים המובילים בעולם. אחריות יבואן רשמי, משלוח מהיר חינם ושריון מלאי מובטח.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleScrollToCatalog}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span>צפה בכל המוצרים</span>
            </button>

            <button
              onClick={handleOpenCart}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition flex items-center gap-2 active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>עגלת קניות ומבצעים</span>
            </button>
          </div>
        </div>

        {/* Consumer Highlights Card */}
        <div className="md:col-span-4 flex justify-center md:justify-end">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900/70 border border-slate-700/60 backdrop-blur-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="text-xl">🏆</span>
              <div>
                <h4 className="text-sm font-bold text-slate-100">יתרונות הקנייה אצלנו</h4>
                <p className="text-[11px] text-slate-400">חנות מורשית עם שירות מעל הכל</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Truck className="w-4 h-4 text-brand-400 shrink-0" />
                <span>משלוח מהיר עד פתח הבית</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% אחריות יבואן רשמי</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>שריון מלאי מיידי ל-10 דקות</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
