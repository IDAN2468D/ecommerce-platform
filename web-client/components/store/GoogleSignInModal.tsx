"use client";

import React, { useState } from "react";
import { Check, X, Shield, ArrowLeft, Loader2, Sparkles, UserPlus } from "lucide-react";

export interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const GoogleLogoIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loadingAccount, setLoadingAccount] = useState<string | null>(null);
  const [customEmailMode, setCustomEmailMode] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const accounts = [
    {
      id: "primary",
      email: "idankzm@gmail.com",
      fullName: "Idan Kazam",
      badge: "חשבון ברירת מחדל • VIP",
      avatarBg: "from-amber-500 to-amber-600",
      initials: "IK",
    },
    {
      id: "secondary",
      email: "idan.developer@gmail.com",
      fullName: "עידן כזם (Tech Lead)",
      badge: "חשבון עבודה מפתח",
      avatarBg: "from-indigo-600 to-blue-600",
      initials: "עכ",
    },
  ];

  const handleSelectAccount = async (account: { email: string; fullName: string }) => {
    setError(null);
    setLoadingAccount(account.email);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: account.email,
          fullName: account.fullName,
        }),
      });

      if (!res.ok) {
        throw new Error("אימות מול שרתי Google נכשל, נסה שנית");
      }

      const data = await res.json();
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
      if (data.user) {
        localStorage.setItem("auth_user", JSON.stringify(data.user));
      }
      window.dispatchEvent(new Event("auth-changed"));
      onSuccess(data.user);
    } catch (err: any) {
      setError(err.message || "שגיאה בחיבור לחשבון Google");
      setLoadingAccount(null);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customName) {
      setError("נא למלא שם וכתובת אימייל תקינה");
      return;
    }
    handleSelectAccount({ email: customEmail, fullName: customName });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-7 space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={Boolean(loadingAccount)}
          className="absolute left-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="סגור חלון"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Google Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm mx-auto">
            <GoogleLogoIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
            התחבר באמצעות Google
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            בחר חשבון כדי לעבור לחנות <span className="font-bold text-amber-500">NEXUS PRO</span>
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        {!customEmailMode ? (
          <div className="space-y-2.5">
            {accounts.map((acc) => {
              const isLoading = loadingAccount === acc.email;
              return (
                <button
                  key={acc.id}
                  onClick={() => handleSelectAccount(acc)}
                  disabled={Boolean(loadingAccount)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition active:scale-[0.99] group text-right"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${acc.avatarBg} text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0`}
                    >
                      {acc.initials}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{acc.fullName}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400" dir="ltr">
                        {acc.email}
                      </div>
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                        {acc.badge}
                      </div>
                    </div>
                  </div>

                  {isLoading ? (
                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
                  ) : (
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:-translate-x-1 transition shrink-0" />
                  )}
                </button>
              );
            })}

            <button
              onClick={() => setCustomEmailMode(true)}
              disabled={Boolean(loadingAccount)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>השתמש בחשבון Google אחר...</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">שם מלא</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="ישראל ישראלי"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">כתובת אימייל של Google</label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="user@gmail.com"
                dir="ltr"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={Boolean(loadingAccount)}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition"
              >
                {loadingAccount ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "אישור והתחברות"}
              </button>
              <button
                type="button"
                onClick={() => setCustomEmailMode(false)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
              >
                חזרה
              </button>
            </div>
          </form>
        )}

        {/* Security Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>אימות מאובטח ע\"י Google OAuth</span>
          </div>
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Sparkles className="w-3 h-3" />
            <span>5% Cashback VIP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
