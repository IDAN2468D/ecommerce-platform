"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Package, Search, ShoppingBag, User, LogOut } from "lucide-react";

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
  const isOrders = pathname === "/orders";
  const isCart = pathname === "/cart";
  const isProfile = pathname === "/profile";

  const handleOpenSearch = () => {
    window.dispatchEvent(new Event("open-command-palette"));
  };

  const handleOpenCart = () => {
    window.dispatchEvent(new Event("open-cart-drawer"));
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-200/90 dark:border-amber-500/20 shadow-2xl transition-all pb-safe"
      dir="rtl"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
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

        {/* 2. Orders */}
        <Link
          href="/orders"
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 active:scale-95 transition-transform ${
            isOrders
              ? "text-brand-600 dark:text-amber-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Package className="w-5 h-5" />
            {isOrders && (
              <span className="absolute -bottom-1 inset-x-0 mx-auto w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">הזמנות</span>
        </Link>

        {/* 3. Search (Command Palette) */}
        <button
          type="button"
          onClick={handleOpenSearch}
          className="flex flex-col items-center justify-center gap-1 h-full py-1 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-amber-400 active:scale-95 transition-transform"
          title="חיפוש מהיר"
        >
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
            <Search className="w-4 h-4 text-slate-700 dark:text-slate-200" />
          </div>
          <span className="text-[10px] tracking-tight">חיפוש</span>
        </button>

        {/* 4. Cart Drawer Trigger */}
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
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-brand-600 dark:bg-amber-500 text-white dark:text-slate-950 text-[10px] font-extrabold shadow-md animate-pulse">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">עגלה</span>
        </button>

        {/* 5. Account / User Profile & MCPs */}
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 active:scale-95 transition-transform ${
            isProfile
              ? "text-brand-600 dark:text-amber-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
          title="פרופיל אישי וחיבורי MCP"
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
          <span className="text-[10px] tracking-tight truncate max-w-[48px]">
            {user?.fullName ? user.fullName.split(" ")[0] : "פרופיל"}
          </span>
        </Link>
      </div>
    </nav>
  );
};
