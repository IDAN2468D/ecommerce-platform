"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HeaderNav } from "./HeaderNav";
import { CartDrawer } from "./CartDrawer";
import { CommandPalette } from "./CommandPalette";
import { RagAssistantDrawer } from "./RagAssistantDrawer";
import { FloatingAiButton } from "./FloatingAiButton";
import { MobileBottomNav } from "./MobileBottomNav";
import { VoiceShoppingModal } from "./store/VoiceShoppingModal";
import { DealNegotiatorModal } from "./store/DealNegotiatorModal";
import { Loader2, Lock } from "lucide-react";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [negotiateProduct, setNegotiateProduct] = useState<any | null>(null);

  const checkAuth = () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("auth_token");
    setIsAuthenticated(!!token);
  };

  useEffect(() => {
    checkAuth();
    const handleAuthChange = () => checkAuth();
    const handleOpenVoice = () => setIsVoiceOpen(true);
    const handleOpenNegotiate = (e: any) => setNegotiateProduct(e?.detail?.product || null);

    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("open-voice-modal", handleOpenVoice);
    window.addEventListener("open-negotiate-modal", handleOpenNegotiate);
    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("open-voice-modal", handleOpenVoice);
      window.removeEventListener("open-negotiate-modal", handleOpenNegotiate);
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
      <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 py-8 mb-16 md:mb-0 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">🛍️ חנות האלקטרוניקה</span>
            <span>•</span>
            <span>קנייה ישירה ומאובטחת</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>משלוח חינם מעל ₪500</span>
            <span>•</span>
            <span>5% Cashback VIP</span>
            <span>•</span>
            <span>שירות לקוחות 24/7</span>
          </div>
          <p>© 2026 כל הזכויות שמורות • קנייה מאובטחת בתקן PCI-DSS</p>
        </div>
      </footer>

      {/* Mobile Ergonomic Bottom Dock */}
      <MobileBottomNav />

      {/* Omnipresent Floating AI Trigger */}
      <FloatingAiButton />

      {/* Global Interactive Overlays */}
      <CartDrawer />
      <CommandPalette />
      <RagAssistantDrawer />
      <VoiceShoppingModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
      <DealNegotiatorModal
        isOpen={!!negotiateProduct}
        product={negotiateProduct}
        onClose={() => setNegotiateProduct(null)}
      />
    </div>
  );
};
