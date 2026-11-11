"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  AlertTriangle,
  Zap,
  Activity,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Cpu,
  Lock,
  Flame,
  Globe,
  Sliders,
  Sparkles,
  Server,
  DollarSign,
  TrendingDown,
  Radio,
} from "lucide-react";

export interface FraudAlertItem {
  assessmentId: string;
  orderId: string;
  customerId: string;
  customerName?: string;
  riskScore: number;
  riskLevel: "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK_BLOCKED";
  decision: "APPROVE" | "HOLD_REVIEW" | "BLOCK";
  signalsChecked: string[];
  triggeredRules: string[];
  totalAmount?: number;
  city?: string;
  ipAddress?: string;
  velocityScore?: number;
  inventoryDepletionWarning?: {
    skuCode: string;
    remainingUnits: number;
    predictedDaysUntilDepletion: number;
  } | null;
  evaluatedAt: string;
}

export interface SimulationResult {
  assessmentId: string;
  orderId: string;
  customerId: string;
  totalAmount: number;
  riskScore: number;
  riskLevel: "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK_BLOCKED";
  decision: "APPROVE" | "HOLD_REVIEW" | "BLOCK";
  signalsChecked: string[];
  triggeredRules: string[];
  inventoryDepletionWarning?: {
    skuCode: string;
    remainingUnits: number;
    predictedDaysUntilDepletion: number;
  } | null;
  evaluatedAt: string;
}

export interface FraudGuardDashboardProps {
  className?: string;
}

