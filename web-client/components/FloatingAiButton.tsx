"use client";

import React, { useState } from "react";
import { Sparkles, Bot, ChevronUp } from "lucide-react";

export const FloatingAiButton: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    window.dispatchEvent(new Event("open-rag-drawer"));
  };

  return (
    <div
      className="fixed bottom-20 md:bottom-6 start-4 md:start-6 z-40 flex flex-col items-start"
      dir="rtl"
    >
      {/* Sleek Tooltip on Hover (Single Unified Element, Never a Second Floating Button) */}
      <div
        className={`mb-2 px-3 py-1.5 rounded-xl bg-slate-900/90 dark:bg-slate-950/95 text-white text-[11px] font-medium backdrop-blur-md border border-slate-700/60 dark:border-amber-500/30 shadow-xl transition-all duration-300 pointer-events-none flex items-center gap-1.5 ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span>ייעוץ אישי, בדיקת קופונים והוספה אוטונומית לסל</span>
      </div>

      {/* Single Unified Floating AI Button */}
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="פתח צוות סוכנים ועוזר AI"
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900/90 dark:bg-[#0a0c14]/90 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm border border-indigo-500/40 dark:border-amber-500/40 shadow-[0_8px_30px_rgb(0,0,0,0.35)] backdrop-blur-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden"
      >
        {/* Ambient Gradient Glow Effect */}
        <span className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-brand-600/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Pulsing Active Beacon Dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>

        {/* Icon with Subtle Spin on Hover */}
        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:rotate-6 transition-transform">
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        {/* Text Label */}
        <div className="flex flex-col text-right leading-none">
          <span className="text-[12px] sm:text-[13px] font-black tracking-tight text-white group-hover:text-amber-300 transition-colors">
            עוזר קניות AI
          </span>
          <span className="text-[9px] text-slate-400 dark:text-slate-400 font-mono mt-0.5">
            צוות סוכנים Swarm
          </span>
        </div>
      </button>
    </div>
  );
};
