"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User, Eye, EyeOff, Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "login",
  onSuccess,
}) => {
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (tab === "register") {
        if (!fullName.trim() || !email.trim() || !password.trim()) {
          throw new Error("נא למלא את כל השדות הדרושים");
        }
        if (password.length < 6) {
          throw new Error("הסיסמה חייבת להכיל לפחות 6 תווים");
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || data.message || "שגיאה ברישום החשבון");
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

        setSuccessMsg("נרשמת בהצלחה! האירוע שודר ב-Kafka והודעת SSE נשלחה.");
        window.dispatchEvent(new Event("auth-changed"));

        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
      } else {
        if (!email.trim() || !password.trim()) {
          throw new Error("נא להזין דוא\"ל וסיסמה");
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

        setSuccessMsg("התחברת בהצלחה! ברוך שובך.");
        window.dispatchEvent(new Event("auth-changed"));

        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || "אירעה שגיאה בביצוע הפעולה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-2xl overflow-hidden text-right">
        {/* Top Gradient Banner */}
        <div className="h-2.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 text-slate-400 hover:text-slate-600 transition p-1.5 rounded-full hover:bg-slate-100"
          aria-label="סגור"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-7">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg mb-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {tab === "login" ? "ברוך שובך!" : "יצירת חשבון חדש"}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              אימות מאובטח JWT • שמירה ב-MongoDB Atlas • סנכרון Kafka
            </p>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 text-sm font-bold rounded-xl transition ${
                tab === "login"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              התחברות
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 text-sm font-bold rounded-xl transition ${
                tab === "register"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              הרשמה
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  שם מלא
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ישראל ישראלי"
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-slate-900 placeholder-slate-400"
                    disabled={loading}
                  />
                  <User className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                כתובת אימייל
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  dir="ltr"
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-slate-900 placeholder-slate-400 text-left"
                  disabled={loading}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                סיסמה
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-slate-900 placeholder-slate-400 text-left"
                  disabled={loading}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3 left-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {tab === "register" && (
                <span className="text-[11px] text-slate-500 mt-1 block">
                  לפחות 6 תווים
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>מעבד בקשה...</span>
                </>
              ) : tab === "login" ? (
                "התחבר עכשיו"
              ) : (
                "צור חשבון והתחל"
              )}
            </button>
          </form>

          {/* Footer switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            {tab === "login" ? (
              <p>
                עדיין אין לך חשבון?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setTab("register");
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-brand-600 hover:underline"
                >
                  הירשם כאן
                </button>
              </p>
            ) : (
              <p>
                כבר רשום במערכת?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setTab("login");
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-brand-600 hover:underline"
                >
                  התחבר כאן
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
