"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HeaderNav } from "./HeaderNav";
import { CartDrawer } from "./CartDrawer";
import { CommandPalette } from "./CommandPalette";
import { ArchitectureDrawer } from "./ArchitectureDrawer";
import { MobileBottomNav } from "./MobileBottomNav";
import { Loader2, Lock } from "lucide-react";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const checkAuth = () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("auth_token");
    setIsAuthenticated(!!token);
  };

  useEffect(() => {
    checkAuth();
    const handleAuthChange = () => checkAuth();
    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/auth";

  useEffect(() => {
    if (isAuthenticated === null) return;

    if (!isAuthenticated && !isAuthPage) {
      router.replace("/login");
    } else if (isAuthenticated && isAuthPage) {
      router.replace("/");
    }
  }, [isAuthenticated, isAuthPage, router]);

  // Dedicated standalone pages for login / register: no store header, no store footer
  if (isAuthPage) {
    return <main className="min-h-screen w-full flex flex-col bg-slate-900">{children}</main>;
  }

  // If checking authentication or unauthenticated on a protected store page:
  if (isAuthenticated === null || !isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg text-slate-100">נדרשת התחברות למערכת</h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">מעביר אותך לדף ההתחברות...</p>
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
        </div>
      </div>
    );
  }

  // Authenticated user on store pages (Catalog, Cart, Orders):
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <HeaderNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
        {children}
      </main>
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mb-16 md:mb-0 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <p>© 2026 E-Commerce Distributed Platform • Powered by Spring Boot 3, Apache Kafka & Next.js</p>
      </footer>

      {/* Mobile Ergonomic Bottom Dock */}
      <MobileBottomNav />

      {/* Global Interactive Overlays */}
      <CartDrawer />
      <CommandPalette />
      <ArchitectureDrawer />
    </div>
  );
};
