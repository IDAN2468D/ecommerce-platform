"use client";

import React from "react";
import { Truck, ShieldCheck, Zap, Lock } from "lucide-react";

export const TrustBadges: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4" dir="rtl">
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs flex items-center gap-3 transition hover:border-brand-500/40">
        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">משלוח חינם מעל ₪500</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">אספקה מהירה עד פתח הבית</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs flex items-center gap-3 transition hover:border-amber-500/40">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold">
          💎
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">5% Cashback VIP</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">צבירת נקודות בכל רכישה</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs flex items-center gap-3 transition hover:border-emerald-500/40">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">אחריות יבואן רשמי</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">100% מוצרים מקוריים</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs flex items-center gap-3 transition hover:border-indigo-500/40">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">קנייה מאובטחת 100%</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">תקן אבטחה מחמיר SSL</p>
        </div>
      </div>
    </div>
  );
};
