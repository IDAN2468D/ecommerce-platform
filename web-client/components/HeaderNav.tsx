"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  User,
  LogOut,
  Search,
  Coins,
  Crown,
  Truck,
  ShieldCheck,
  Copy,
  Check,
  Layers,
  Mic,
  Menu,
  ChevronDown,
  Bot,
  LayoutGrid,
} from "lucide-react";
import { useNotificationStream } from "../lib/useNotificationStream";
import { NotificationToast } from "./NotificationToast";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { useCurrency } from "../context/CurrencyContext";
import { STORE_NAV_ITEMS, NavItem } from "./nav/navigationConfig";
import { MegaMenuFlyout } from "./nav/MegaMenuFlyout";
import { MobileNavDrawer } from "./nav/MobileNavDrawer";

interface CurrentUser {
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

const PILL_BADGE_COLORS: Record<NonNullable<NavItem["badgeTone"]>, string> = {
  amber: "bg-amber-500 text-slate-950",
  rose: "bg-rose-500 text-white",
  emerald: "bg-emerald-500 text-white",
  indigo: "bg-indigo-500 text-white",
  cyan: "bg-cyan-500 text-slate-950",
};

export const HeaderNav: React.FC = () => {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const { currency, toggleCurrency, formatPrice } = useCurrency();

  const loadUser = () => {
    try {
      const userStr = localStorage.getItem("auth_user");
      setCurrentUser(userStr ? JSON.parse(userStr) : null);
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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const updateCartMetrics = () => {
      try {
        const items = JSON.parse(localStorage.getItem("cart") || "[]");
        const count = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
        const total = items.reduce(
          (sum: number, item: any) => sum + Number(item.unitPrice ?? item.price ?? 0) * (item.quantity || 1),
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

  useEffect(() => {
    setIsMegaMenuOpen(false);
    setIsMobileDrawerOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsMegaMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMegaMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEsc);
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

  const topStripLinks = STORE_NAV_ITEMS.filter((item) => item.showInTopStrip);

  return (
    <>
      <NotificationToast toast={activeToast} onDismiss={dismissToast} />

      <div
        ref={headerRef}
        className="sticky top-0 z-40 w-full transition-all duration-300"
        dir="rtl"
        onMouseLeave={() => setIsMegaMenuOpen(false)}
      >
        {/* TIER 1: Slim Utility & Promo Strip (No transparent top gap) */}
        <div className="bg-slate-950 text-slate-300 border-b border-white/10 text-[11px] py-1.5 px-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-200 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">משלוח אקספרס חינם מעל ₪500</span>
              </span>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-amber-400 font-bold shrink-0">
                <Crown className="w-3.5 h-3.5" />
                <span>5% Cashback VIP בכל רכישה</span>
              </span>
              <span className="text-slate-700 hidden lg:inline">|</span>
              <span className="hidden lg:inline-flex items-center gap-1 text-cyan-400 font-medium shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>לוקרים 24/7 ואיסוף באילת 0% מע״מ</span>
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyPromo}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-medium transition active:scale-95"
                title="לחץ להעתקת קוד קופון ל-10% הנחה"
              >
                <span className="hidden sm:inline">10% הנחה:</span>
                <strong className="font-mono tracking-wider text-amber-200">WELCOME10</strong>
                {copiedCoupon ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-400/80" />}
              </button>

              <button
                type="button"
                onClick={toggleCurrency}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-slate-200 hover:text-amber-300 transition"
                title="החלף מטבע תצוגה"
              >
                <Coins className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="font-mono">{currency === "ILS" ? "₪ ILS" : "$ USD"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* TIER 2: Main Header (Brand + Search + Action Dock) */}
        <header
          className={`w-full transition-all duration-300 backdrop-blur-xl ${
            isScrolled
              ? "bg-white/95 dark:bg-slate-950/95 shadow-lg border-b border-slate-200 dark:border-amber-500/25"
              : "bg-white/95 dark:bg-slate-950/90 border-b border-slate-200/80 dark:border-white/10"
          }`}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2.5 lg:gap-5">
            {/* ZONE 1 (Right): Mobile Hamburger + Brand Identity */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                aria-label="פתח תפריט ניווט"
                className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/10 hover:border-amber-500/40 active:scale-95 transition"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 dark:from-amber-500/25 dark:via-indigo-950 dark:to-slate-900 p-[1.5px] shadow-md group-hover:shadow-amber-500/20 transition-all duration-300 group-hover:scale-105">
                  <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/25 via-transparent to-indigo-500/25 opacity-80" />
                    <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 relative z-10 transform group-hover:rotate-6 transition-transform" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                      NEXUS
                    </span>
                    <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 leading-none">
                      PRO
                    </span>
                  </div>
                  <span className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    33 מיקרו-שירותים • 25 סוכני AI
                  </span>
                </div>
              </Link>
            </div>

            {/* ZONE 2 (Center): Apple/Amazon-style Unified Omnibox Search & AI Bar */}
            <div className="flex-1 max-w-xl mx-auto hidden md:flex items-center">
              <div className="w-full flex items-center gap-1.5 p-1 pr-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 hover:border-amber-500/40 focus-within:border-amber-500/60 transition-all shadow-inner">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
                  className="flex-1 flex items-center gap-2.5 text-right text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 py-1.5 transition"
                  title="חיפוש חכם בקטלוג ובשירותים (Ctrl+K)"
                >
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">חיפוש מוצר, מותג, מק״ט או שאלה ל-AI...</span>
                  <kbd className="mr-auto px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-mono border border-slate-200 dark:border-slate-700">
                    ⌘K
                  </kbd>
                </button>

                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event("open-voice-modal"))}
                  className="p-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 transition"
                  title="חיפוש וקנייה קולית (Gemini Voice)"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ZONE 3 (Left): Action Dock */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Mobile Search & Voice Triggers */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
                className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800"
                title="חיפוש מהיר"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("open-voice-modal"))}
                className="md:hidden p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                title="עוזרת קולית"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Desktop 25-Agent AI Swarm Quick Launch */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("open-rag-drawer"))}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25 text-xs font-extrabold transition"
                title="פתח את נחיל 25 הסוכנים האוטונומיים"
              >
                <Bot className="w-4 h-4 text-indigo-500 dark:text-amber-400" />
                <span className="hidden xl:inline">25 סוכני AI</span>
              </button>

              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                connected={connected}
                onMarkAllAsRead={markAllAsRead}
              />

              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              {/* Rich Cart Button */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("open-cart-drawer"))}
                className="relative flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
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

              {/* User Account Dropdown Capsule */}
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 hover:border-amber-500/40 transition"
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-900 dark:from-amber-500 dark:to-amber-300 text-white dark:text-slate-950 flex items-center justify-center text-xs font-black">
                    {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className="hidden xl:flex flex-col text-right">
                    <span className="text-[11px] font-extrabold text-slate-900 dark:text-slate-100 leading-none truncate max-w-[90px]">
                      {currentUser?.fullName || "אזור אישי"}
                    </span>
                    <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold mt-0.5 leading-none">
                      VIP Platinum
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#0b0d14] border border-slate-200 dark:border-white/10 shadow-2xl p-2 space-y-1 z-50">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span>מועדון VIP ואחריות</span>
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>מעקב הזמנות וקבלות</span>
                    </Link>
                    <Link
                      href="/cart"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <ShoppingBag className="w-4 h-4 text-indigo-500" />
                      <span>עמוד קופה מלא</span>
                    </Link>
                    <div className="border-t border-slate-200 dark:border-white/10 my-1" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>התנתק מהחשבון</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TIER 3: Responsive Non-Clipping Desktop & Tablet Category Strip */}
          <div className="hidden md:block border-t border-slate-200/80 dark:border-white/10 bg-slate-100/90 dark:bg-slate-900/90">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center gap-1.5">
              {/* Mega-Menu Trigger */}
              <button
                type="button"
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onClick={() => setIsMegaMenuOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition shrink-0 ${
                  isMegaMenuOpen
                    ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-900 dark:text-amber-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-amber-500/30 shadow-sm"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>כל המחלקות</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${isMegaMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              <span className="h-5 w-px bg-slate-300 dark:bg-white/15 mx-1 shrink-0" />

              {/* All Store Navigation Pills — wrapped cleanly so NOTHING clips off-screen */}
              <nav aria-label="קטגוריות וניווט ראשי" className="flex flex-wrap items-center gap-1">
                {topStripLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        isActive
                          ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm"
                          : "text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? "text-amber-400 dark:text-slate-950" : "text-slate-500 dark:text-slate-400"
                        }`}
                      />
                      <span>{item.shortLabel}</span>
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-black leading-none ${
                            isActive
                              ? "bg-white/20 dark:bg-slate-950/20 text-current"
                              : PILL_BADGE_COLORS[item.badgeTone || "amber"]
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </header>

        {/* Desktop Interactive Mega-Menu Flyout */}
        <MegaMenuFlyout
          isOpen={isMegaMenuOpen}
          pathname={pathname}
          onClose={() => setIsMegaMenuOpen(false)}
        />
      </div>

      {/* Mobile & Tablet Full-Height RTL Slide-Over Drawer */}
      <MobileNavDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        pathname={pathname}
        currentUser={currentUser}
        currency={currency}
        onToggleCurrency={toggleCurrency}
        copiedCoupon={copiedCoupon}
        onCopyPromo={handleCopyPromo}
        onLogout={handleLogout}
      />
    </>
  );
};
