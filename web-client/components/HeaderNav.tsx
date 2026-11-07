"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Package,
  Store,
  User,
  LogOut,
  Search,
  Coins,
  Crown,
  Truck,
  ShieldCheck,
  Copy,
  Check,
  ChevronLeft,
  Layers,
  Mic,
} from "lucide-react";
import { useNotificationStream } from "../lib/useNotificationStream";
import { NotificationToast } from "./NotificationToast";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { useCurrency } from "../context/CurrencyContext";

interface CurrentUser {
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

export const HeaderNav: React.FC = () => {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const { currency, toggleCurrency, formatPrice } = useCurrency();

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

  // Scroll listener for dynamic Liquid Glass elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync Cart Count & Live Subtotal
  useEffect(() => {
    const updateCartMetrics = () => {
      try {
        const items = JSON.parse(localStorage.getItem("cart") || "[]");
        const count = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
        const total = items.reduce(
          (sum: number, item: any) => sum + (Number(item.unitPrice ?? item.price ?? 0) * (item.quantity || 1)),
          0
        );
        setCartCount(count);
        setCartSubtotal(total);
      } catch {
        setCartCount(0);
        setCartSubtotal(0);
      }
    };
    updateCartMetrics();
    window.addEventListener("cart-updated", updateCartMetrics);
    window.addEventListener("storage", updateCartMetrics);
    return () => {
      window.removeEventListener("cart-updated", updateCartMetrics);
      window.removeEventListener("storage", updateCartMetrics);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setCurrentUser(null);
    window.dispatchEvent(new Event("auth-changed"));
    window.location.href = "/login";
  };

  const handleCopyPromo = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("WELCOME10");
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 1800);
    }
  };

  const customerId = currentUser?.userId || "usr_demo";
  const { notifications, activeToast, connected, unreadCount, dismissToast, markAllAsRead } =
    useNotificationStream(customerId);

  const navLinks = [
    { href: "/", label: "קטלוג מוצרים", icon: Store, active: pathname === "/" },
    { href: "/arena", label: "זירת Flash & קבוצתיות", icon: Layers, active: pathname.startsWith("/arena"), highlight: true },
    { href: "/gifting", label: "מתנות, טרייד-אין ו-B2B", icon: Coins, active: pathname.startsWith("/gifting") },
    { href: "/orders", label: "מעקב הזמנות", icon: Package, active: pathname.startsWith("/orders") },
    { href: "/profile", label: "מועדון VIP ואחריות", icon: Crown, active: pathname.startsWith("/profile") },
    { href: "/admin", label: "בקרה SAGA", icon: ShieldCheck, active: pathname.startsWith("/admin") },
  ];

