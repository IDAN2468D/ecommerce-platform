"use client";

import React, { useState } from "react";
import { Sparkles, Bot } from "lucide-react";

export const FloatingAiButton: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    window.dispatchEvent(new Event("open-rag-drawer"));
  };

  return (
    <div
      className="fixed bottom-6 start-6 z-40 hidden md:flex flex-col items-start select-none"
      dir="rtl"
    >
      {/* Sleek Tooltip on Hover */}
      <div
        className={`mb-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/95 dark:bg-[#0c101d]/95 text-white text-[11px] font-medium backdrop-blur-xl border border-indigo-500/30 dark:border-amber-500/30 shadow-2xl transition-all duration-300 pointer-events-none flex items-center gap-2 ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span>צוות סוכנים מבוסס Gemini • ייעוץ קטלוגי, הנחות VIP והוספה לסל</span>
      </div>

      {/* Floating Action Pill */}
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="פתח צוות סוכנים ועוזר AI"
        className="group relative flex items-center gap-3 px-4 py-3 rounded-full bg-slate-900/95 dark:bg-[#0c101d]/95 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm border border-indigo-500/40 dark:border-amber-500/40 shadow-[0_10px_35px_rgba(79,70,229,0.25)] backdrop-blur-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden ring-1 ring-white/10"
      >
        {/* Ambient Gradient Glow Effect */}
        <span className="absolute inset-0 bg-gradient-to-r from-amber-500/15 via-indigo-600/20 to-cyan-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Pulsing Active Status Beacon */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>

        {/* Dynamic Multi-Agent Swarm Orb */}
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md group-hover:rotate-6 transition-transform">
          <Sparkles className="w-4 h-4" />
        </div>

        {/* Label & Status */}
        <div className="flex flex-col text-right leading-none">
          <span className="text-[12px] sm:text-[13px] font-black tracking-tight text-white group-hover:text-amber-300 transition-colors">
            עוזר קניות AI
          </span>
          <span className="text-[9px] text-slate-400 font-mono mt-0.5">
            25 סוכני Swarm פעילים
          </span>
        </div>
      </button>
    </div>
  );
};
