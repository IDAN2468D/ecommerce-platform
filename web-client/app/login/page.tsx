"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, Loader2, Sparkles, AlertCircle, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        throw new Error("נא להזין דואר אלקטרוני וסיסמה");
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "פרטי התחברות שגויים");
      }

      localStorage.setItem("auth_token", data.token);
      localStorage.setItem(
        "auth_user",
        JSON.stringify({
          userId: data.userId,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
        })
      );

      setSuccessMsg("התחברת בהצלחה! מועבר לקטלוג החנות...");
      window.dispatchEvent(new Event("auth-changed"));

      setTimeout(() => {
        router.push("/");
      }, 800);
    } catch (err: any) {
      setError(err.message || "אירעה שגיאה בעת ההתחברות");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-xl shadow-brand-500/20 mb-4 border border-brand-400/30">
            <span className="text-3xl">🛍️</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            E-Commerce Platform
          </h1>
          <p className="text-xs text-indigo-200/80 mt-1.5 font-mono">
            אימות כניסה מאובטח • Stateless JWT • Apache Kafka
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl p-8 text-right">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center justify-between">
              <span>התחברות לחשבון</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono">
                Sign In
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              הזן את פרטיך כדי להיכנס לקטלוג המוצרים ולבצע רכישות
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-2xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                כתובת אימייל
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  dir="ltr"
                  required
                  className="w-full pr-10 pl-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-white placeholder-slate-500 text-left transition"
                  disabled={loading}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute top-3.5 right-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                סיסמה
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  required
                  className="w-full pr-10 pl-10 py-3 rounded-xl bg-slate-800/80 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-white placeholder-slate-500 text-left transition"
                  disabled={loading}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute top-3.5 right-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3.5 left-3 text-slate-400 hover:text-slate-200 focus:outline-none"
                  aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>מאמת פרטים...</span>
                </>
              ) : (
                "התחבר לחנות"
              )}
            </button>
          </form>

          {/* Switcher to Register */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
            עדיין אין לך חשבון?{" "}
            <Link
              href="/register"
              className="font-bold text-brand-400 hover:text-brand-300 hover:underline mr-1"
            >
              צור חשבון חדש כאן
            </Link>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>הצפנת BCrypt • MongoDB Atlas • ניהול אירועים ב-Kafka</span>
          </div>
        </div>
      </div>
    </div>
  );
}