  return (
    <>
      <NotificationToast toast={activeToast} onDismiss={dismissToast} />

      <div className="sticky top-0 z-40 w-full transition-all duration-300 pt-safe" dir="rtl">
        {/* TIER 1: Top Micro-Utility & Interactive Promo Strip */}
        <div className="bg-slate-950 text-slate-300 border-b border-white/10 text-[11px] py-1.5 px-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
            {/* Right: Value Props */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                <span>משלוח אקספרס חינם מעל ₪500</span>
              </span>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-amber-400 font-bold">
                <Crown className="w-3.5 h-3.5" />
                <span>5% Cashback VIP בכל רכישה</span>
              </span>
              <span className="text-slate-700 hidden md:inline">|</span>
              <span className="hidden md:inline-flex items-center gap-1 text-cyan-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>אחריות יבואן רשמי לשנתיים</span>
              </span>
            </div>

            {/* Left: Interactive Promo Code Pill & Live Currency Switcher */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyPromo}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-medium transition active:scale-95"
                title="לחץ להעתקת קוד קופון ל-10% הנחה"
              >
                <span>10% הנחה בקופון:</span>
                <strong className="font-mono tracking-wider text-amber-200">WELCOME10</strong>
                {copiedCoupon ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-amber-400/80" />
                )}
              </button>

              <button
                type="button"
                onClick={toggleCurrency}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-slate-200 hover:text-amber-300 transition"
                title="החלף מטבע תצוגה (שער רציף)"
              >
                <Coins className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="font-mono">{currency === "ILS" ? "₪ ILS" : "$ USD"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* TIER 2: Main 3-Zone Liquid Glass 4.0 Pro Header */}
        <header
          className={`w-full transition-all duration-300 ${
            isScrolled
              ? "bg-white/85 dark:bg-[#060608]/85 backdrop-blur-2xl shadow-[0_12px_32px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_14px_36px_-10px_rgba(0,0,0,0.75)] border-b border-slate-200/80 dark:border-amber-500/20"
              : "bg-white/95 dark:bg-[#090a0f]/90 backdrop-blur-xl border-b border-slate-200/70 dark:border-white/10"
          }`}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-3 lg:gap-6">
            {/* ZONE 1 (Right): Brand Identity & Segmented Navigation Pill Bar */}
            <div className="flex items-center gap-4 lg:gap-6 shrink-0">
              <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none">
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 dark:from-amber-500/20 dark:via-indigo-950 dark:to-slate-900 p-[1.5px] shadow-lg shadow-indigo-500/10 group-hover:shadow-amber-500/20 transition-all duration-300 group-hover:scale-105">
                  <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-indigo-500/25 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <Layers className="w-5 h-5 text-amber-400 relative z-10 transform group-hover:rotate-6 transition-transform" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                      NEXUS
                    </span>
                    <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 leading-none shadow-xs">
                      PRO
                    </span>
                  </div>
                  <span className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    חנות הדגל הרשמית • ישראל
                  </span>
                </div>
              </Link>

              {/* Desktop Segmented Navigation Capsule */}
              <nav
                aria-label="ניווט ראשי"
                className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10"
              >
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                        item.active
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-amber-400 shadow-xs border border-slate-200/60 dark:border-amber-500/30"
                          : item.highlight
                          ? "text-amber-700 dark:text-amber-300/90 hover:bg-amber-500/10"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          item.active || item.highlight ? "text-amber-500 dark:text-amber-400" : "text-slate-400"
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* ZONE 2 (Center): Omnibox Command Search */}
            <div className="flex-1 max-w-md mx-auto hidden md:flex items-center">
              <div className="w-full flex items-center justify-between gap-2 p-1 px-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/90 dark:border-white/10 focus-within:border-amber-500/50 transition-all shadow-inner">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
                  className="w-full flex items-center gap-2.5 text-right text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 py-1.5 transition"
                  title="חיפוש מהיר בקטלוג (Ctrl+K)"
                >
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">חיפוש מוצר, מותג או מק״ט...</span>
                  <kbd className="mr-auto ml-1 px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-mono border border-slate-200 dark:border-slate-700 shadow-2xs">
                    ⌘K
                  </kbd>
                </button>
              </div>
            </div>

            {/* ZONE 3 (Left): Action Dock (Mobile Search, Notifications, Theme, Rich Cart, User Capsule) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Mobile Quick Search Trigger */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
                className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800"
                title="חיפוש מהיר"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Voice Shopping Assistant Trigger */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("open-voice-modal"))}
                className="relative flex items-center justify-center p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 hover:text-amber-400 border border-amber-500/30 transition-all hover:scale-105 active:scale-95"
                title="סוכנת קניות קולית (Gemini Voice)"
              >
                <Mic className="w-4 h-4 text-amber-500 animate-pulse" />
              </button>

              {/* Live Notification Bell */}
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                connected={connected}
                onMarkAllAsRead={markAllAsRead}
              />

              {/* Theme Toggle (Pearl Light / Obsidian Dark) */}
              <ThemeToggle />

              {/* Rich Cart Button with Item Badge & Live Subtotal */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("open-cart-drawer"))}
                className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all active:scale-95"
                title="פתיחת עגלת הקניות"
              >
                <div className="relative flex items-center">
                  <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                  {cartCount > 0 && (
                    <span className="mr-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-slate-950 text-amber-400 text-[11px] font-mono font-black">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">
                  {cartCount > 0 ? formatPrice(cartSubtotal) : "עגלה"}
                </span>
              </button>

              {/* User Profile Capsule */}
              <div className="hidden sm:flex items-center gap-1 pl-1 pr-1.5 py-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 hover:opacity-90 transition group pl-1"
                  title="אזור אישי ומועדון לקוחות VIP"
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-900 dark:from-amber-500 dark:to-amber-300 text-white dark:text-slate-950 flex items-center justify-center text-xs font-black shadow-xs group-hover:scale-105 transition-transform">
                    {currentUser?.fullName ? (
                      currentUser.fullName.charAt(0).toUpperCase()
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="hidden xl:flex flex-col text-right">
                    <span className="text-[11px] font-extrabold text-slate-900 dark:text-slate-100 leading-none truncate max-w-[90px]">
                      {currentUser?.fullName || "אזור אישי"}
                    </span>
                    <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold mt-0.5 leading-none">
                      VIP Platinum
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="התנתק מהחשבון"
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </header>
      </div>
    </>
  );
};
