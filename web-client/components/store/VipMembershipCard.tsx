"use client";

import React from "react";
import { Sparkles, Coins, TrendingUp, Award, QrCode } from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";

export interface VipMembershipCardProps {
  fullName: string;
  userId: string;
  tier?: string;
  pointsBalance: number;
  lifetimePoints?: number;
  cashbackRatePercent?: number;
}

export const VipMembershipCard: React.FC<VipMembershipCardProps> = ({
  fullName,
  userId,
  tier = "VIP PLATINUM",
  pointsBalance,
  lifetimePoints = 3369.25,
  cashbackRatePercent = 5,
}) => {
  const { formatPrice } = useCurrency();

  return (
    <div className="space-y-6">
      {/* 1. Holographic Metal VIP Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950/40 p-6 sm:p-8 text-white border border-amber-500/40 shadow-2xl backdrop-blur-2xl">
        {/* Holographic Prismatic Sheen */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-48 sm:h-52 space-y-6">
          {/* Card Top: Logo & Tier Pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
                <Award className="w-5 h-5" />
              </div>
              <span className="font-black text-sm tracking-widest uppercase text-amber-300">
                STORE 2026 VIP PASS
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              {tier}
            </span>
          </div>

          {/* Card Middle: Customer Name & ID */}
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">{fullName}</h3>
            <span className="font-mono text-xs text-amber-200/80 tracking-wider">MEMBER ID: {userId}</span>
          </div>

          {/* Card Bottom: Points & Cashback Rate */}
          <div className="flex items-end justify-between border-t border-amber-500/20 pt-3">
            <div>
              <span className="text-[11px] text-amber-200/70 block">יתרת נקודות זמינה:</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
                {pointsBalance.toFixed(0)} <span className="text-xs">נקודות</span>
              </span>
            </div>

            <div className="text-left">
              <span className="text-[11px] text-emerald-300 block font-bold">5% צבירה אוטומטית</span>
              <span className="text-xs text-slate-400 font-mono">שווי מימוש: {formatPrice(pointsBalance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tier Progress & Benefits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>צבירת Cashback פעילה</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {cashbackRatePercent}%
          </div>
          <p className="text-[11px] text-slate-400">החזר כספי בכל רכישה באתר</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>סה״כ נקודות שנצברו</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {lifetimePoints.toFixed(0)}
          </div>
          <p className="text-[11px] text-slate-400">צבירה היסטורית מכל הרכישות</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">התקדמות ל-DIAMOND</span>
              <span className="font-bold text-amber-500">85%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full w-[85%]" />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 pt-1">עוד ₪350 לרכישות לשדרוג ל-7% Cashback</span>
        </div>
      </div>
    </div>
  );
};
