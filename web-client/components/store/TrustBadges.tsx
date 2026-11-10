"use client";

import React from "react";
import { Truck, ShieldCheck, Headphones, RotateCcw } from "lucide-react";

export const TrustBadges: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4" dir="rtl">
      {/* 1. Free Shipping */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3 transition-all hover:border-blue-500/50 hover:shadow-md">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">משלוח חינם</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">בהזמנות מעל ₪250</p>
        </div>
      </div>

      {/* 2. Secure Payment */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3 transition-all hover:border-blue-500/50 hover:shadow-md">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">סליקה מאובטחת</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">100% הגנת נתונים בתקן PCI</p>
        </div>
      </div>

      {/* 3. 24/7 Support */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3 transition-all hover:border-blue-500/50 hover:shadow-md">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Headphones className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">תמיכה 24/7</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">מענה אישי מסביב לשעון</p>
        </div>
      </div>

      {/* 4. Easy Returns */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3 transition-all hover:border-blue-500/50 hover:shadow-md">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <RotateCcw className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">החזרות קלות</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">מדיניות החזרה של 30 יום</p>
        </div>
      </div>
    </div>
  );
};
