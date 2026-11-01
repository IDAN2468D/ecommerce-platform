"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Package, Store, Radio, User, LogOut, Search, Coins } from "lucide-react";
import { useNotificationStream } from "../lib/useNotificationStream";
import { NotificationToast } from "./NotificationToast";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";

interface CurrentUser {
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

export const HeaderNav: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [currency, setCurrency] = useState<"ILS" | "USD">("ILS");

  // Sync auth user from localStorage
  const loadUser = () => {
    try {
      const userStr = localStorage.getItem("auth_user");
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    const handleAuthChange = () => loadUser();
    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setCurrentUser(null);
    window.dispatchEvent(new Event("auth-changed"));
    window.location.href = "/login";
  };

  // Connect SSE for current user ID or fallback to demo
  const customerId = currentUser?.userId || "usr_demo";
  const { notifications, activeToast, connected, unreadCount, dismissToast, markAllAsRead } =
    useNotificationStream(customerId);

  useEffect(() => {
    const updateCount = () => {
      try {
        const items = JSON.parse(localStorage.getItem("cart") || "[]");
        const count = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };
    updateCount();
    window.addEventListener("cart-updated", updateCount);
    window.addEventListener("storage", updateCount);
    return () => {
      window.removeEventListener("cart-updated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  // Handle currency toggle (rapidapi_currency MCP backed)
  const toggleCurrency = () => {
    const next = currency === "ILS" ? "USD" : "ILS";
    setCurrency(next);
    localStorage.setItem("user_currency", next);
    window.dispatchEvent(new CustomEvent("currency-changed", { detail: next }));
  };

  return (
    <>
      <NotificationToast toast={activeToast} onDismiss={dismissToast} />

      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/90 dark:border-amber-500/20 transition-all pt-safe">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-md group-hover:scale-105 transition-transform">
              🛍️
            </div>
            <div className="text-right">
              <span className="font-extrabold text-sm sm:text-lg text-slate-900 dark:text-slate-100 block leading-tight">
                E-Commerce
              </span>
              <span className="hidden sm:block text-[11px] text-slate-500 dark:text-amber-400/80 font-mono">
                Microservices • Kafka SAGA • MCP
              </span>
            </div>
          </Link>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-1.5 sm:gap-3">
            {/* Live Currency Selector Pill (rapidapi_currency) */}
            <button
              type="button"
              onClick={toggleCurrency}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-amber-500/30 text-[11px] font-bold text-slate-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition shadow-xs"
              title="החלף מטבע (שער חי)"
            >
              <Coins className="w-3 h-3 text-amber-500 shrink-0" />
              <span>{currency === "ILS" ? "₪ ILS" : "$ USD"}</span>
            </button>

            {/* Quick Command Palette Trigger (Ctrl+K) - Desktop */}
            <button
              onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200/80 dark:border-slate-800 text-xs font-medium transition"
              title="חיפוש מהיר ופעולות (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span>חיפוש...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-300 text-[10px] font-mono border border-slate-200 dark:border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* Desktop Direct Links */}
            <Link
              href="/"
              className="hidden md:flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition"
            >
              <Store className="w-4 h-4" />
              <span>קטלוג</span>
            </Link>

            <Link
              href="/orders"
              className="hidden md:flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition"
            >
              <Package className="w-4 h-4" />
              <span>הזמנות</span>
            </Link>

            {/* Notification Bell with live SSE */}
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              connected={connected}
              onMarkAllAsRead={markAllAsRead}
            />

            {/* Theme Toggle (Dark/Light) */}
            <ThemeToggle />

            {/* Cart Button (Opens Slide-Over Mini Cart Drawer) */}
            <button
              onClick={() => window.dispatchEvent(new Event("open-cart-drawer"))}
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95"
              title="עגלת קניות"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">עגלה</span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-5 px-1 rounded-full bg-white text-brand-700 text-[10px] sm:text-xs font-black shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile & Logout - Desktop */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl py-1 px-2.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
              </div>
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">
                  {currentUser?.fullName || "משתמש"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="התנתק"
                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Ultra-compact Mobile Telemetry Ticker */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-slate-300 py-1 px-3 text-[11px] font-mono border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
          <span className="text-slate-400 text-[10px]">
            {connected ? "Kafka SSE מחובר בזמן אמת" : "מתחבר ל-Kafka..."}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 shrink-0">
          <span className="text-amber-400/90 font-semibold">⚡ Redis &lt;5ms</span>
          <span>•</span>
          <span className="text-emerald-400/90 font-semibold">5% Cashback</span>
          <span>•</span>
          <span className="text-cyan-400/90 font-semibold">MCP Sync</span>
        </div>
      </div>
    </>
  );
};
