"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  X,
  Bot,
  Mic,
  Search,
  Coins,
  Copy,
  Check,
  LogOut,
  Crown,
  ChevronLeft,
} from "lucide-react";
import { NAV_CATEGORY_GROUPS, STORE_NAV_ITEMS } from "./navigationConfig";
import { ThemeToggle } from "../ThemeToggle";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  currentUser: { fullName?: string; email?: string } | null;
  currency: "ILS" | "USD";
  onToggleCurrency: () => void;
  copiedCoupon: boolean;
  onCopyPromo: () => void;
  onLogout: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  pathname,
  currentUser,
  currency,
  onToggleCurrency,
  copiedCoupon,
  onCopyPromo,
  onLogout,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-Over RTL Drawer Panel */}
      <aside
        aria-label="תפריט ניווט ראשי"
        className="relative z-10 w-[88vw] max-w-sm h-full bg-white dark:bg-[#090b11] border-l border-slate-200 dark:border-amber-500/20 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Top User & Brand Header */}
        <div className="p-4 bg-gradient-to-l from-slate-950 via-indigo-950 to-slate-900 text-white border-b border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-sm shadow-lg shrink-0">
                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : "N"}
              </div>
              <div className="min-w-0">
                <div className="font-black text-sm truncate">
                  {currentUser?.fullName || "אורח NEXUS PRO"}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold">
                  <Crown className="w-3 h-3" />
                  <span>VIP Platinum • 5% Cashback</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="סגור תפריט"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Utility Strip inside Drawer */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                window.dispatchEvent(new Event("open-command-palette"));
              }}
              className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-white/10 hover:bg-white/15 text-[11px] font-bold transition"
            >
              <Search className="w-4 h-4 text-cyan-300" />
              <span>חיפוש ⌘K</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                window.dispatchEvent(new Event("open-voice-modal"));
              }}
              className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-white/10 hover:bg-white/15 text-[11px] font-bold transition"
            >
              <Mic className="w-4 h-4 text-amber-400" />
              <span>עוזרת קולית</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                window.dispatchEvent(new Event("open-rag-drawer"));
              }}
              className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[11px] font-extrabold transition"
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>25 סוכנים</span>
            </button>
          </div>
        </div>

        {/* Scrollable Categorized Routes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {NAV_CATEGORY_GROUPS.map((group) => {
            const items = STORE_NAV_ITEMS.filter((item) => item.category === group.id);
            return (
              <div key={group.id} className="space-y-2">
                <div className="px-1 flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-500 dark:text-amber-400 uppercase tracking-wider">
                    {group.title}
                  </span>
                  <span className="text-[10px] text-slate-400">{items.length} מסכים</span>
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
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-[0.98] ${
                          isActive
                            ? "bg-amber-500/10 border-amber-500/40 text-slate-900 dark:text-amber-300 shadow-sm"
                            : "bg-slate-50/80 dark:bg-slate-900/60 border-slate-200/70 dark:border-white/5 text-slate-700 dark:text-slate-200 hover:border-amber-500/30"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            isActive
                              ? "bg-amber-500 text-slate-950"
                              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold truncate">{item.label}</span>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[9px] font-mono font-black">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {item.description}
                          </p>
                        </div>

                        <ChevronLeft className="w-4 h-4 text-slate-400 shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Preferences & Promo Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-slate-950/90 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onCopyPromo}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold"
            >
              <span>קופון WELCOME10</span>
              {copiedCoupon ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={onToggleCurrency}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-bold"
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-mono">{currency === "ILS" ? "₪ ILS" : "$ USD"}</span>
            </button>

            <ThemeToggle />
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>התנתקות מהחשבון</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