export const FraudGuardDashboard: React.FC<FraudGuardDashboardProps> = ({
  className = "",
}) => {
  const [alerts, setAlerts] = useState<FraudAlertItem[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "BLOCK" | "HOLD_REVIEW" | "APPROVE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  // Simulator Form State
  const [simAmount, setSimAmount] = useState<number>(3450);
  const [simCustomerId, setSimCustomerId] = useState<string>("cust_vip_4091");
  const [simCity, setSimCity] = useState<string>("תל אביב-יפו");
  const [simIp, setSimIp] = useState<string>("84.108.201.14");
  const [simVelocity, setSimVelocity] = useState<number>(1);
  const [simCoupon, setSimCoupon] = useState<string>("");
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [dataSource, setDataSource] = useState<string>("initializing");

  // Fetch live alerts
  const fetchAlerts = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/fraud/alerts");
      if (res.ok) {
        const json = await res.json();
        setAlerts(json.alerts || []);
        setDataSource(json.source || "mock_fallback");
      }
    } catch {
      // Keep existing alerts on network error
    } finally {
      setRefreshing(false);
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Run Simulator
  const handleRunAssessment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSimulating(true);
    try {
      const res = await fetch("/api/fraud/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: simCustomerId,
          totalAmount: simAmount,
          city: simCity,
          ipAddress: simIp,
          velocity: simVelocity,
          couponCode: simCoupon || undefined,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setSimulationResult(json.assessment);
      }
    } catch (err) {
      console.error("Simulation assessment failed:", err);
    } finally {
      setSimulating(false);
    }
  };

  // Presets for simulator
  const applyPreset = (preset: "vip" | "bot" | "highTicket" | "torVpn") => {
    if (preset === "vip") {
      setSimAmount(1850);
      setSimCustomerId("cust_vip_7701");
      setSimCity("תל אביב-יפו");
      setSimIp("84.108.201.14");
      setSimVelocity(1);
      setSimCoupon("VIP_SPRING_DISCOUNT");
    } else if (preset === "bot") {
      setSimAmount(240);
      setSimCustomerId("cust_bot_probe_99");
      setSimCity("Unknown");
      setSimIp("194.26.29.112");
      setSimVelocity(16);
      setSimCoupon("BRUTE_CRACK_001");
    } else if (preset === "highTicket") {
      setSimAmount(32500);
      setSimCustomerId("cust_guest_881");
      setSimCity("אילת");
      setSimIp("212.179.33.10");
      setSimVelocity(4);
      setSimCoupon("");
    } else if (preset === "torVpn") {
      setSimAmount(14200);
      setSimCustomerId("cust_vpn_901");
      setSimCity("Tor Exit Node (Amsterdam)");
      setSimIp("185.220.101.42");
      setSimVelocity(8);
      setSimCoupon("");
    }
  };

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesFilter =
        selectedFilter === "ALL" || alert.decision === selectedFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        alert.orderId.toLowerCase().includes(query) ||
        alert.customerId.toLowerCase().includes(query) ||
        (alert.customerName && alert.customerName.toLowerCase().includes(query)) ||
        (alert.ipAddress && alert.ipAddress.includes(query)) ||
        alert.triggeredRules.some((r) => r.toLowerCase().includes(query));

      return matchesFilter && matchesQuery;
    });
  }, [alerts, selectedFilter, searchQuery]);

  // Aggregate stats
  const totalCount = alerts.length || 1;
  const blockedCount = alerts.filter((a) => a.decision === "BLOCK").length;
  const holdCount = alerts.filter((a) => a.decision === "HOLD_REVIEW").length;
  const approvedCount = alerts.filter((a) => a.decision === "APPROVE").length;
  const blockRate = ((blockedCount / totalCount) * 100).toFixed(1);
  const avgRiskScore = Math.round(
    alerts.reduce((acc, a) => acc + (a.riskScore || 0), 0) / totalCount
  );

  return (
    <div
      className={`w-full space-y-6 text-slate-800 dark:text-slate-100 ${className}`}
      dir="rtl"
      lang="he"
    >
      {/* Top Banner / Liquid Glass Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 liquid-glass-surface bg-gradient-to-br from-slate-900/95 via-indigo-950/70 to-slate-950/95 border border-indigo-500/30 shadow-2xl backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>מערכת SAGA Pre-Capture פעילה</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-800/80 text-amber-300 border border-amber-500/20">
                <Cpu className="w-3 h-3 text-amber-400" />
                <span>Port 8096 • Java 21 Virtual Threads</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-800/80 text-indigo-300 border border-indigo-500/20">
                <Server className="w-3 h-3 text-indigo-400" />
                <span>מקור נתונים: {dataSource === "live_service" ? "Microservice Live" : "Fallback Emulator"}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
              <span>SAGA Pre-Capture Fraud Risk & Security Intelligence</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              הערכת סיכוני הונאה סינכרונית לפני חיוב כרטיסי אשראי (Pre-Capture) בתוך תהליך ה-SAGA.
              כולל זיהוי חריגות מהירות (Velocity Anomaly), זיהוי בוטים, וסימולטור הערכת סיכון מבוסס AI.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchAlerts}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 font-bold text-xs flex items-center gap-2 transition backdrop-blur-md shadow-lg active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "מרענן נתונים..." : "רענן נתונים חיים"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards: Security Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Fraud Block Rate */}
        <div className="p-5 rounded-2xl liquid-card bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">שיעור בלימת הונאות (Block Rate)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{blockRate}%</span>
            <span className="text-xs font-bold text-rose-500 flex items-center gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{blockedCount} עסקאות נחסמו</span>
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 dark:text-slate-500 flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
            <span>מניעת נזק כספי</span>
            <strong className="text-emerald-500 font-mono">₪142,850+</strong>
          </div>
        </div>

        {/* Metric 2: Risk Score Distribution Gauge */}
        <div className="p-5 rounded-2xl liquid-card bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">מדד סיכון ממוצע (0-100)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-3xl font-black text-amber-500 font-mono">{avgRiskScore}</span>
              <span className="text-[11px] font-bold text-slate-400">סף חסימה: 70+</span>
            </div>
            {/* Visual Gauge Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
              <div className="bg-emerald-500 h-full w-[40%]" title="Low Risk (0-39)" />
              <div className="bg-amber-500 h-full w-[30%]" title="Medium Risk (40-69)" />
              <div className="bg-rose-500 h-full w-[30%]" title="High Risk (70-100)" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 dark:text-slate-500 flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
            <span>רמת בטיחות כללית</span>
            <strong className="text-emerald-500 font-bold">תקינה (LOW_RISK)</strong>
          </div>
        </div>

        {/* Metric 3: Velocity Anomalies */}
        <div className="p-5 rounded-2xl liquid-card bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">אנומליות מהירות (Redis Sliding-Window)</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">14 req/m</span>
            <span className="text-xs font-bold text-indigo-400">חסימת פרץ</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 dark:text-slate-500 flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
            <span>התקפות בוטים שנוטרלו</span>
            <strong className="text-indigo-400 font-mono">19 נסיונות</strong>
          </div>
        </div>

        {/* Metric 4: SAGA Pre-Capture Latency */}
        <div className="p-5 rounded-2xl liquid-card bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">זמן תגובה Pre-Capture (P95)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-500 font-mono">3.8ms</span>
            <span className="text-xs font-bold text-slate-400 font-mono">Zero Lag</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 dark:text-slate-500 flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
            <span>סנכרון Kafka Outbox</span>
            <strong className="text-emerald-500 font-bold">אטומי 100%</strong>
          </div>
        </div>
      </div>

      {/* Simulator Section: Interactive Pre-Capture Fraud Assessment Simulator */}
      <div className="rounded-3xl liquid-glass-surface bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Pre-Capture Simulator</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              סימולטור הערכת סיכון מוקדמת (Pre-Capture Fraud Simulator)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              בדוק בזמן אמת כיצד מנוע ה-AI מקבל החלטות SAGA (אישור, המתנה לבדיקה, או בלימה מיידית) על פי פרמטרי הזמנה שונים.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400">תרחישים מוכנים:</span>
            <button
              type="button"
              onClick={() => applyPreset("vip")}
              className="px-2.5 py-1 text-xs rounded-xl font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition"
            >
              לקוח VIP תקין
            </button>
            <button
              type="button"
              onClick={() => applyPreset("bot")}
              className="px-2.5 py-1 text-xs rounded-xl font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 hover:bg-rose-100 transition"
            >
              מתקפת בוט מהירה
            </button>
            <button
              type="button"
              onClick={() => applyPreset("highTicket")}
              className="px-2.5 py-1 text-xs rounded-xl font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 transition"
            >
              רכישה גבוהה (₪32k)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("torVpn")}
              className="px-2.5 py-1 text-xs rounded-xl font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 hover:bg-purple-100 transition"
            >
              צומת Tor / VPN
            </button>
          </div>
        </div>

        <form onSubmit={handleRunAssessment} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                <span>סכום העסקה (₪)</span>
              </label>
              <input
                type="number"
                value={simAmount}
                onChange={(e) => setSimAmount(Number(e.target.value))}
                min={1}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400">חריגת סכום גבוה מופעלת מעל ₪25,000</span>
            </div>

            {/* Velocity */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>מהירות עסקאות (שעה אחרונה)</span>
              </label>
              <input
                type="number"
                value={simVelocity}
                onChange={(e) => setSimVelocity(Number(e.target.value))}
                min={1}
                max={50}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400">חריגת מהירות מתחילה מ-3 ומעלה (Rate-Limit)</span>
            </div>

            {/* IP Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <span>כתובת IP של המשתמש</span>
              </label>
              <input
                type="text"
                value={simIp}
                onChange={(e) => setSimIp(e.target.value)}
                placeholder="למשל 84.108.201.14 או 185.220.101.42"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400">בדיקת רשימות שחורות, Tor Exit Nodes ו-Datacenter Proxies</span>
            </div>

            {/* Customer ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>מזהה לקוח (Customer ID)</span>
              </label>
              <input
                type="text"
                value={simCustomerId}
                onChange={(e) => setSimCustomerId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-500" />
                <span>עיר כתובת למשלוח</span>
              </label>
              <input
                type="text"
                value={simCity}
                onChange={(e) => setSimCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Coupon Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>קוד קופון (Coupon)</span>
              </label>
              <input
                type="text"
                value={simCoupon}
                onChange={(e) => setSimCoupon(e.target.value)}
                placeholder="נסה BRUTE_FORCE לבדיקת אנומליה"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={simulating}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-2.5 shadow-lg shadow-amber-500/20 active:scale-95 transition disabled:opacity-50"
            >
              {simulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>מעריך סיכונים במנוע SAGA...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>הרץ הערכת סיכון מוקדמת (Evaluate Pre-Capture)</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Simulator Verdict / Assessment Result Card */}
        {simulationResult && (
          <div
            className={`mt-6 p-6 rounded-2xl border transition-all ${
              simulationResult.decision === "BLOCK"
                ? "bg-rose-500/10 border-rose-500/40 text-rose-900 dark:text-rose-200"
                : simulationResult.decision === "HOLD_REVIEW"
                ? "bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-200"
                : "bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-current/20 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    simulationResult.decision === "BLOCK"
                      ? "bg-rose-600 text-white"
                      : simulationResult.decision === "HOLD_REVIEW"
                      ? "bg-amber-600 text-white"
                      : "bg-emerald-600 text-white"
                  }`}
                >
                  {simulationResult.decision === "BLOCK" ? (
                    <XCircle className="w-7 h-7" />
                  ) : simulationResult.decision === "HOLD_REVIEW" ? (
                    <AlertTriangle className="w-7 h-7" />
                  ) : (
                    <CheckCircle2 className="w-7 h-7" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      החלטת מנוע SAGA:
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-black uppercase ${
                        simulationResult.decision === "BLOCK"
                          ? "bg-rose-600 text-white"
                          : simulationResult.decision === "HOLD_REVIEW"
                          ? "bg-amber-600 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {simulationResult.decision === "BLOCK"
                        ? "עסקה נחסמה (BLOCK)"
                        : simulationResult.decision === "HOLD_REVIEW"
                        ? "השהייה לבדיקה ידנית (HOLD_REVIEW)"
                        : "אושרה לחיוב מיידי (APPROVE)"}
                    </span>
                  </div>

                  <p className="text-xs opacity-80 mt-1">
                    מזהה הערכה: <code className="font-mono font-bold">{simulationResult.assessmentId}</code> •
                    זמן הערכה: {new Date(simulationResult.evaluatedAt).toLocaleTimeString("he-IL")}
                  </p>
                </div>
              </div>

              {/* Gauge Score */}
              <div className="flex items-center gap-3 bg-white/40 dark:bg-slate-900/40 px-4 py-2 rounded-2xl border border-current/20">
                <div className="text-left font-mono">
                  <div className="text-[11px] font-bold uppercase">Risk Score</div>
                  <div className="text-2xl font-black">{simulationResult.riskScore} / 100</div>
                </div>
                <div
                  className={`w-4 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex flex-col-reverse`}
                >
                  <div
                    style={{ height: `${simulationResult.riskScore}%` }}
                    className={`w-full ${
                      simulationResult.riskScore >= 70
                        ? "bg-rose-600"
                        : simulationResult.riskScore >= 40
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* SAGA Step Guidance */}
            <div className="mt-4 p-3 rounded-xl bg-white/60 dark:bg-slate-950/60 border border-current/20 text-xs flex items-center justify-between">
              <span className="font-bold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-500" />
                <span>פעולת SAGA מתוזמנת:</span>
              </span>
              <span className="font-mono font-black">
                {simulationResult.decision === "BLOCK"
                  ? "SAGA Compensation Triggered -> Stock Reservation Rolled Back"
                  : simulationResult.decision === "HOLD_REVIEW"
                  ? "SAGA Suspended -> Escalated to HITL Security Review"
                  : "Proceeding to Step 3: PaymentCapture (Port 8083)"}
              </span>
            </div>

            {/* Rules Triggered & Signals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Triggered Rules */}
              <div className="space-y-1.5">
                <span className="text-xs font-black flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>כללים שהופעלו ({simulationResult.triggeredRules.length}):</span>
                </span>
                {simulationResult.triggeredRules.length === 0 ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    לא הופעלו חוקי סיכון. העסקה עומדת בכל מדדי האמון.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {simulationResult.triggeredRules.map((rule, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                      >
                        {rule}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Verified Signals */}
              <div className="space-y-1.5">
                <span className="text-xs font-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>אותות אבטחה שנבדקו ({simulationResult.signalsChecked.length}):</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {simulationResult.signalsChecked.map((sig, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20"
                    >
                      {sig}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Inventory Warning if present */}
            {simulationResult.inventoryDepletionWarning && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between">
                <span className="font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>אזהרת מלאי קריטי במתקפה:</span>
                </span>
                <span className="font-mono">
                  מק״ט {simulationResult.inventoryDepletionWarning.skuCode} • נותרו{" "}
                  {simulationResult.inventoryDepletionWarning.remainingUnits} יחידות בלבד (צפי אזילה:{" "}
                  {simulationResult.inventoryDepletionWarning.predictedDaysUntilDepletion} ימים)
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Fraud Alerts Feed */}
      <div className="rounded-3xl liquid-glass-surface bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              <span>פיד התראות הונאה חי (`Live Fraud Alerts Feed`)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ניטור רציף של אירועי הערכה מוקדמת, ניסיונות פיצוח וסריקת עסקאות שנבלמו על ידי המערכת.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חיפוש לפי הזמנה, לקוח, IP..."
                className="pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white w-48 sm:w-64 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              {[
                { id: "ALL", label: `הכל (${totalCount})` },
                { id: "BLOCK", label: `נחסמו (${blockedCount})` },
                { id: "HOLD_REVIEW", label: `בבדיקה (${holdCount})` },
                { id: "APPROVE", label: `אושרו (${approvedCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedFilter === tab.id
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts List */}
        {loadingAlerts ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-bold">טוען התראות הונאה ממיקרו-שירות 8096...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <ShieldCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-bold">לא נמצאו התראות התואמות לחיפוש או לסינון הנוכחי</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const isExpanded = expandedAlertId === alert.assessmentId;
              const isBlocked = alert.decision === "BLOCK";
              const isHold = alert.decision === "HOLD_REVIEW";

              return (
                <div
                  key={alert.assessmentId}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                    isBlocked
                      ? "bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/30"
                      : isHold
                      ? "bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/30"
                      : "bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 border-slate-200/80 dark:border-slate-800"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left details */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                          isBlocked
                            ? "bg-rose-500/20 text-rose-500"
                            : isHold
                            ? "bg-amber-500/20 text-amber-500"
                            : "bg-emerald-500/20 text-emerald-500"
                        }`}
                      >
                        {isBlocked ? (
                          <ShieldAlert className="w-5 h-5" />
                        ) : isHold ? (
                          <AlertTriangle className="w-5 h-5" />
                        ) : (
                          <ShieldCheck className="w-5 h-5" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                            הזמנה: {alert.orderId}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isBlocked
                                ? "bg-rose-600 text-white"
                                : isHold
                                ? "bg-amber-600 text-white"
                                : "bg-emerald-600 text-white"
                            }`}
                          >
                            {isBlocked
                              ? "חסום (BLOCKED)"
                              : isHold
                              ? "בבדיקה (HOLD_REVIEW)"
                              : "מאושר (APPROVED)"}
                          </span>
                          {alert.totalAmount && (
                            <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-300">
                              ₪{alert.totalAmount.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span>לקוח: <strong className="text-slate-700 dark:text-slate-300">{alert.customerName || alert.customerId}</strong></span>
                          {alert.ipAddress && (
                            <span className="font-mono">IP: {alert.ipAddress}</span>
                          )}
                          {alert.city && <span>מיקום: {alert.city}</span>}
                          <span>
                            זמן: {new Date(alert.evaluatedAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        {/* Triggered rules preview */}
                        {alert.triggeredRules.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {alert.triggeredRules.map((rule, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                              >
                                {rule}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right score & expand */}
                    <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400">ציון סיכון</div>
                        <div
                          className={`text-xl font-black font-mono ${
                            alert.riskScore >= 70
                              ? "text-rose-500"
                              : alert.riskScore >= 40
                              ? "text-amber-500"
                              : "text-emerald-500"
                          }`}
                        >
                          {alert.riskScore}
                          <span className="text-xs font-normal text-slate-400">/100</span>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setExpandedAlertId(isExpanded ? null : alert.assessmentId)
                        }
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isExpanded ? "סגור פרטים" : "פרטים מלאים"}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable details view */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 space-y-3 text-xs animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                          <div className="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>אותות אבטחה שנבדקו (`Signals Checked`):</span>
                          </div>
                          <ul className="space-y-1 list-disc list-inside font-mono text-[11px] text-slate-600 dark:text-slate-400">
                            {alert.signalsChecked.map((sig, idx) => (
                              <li key={idx}>{sig}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                            <span>מטא-דאטה טכנולוגי SAGA:</span>
                          </div>
                          <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                            <div>מזהה הערכה ייחודי: <code className="font-mono font-bold">{alert.assessmentId}</code></div>
                            <div>מהירות רכישה מחושבת: <strong className="font-mono">{alert.velocityScore || 1} עסקאות / שעה</strong></div>
                            <div>מצב אורקסטרטור: <strong className="text-emerald-500">{isBlocked ? "Outbox Event: FraudFlaggedEvent (Published)" : "Outbox Event: FraudCheckPassedEvent (Published)"}</strong></div>
                          </div>
                        </div>
                      </div>

                      {alert.inventoryDepletionWarning && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            <span>אזהרת מלאי קריטי עבור מוצר בהזמנה זו:</span>
                          </span>
                          <span className="font-mono">
                            מק״ט {alert.inventoryDepletionWarning.skuCode} • נותרו{" "}
                            {alert.inventoryDepletionWarning.remainingUnits} יחידות בלבד
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FraudGuardDashboard;
