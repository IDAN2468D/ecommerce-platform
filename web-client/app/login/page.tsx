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
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { GoogleSignInModal, GoogleLogoIcon } from "../../components/store/GoogleSignInModal";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("נא למלא כתובת אימייל וסיסמה");
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
      }, 700);
    } catch (err: any) {
      setError(err.message || "אירעה שגיאה בכניסה למערכת");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoVipLogin = async () => {
    setError(null);
    setDemoLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "idankzm@gmail.com",
          fullName: "עידן כזם (VIP)",
        }),
      });

      if (!res.ok) throw new Error("שגיאה בהתחברות דמו");

      const data = await res.json();
      if (data.token) localStorage.setItem("auth_token", data.token);
      if (data.user) localStorage.setItem("auth_user", JSON.stringify(data.user));

      window.dispatchEvent(new Event("auth-changed"));
      setSuccessMsg("התחברת בהצלחה כמשתמש VIP Platinum!");
      setTimeout(() => {
        router.push("/");
      }, 600);
    } catch (err: any) {
      setError(err.message || "אירעה שגיאה בכניסת דמו");
    } finally {
      setDemoLoading(false);
    }
  };

  const handleGoogleSuccess = (user: any) => {
    setIsGoogleModalOpen(false);
    setSuccessMsg(`ברוך הבא, ${user.fullName || "משתמש Google"}! מעביר אותך לחנות...`);
    setTimeout(() => {
      router.push("/");
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-[#060608] text-slate-900 dark:text-slate-100 transition-colors" dir="rtl">
      <div className="max-w-md w-full space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>חזרה לחנות</span>
          </Link>
          <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
            NEXUS PRO ID
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 dark:from-amber-500/20 dark:via-indigo-950 dark:to-slate-900 border border-slate-200 dark:border-white/10 shadow-xl shadow-amber-500/10 mx-auto">
            <Layers className="w-7 h-7 text-amber-500" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              NEXUS
            </span>
            <span className="text-[11px] font-mono font-black px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-xs">
              PRO
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            כניסה מאובטחת לחשבון הלקוח • חנות הדגל הרשמית
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-2xl p-6 sm:p-8 space-y-5 backdrop-blur-xl">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              התחברות לחשבון
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              גישה ישירה למעקב הזמנות, קבלות דיגיטליות וצבירת Cashback
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Sign-in Primary Button */}
          <button
            type="button"
            onClick={() => setIsGoogleModalOpen(true)}
            className="w-full h-12 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition active:scale-[0.99] group"
          >
            <GoogleLogoIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>המשך באמצעות חשבון Google</span>
          </button>

          {/* Modern Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            <span className="absolute px-3 bg-white dark:bg-slate-900 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              או באמצעות אימייל
            </span>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                כתובת אימייל
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  dir="ltr"
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs outline-none focus:ring-2 focus:ring-amber-500/50 transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">סיסמה</label>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer">
                  שכחת סיסמה?
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs outline-none focus:ring-2 focus:ring-amber-500/50 transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>מתחבר...</span>
                </>
              ) : (
                "התחבר לחשבון"
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <button
            type="button"
            onClick={handleDemoVipLogin}
            disabled={loading || demoLoading}
            className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            {demoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-500" />}
            <span>התחברות מהירה כמשתמש VIP (דמו 1-Click)</span>
          </button>

          {/* Register Link */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            עדיין אין לך חשבון?{" "}
            <Link
              href="/register"
              className="font-bold text-amber-600 dark:text-amber-400 hover:underline mr-1"
            >
              הצטרף למועדון VIP כאן
            </Link>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>הגנת נתונים מאובטחת SSL 256-Bit</span>
          </div>
        </div>
      </div>

      {/* Google Sign-in Modal */}
      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
      />
    </div>
  );
}
