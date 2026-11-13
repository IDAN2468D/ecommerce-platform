"use client";

import React from "react";
import Link from "next/link";
import { Bot, Mic, Search, ArrowLeft, Sparkles } from "lucide-react";
import { NAV_CATEGORY_GROUPS, STORE_NAV_ITEMS, NavItem } from "./navigationConfig";

interface MegaMenuFlyoutProps {
  isOpen: boolean;
  pathname: string;
  onClose: () => void;
}

const BADGE_CLASSES: Record<NonNullable<NavItem["badgeTone"]>, string> = {
  amber: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40",
  rose: "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30",
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  indigo: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  cyan: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
};

export const MegaMenuFlyout: React.FC<MegaMenuFlyoutProps> = ({ isOpen, pathname, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="hidden lg:block absolute inset-x-0 top-full z-50 pt-2 px-4 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto rounded-3xl bg-white/95 dark:bg-[#0b0d14]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-amber-500/25 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.35)] p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* 3 Navigation Category Columns (9 cols) */}
          <div className="col-span-9 grid grid-cols-3 gap-5">
            {NAV_CATEGORY_GROUPS.map((group) => {
              const items = STORE_NAV_ITEMS.filter((item) => item.category === group.id);
              return (
                <div key={group.id} className="space-y-3">
                  <div className="border-b border-slate-200/80 dark:border-white/10 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-wide text-slate-900 dark:text-amber-400">
                      {group.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{group.subtitle}</p>
                  </div>

                  <div className="space-y-1.5">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={`group flex items-start gap-3 p-2.5 rounded-2xl transition-all ${
                            isActive
                              ? "bg-amber-500/10 border border-amber-500/30"
                              : "hover:bg-slate-100/90 dark:hover:bg-slate-800/70 border border-transparent"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-xl shrink-0 transition-colors ${
                              isActive
                                ? "bg-amber-500 text-slate-950"
                                : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 group-hover:text-amber-500"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span
                                  className={`px-1.5 py-0.2 text-[9px] font-mono font-black rounded-md border ${
                                    BADGE_CLASSES[item.badgeTone || "amber"]
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5 line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Featured AI Swarm & Quick Actions Spotlight Card (3 cols) */}
          <div className="col-span-3 rounded-2xl p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border border-amber-500/30 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-extrabold">
                <Sparkles className="w-3 h-3" />
                <span>25-Agent AI Swarm v9.0</span>
              </div>
              <h4 className="text-sm font-black leading-snug">
                מרכז הפיקוד של סוכני הקניות והאוטומציה
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                הפעל חיפוש סמנטי, סוכנת קולית, משא ומתן אוטונומי או את 8 שירותי ה-V9 בלחיצה אחת.
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new Event("open-rag-drawer"));
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs transition"
              >
                <span className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  <span>פתח נחיל 25 סוכנים</span>
                </span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(new Event("open-voice-modal"));
                  }}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-[11px] font-bold transition"
                >
                  <Mic className="w-3.5 h-3.5 text-amber-400" />
                  <span>עוזרת קולית</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(new Event("open-command-palette"));
                  }}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-[11px] font-bold transition"
                >
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  <span>חיפוש ⌘K</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
