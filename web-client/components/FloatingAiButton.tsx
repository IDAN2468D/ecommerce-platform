"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Bot } from "lucide-react";

export const FloatingAiButton: React.FC = () => {
  const [hasPrompted, setHasPrompted] = useState(false);

  useEffect(() => {
    // Show a small teaser badge for 6 seconds after 2 seconds
    const timer = setTimeout(() => {
      setHasPrompted(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    window.dispatchEvent(new Event("open-rag-drawer"));
  };

  return (
    <div
      className="fixed bottom-20 md:bottom-6 start-4 md:start-6 z-40 flex items-center gap-2"
      dir="rtl"
    >
      {/* Optional Proactive Prompt Bubble */}
      {hasPrompted && (
        <div
          onClick={handleClick}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-indigo-200 dark:border-indigo-800/80 shadow-xl text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer animate-fade-in hover:scale-105 transition-transform"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>מחפש המלצה? שאל את ה-AI שלנו</span>
        </div>
      )}

      {/* Main Floating Button */}
      <button
        type="button"
        onClick={handleClick}
        aria-label="פתח עוזר קניות אישי AI"
        className="relative group flex items-center gap-2 px-3.5 py-3 rounded-full bg-gradient-to-r from-amber-500 via-indigo-600 to-brand-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all"
      >
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-400 via-indigo-500 to-brand-500 opacity-60 blur-xs group-hover:opacity-100 transition duration-500 -z-10 animate-pulse" />
        <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
        <span className="font-extrabold tracking-tight">עוזר AI</span>
      </button>
    </div>
  );
};
