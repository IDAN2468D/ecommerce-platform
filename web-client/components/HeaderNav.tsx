"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Package, Store, Radio, User, LogOut } from "lucide-react";
import { useNotificationStream } from "../lib/useNotificationStream";
import { NotificationToast } from "./NotificationToast";
import { NotificationBell } from "./NotificationBell";

interface CurrentUser {
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

export const HeaderNav: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [cartCount, setCartCount] = useState(0);

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

  return (
    <>
      <NotificationToast toast={activeToast} onDismiss={dismissToast} />

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:bg-brand-700 transition">
              🛍️
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 block leading-tight">E-Commerce Platform</span>
              <span className="text-xs text-slate-500 font-mono">Microservices • Java 21 • Kafka SAGA</span>
            </div>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-600 transition"
            >
              <Store className="w-4 h-4" />
              <span>קטלוג</span>
            </Link>

            <Link
              href="/orders"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-600 transition"
            >
              <Package className="w-4 h-4" />
              <span>הזמנות ומעקב</span>
            </Link>

            {/* Notification Bell with live SSE */}
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              connected={connected}
              onMarkAllAsRead={markAllAsRead}
            />

            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 shadow-sm transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>עגלת קניות</span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white text-brand-700 text-xs font-extrabold shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl py-1.5 px-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 leading-none">
                  {currentUser?.fullName || "משתמש מחובר"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono leading-none mt-0.5">
                  {currentUser?.email || ""}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="התנתק מהחשבון"
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-brand-700 text-white py-1.5 px-4 text-xs font-medium text-center flex items-center justify-center gap-2 shadow-inner">
        <Radio className={`w-3.5 h-3.5 ${connected ? "text-emerald-200 animate-pulse" : "text-amber-200"}`} />
        <span>
          {connected
            ? `ערוץ שידור חי (Server-Sent Events) מחובר עבור ${currentUser?.fullName || "משתמש"} (${customerId})`
            : "מתחבר לערוץ השידור החי (SSE)..."}
        </span>
      </div>
    </>
  );
};
