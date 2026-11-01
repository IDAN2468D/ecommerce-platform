"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("נא למלא את כל השדות");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || "פרטי התחברות שגויים");
      }

      const data = await res.json();
      if (data.token) localStorage.setItem("auth_token", data.token);
      if (data.user) localStorage.setItem("auth_user", JSON.stringify(data.user));

      window.dispatchEvent(new Event("auth-changed"));
      setSuccessMsg("התחברת בהצלחה! מעביר אותך לחנות...");
      setTimeout(() => {
        router.push("/");
      }, 800);
    } catch (err: any) {
      setError(err.message || "אירעה שגיאה בכניסה למערכת");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-[#060608] text-slate-900 dark:text-slate-100" dir="rtl">
      <div className="max-w-md w-full space-y-6">
        {/* Back Link */}
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
            <ArrowRight className="w-4 h-4" />
            <span>חזרה לחנות</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl shadow-xl shadow-amber-500/20">
            🛍️
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Store 2026 • Premium Tech
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            כניסה מאובטחת בתקן SSL 256-Bit • הגנת פרטיות מלאה
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">התחברות לחשבון</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              הזן את פרטיך לגישה לאזור האישי, היסטוריית הזמנות וצבירת Cashback
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">כתובת אימייל</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  dir="ltr"
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">סיסמה</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>מתחבר...</span>
                </>
              ) : (
                "התחבר לחנות"
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            עדיין אין לך חשבון?{" "}
            <Link href="/register" className="font-bold text-amber-600 dark:text-amber-400 hover:underline mr-1">
              צור חשבון חדש כאן
            </Link>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>הגנת נתונים מחמירה בתקן SSL 256-Bit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
