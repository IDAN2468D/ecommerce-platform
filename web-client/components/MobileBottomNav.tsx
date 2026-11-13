"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Gavel, Sparkles, Bot, ShoppingBag, User } from "lucide-react";

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<{ fullName?: string; email?: string } | null>(null);

  useEffect(() => {
    const syncState = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const count = cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
        setCartCount(count);

        const storedUser = localStorage.getItem("auth_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch {
        setCartCount(0);
      }
    };

    syncState();
    window.addEventListener("cart-updated", syncState);
    window.addEventListener("auth-changed", syncState);
    window.addEventListener("storage", syncState);

    return () => {
      window.removeEventListener("cart-updated", syncState);
      window.removeEventListener("auth-changed", syncState);
      window.removeEventListener("storage", syncState);
    };
  }, []);

  const isCatalog = pathname === "/";
  const isArena = pathname === "/arena";
  const isInnovations = pathname === "/innovations";
  const isCart = pathname === "/cart";
  const isProfile = pathname === "/profile";

  const handleOpenSwarm = () => {
    window.dispatchEvent(new Event("open-rag-drawer"));
  };

  const handleOpenCart = () => {
    window.dispatchEvent(new Event("open-cart-drawer"));
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200/90 dark:border-amber-500/20 shadow-2xl transition-all pb-safe"
      dir="rtl"
    >
      <div className="max-w-md mx-auto grid grid-cols-6 h-16 items-center px-1">
        {/* 1. Catalog */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 active:scale-95 transition-transform ${
            isCatalog
              ? "text-brand-600 dark:text-amber-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Store className="w-5 h-5" />
            {isCatalog && (
              <span className="absolute -bottom-1 inset-x-0 mx-auto w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">קטלוג</span>
        </Link>

        {/* 2. Arena (Flash Drops, Live Auctions & Group Buy) */}
        <Link
          href="/arena"
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 active:scale-95 transition-transform ${
            isArena
              ? "text-rose-600 dark:text-rose-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Gavel className="w-5 h-5" />
            {isArena && (
              <span className="absolute -bottom-1 inset-x-0 mx-auto w-1.5 h-1.5 rounded-full bg-rose-500" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">זירה חיה</span>
        </Link>

        {/* 3. V9 Innovations Hub */}
        <Link
          href="/innovations"
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 active:scale-95 transition-transform ${
            isInnovations
              ? "text-amber-600 dark:text-amber-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Sparkles className="w-5 h-5" />
            {isInnovations && (
              <span className="absolute -bottom-1 inset-x-0 mx-auto w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">חדשנות</span>
        </Link>

        {/* 4. 25-Agent AI Swarm Command */}
        <button
          type="button"
          onClick={handleOpenSwarm}
          className="flex flex-col items-center justify-center gap-1 h-full py-1 text-indigo-600 dark:text-indigo-400 active:scale-95 transition-transform"
          title="נחיל 25 סוכני AI"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shadow-sm">
            <Bot className="w-4 h-4 text-indigo-600 dark:text-amber-400" />
          </div>
          <span className="text-[10px] font-bold tracking-tight">25 סוכנים</span>
        </button>

        {/* 5. Cart Drawer Trigger */}
        <button
          type="button"
          onClick={handleOpenCart}
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 active:scale-95 transition-transform relative ${
            isCart
              ? "text-brand-600 dark:text-amber-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-brand-600 dark:bg-amber-500 text-white dark:text-slate-950 text-[10px] font-extrabold shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
          </div>
          <span className="text-[10px] tracking-tight">עגלה</span>
        </button>

        {/* 6. Account / User Profile & Warranties */}
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 active:scale-95 transition-transform ${
            isProfile
              ? "text-brand-600 dark:text-amber-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
          title="פרופיל אישי ותעודות אחריות"
        >
          <div className="relative">
            {user ? (
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 flex items-center justify-center text-[11px] font-bold">
                {user.fullName ? user.fullName.charAt(0) : "👤"}
              </div>
            ) : (
              <User className="w-5 h-5" />
            )}
            {isProfile && (
              <span className="absolute -bottom-1 inset-x-0 mx-auto w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight truncate max-w-[44px]">
            {user?.fullName ? user.fullName.split(" ")[0] : "פרופיל"}
          </span>
        </Link>
      </div>
    </nav>
  );
};
