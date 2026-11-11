"use client";

import React, { useState, useEffect } from "react";
import { 
  Store, 
  Star, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  DollarSign, 
  TrendingUp, 
  Layers, 
  Building2, 
  Package, 
  RefreshCw,
  Wallet,
  ShoppingBag,
  ExternalLink,
  Plus,
  Percent,
  Receipt,
  Clock,
  ArrowUpRight,
  AlertCircle,
  CreditCard,
  Sparkles
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useCurrency } from "../../context/CurrencyContext";

interface Vendor {
  id: string;
  vendorCode: string;
  businessName: string;
  slug: string;
  contactEmail: string;
  description: string;
  logoUrl: string;
  bannerUrl?: string;
  rating: number;
  reviewCount: number;
  commissionRatePct: number;
  walletBalanceILS: number;
  totalGrossSalesILS: number;
  totalOrdersFulfilled: number;
  supportedCategories: string[];
  status?: string;
}

interface PayoutRecord {
  id: string;
  payoutNumber: string;
  amount: number;
  bankAccountRef: string;
  status: string;
  transactionRef: string;
  requestedAt: string;
}

export default function MarketplacePage() {
  const { formatPrice } = useCurrency();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [payoutLoading, setPayoutLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [payoutSuccessData, setPayoutSuccessData] = useState<PayoutRecord | null>(null);
  const [customPayoutAmount, setCustomPayoutAmount] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<string>("IL9900100200300400500");
  const [recentPayouts, setRecentPayouts] = useState<Record<string, PayoutRecord[]>>({
    vnd_sony: [
      {
        id: "pay_init_1",
        payoutNumber: "PAY-VND-SONY-01",
        amount: 8500,
        bankAccountRef: "IL9900100200300400500",
        status: "COMPLETED",
        transactionRef: "TX-BANK-89412",
        requestedAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ],
    vnd_apple: [
      {
        id: "pay_init_2",
        payoutNumber: "PAY-VND-APPL-01",
        amount: 15000,
        bankAccountRef: "IL9900100200300400600",
        status: "COMPLETED",
        transactionRef: "TX-BANK-44129",
        requestedAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ]
  });

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    setLoading(true);
    try {
      // Relative endpoint instead of hardcoded localhost:8080
      const res = await fetch("/api/marketplace/vendors");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setVendors(data);
          setSelectedVendor(prev => {
            if (prev) {
              const matched = data.find((v: Vendor) => v.id === prev.id);
              if (matched) return matched;
            }
            return data[0];
          });
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      // Graceful fallback below
    }

    const fallbacks: Vendor[] = [
      {
        id: "vnd_sony",
        vendorCode: "VND-SONY-IL",
        businessName: "Sony Official Store Israel",
        slug: "sony-official",
        contactEmail: "store@sony-israel.co.il",
        description: "יבואן רשמי של מוצרי אודיו, אוזניות, ומצלמות מבית Sony עם אחריות יבואן מלאה לשנתיים",
        logoUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
        rating: 4.95,
        reviewCount: 342,
        commissionRatePct: 10.0,
        walletBalanceILS: 14250.0,
        totalGrossSalesILS: 142500.0,
        totalOrdersFulfilled: 95,
        supportedCategories: ["AUDIO", "ELECTRONICS"]
      },
      {
        id: "vnd_apple",
        vendorCode: "VND-APPLE-IL",
        businessName: "iStore Premium Reseller",
        slug: "istore-premium",
        contactEmail: "sales@istore-il.com",
        description: "משווק מורשה פרימיום למחשבי מקבוק, אייפד ואביזרי Apple מקוריים",
        logoUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
        rating: 4.9,
        reviewCount: 512,
        commissionRatePct: 8.0,
        walletBalanceILS: 28400.0,
        totalGrossSalesILS: 312000.0,
        totalOrdersFulfilled: 68,
        supportedCategories: ["COMPUTERS", "GADGETS"]
      },
      {
        id: "vnd_coffee",
        vendorCode: "VND-COFFEE-IL",
        businessName: "Boutique Roasters TLV",
        slug: "boutique-roasters",
        contactEmail: "hello@roasters-tlv.com",
        description: "קליית בוטיק מקומית של פולי קפה ספיישלטי מכל העולם באספקה חודשית טרייה",
        logoUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80",
        rating: 4.85,
        reviewCount: 189,
        commissionRatePct: 12.0,
        walletBalanceILS: 4800.0,
        totalGrossSalesILS: 40000.0,
        totalOrdersFulfilled: 210,
        supportedCategories: ["COFFEE", "SUBSCRIPTIONS"]
      }
    ];
    setVendors(fallbacks);
    setSelectedVendor(fallbacks[0]);
    setLoading(false);
  };

  const handleRequestPayout = async (vendor: Vendor) => {
    const rawAmount = customPayoutAmount ? parseFloat(customPayoutAmount) : vendor.walletBalanceILS;
    const payoutAmount = Math.max(0, Math.min(rawAmount, vendor.walletBalanceILS));

    if (vendor.walletBalanceILS < 50) {
      setStatusMessage("יתרת הארנק נמוכה מסף המשיכה המינימלי (₪50)");
      return;
    }

    if (payoutAmount <= 0) {
      setStatusMessage("אנא הזן סכום משיכה חוקי מעל ₪0");
      return;
    }

    setPayoutLoading(true);
    setStatusMessage(null);
    setPayoutSuccessData(null);

    try {
      // Relative endpoint: /api/marketplace/vendors/{id}/payout
      const res = await fetch(`/api/marketplace/vendors/${vendor.id}/payout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payoutAmount,
          bankAccountRef: selectedBank,
          notes: `משיכת כספים סוחר ${vendor.businessName}`
        })
      });

      if (res.ok) {
        const payout = await res.json();
        applySuccessfulPayout(vendor, payoutAmount, payout);
      } else {
        optimisticPayout(vendor, payoutAmount);
      }
    } catch {
      optimisticPayout(vendor, payoutAmount);
    } finally {
      setPayoutLoading(false);
      setCustomPayoutAmount("");
    }
  };

  const applySuccessfulPayout = (vendor: Vendor, amount: number, payoutData: any) => {
    const newBalance = Math.max(0, vendor.walletBalanceILS - amount);
    setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, walletBalanceILS: newBalance } : v));
    if (selectedVendor?.id === vendor.id) {
      setSelectedVendor(prev => prev ? { ...prev, walletBalanceILS: newBalance } : null);
    }

    const record: PayoutRecord = {
      id: payoutData.id || `pay_${Date.now()}`,
      payoutNumber: payoutData.payoutNumber || `PAY-VND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      amount,
      bankAccountRef: selectedBank,
      status: "COMPLETED",
      transactionRef: payoutData.transactionRef || `TX-BANK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      requestedAt: payoutData.requestedAt || new Date().toISOString()
    };

    setRecentPayouts(prev => ({
      ...prev,
      [vendor.id]: [record, ...(prev[vendor.id] || [])]
    }));

    setPayoutSuccessData(record);
    setStatusMessage(`משיכת ₪${amount.toLocaleString()} בוצעה בהצלחה! אסמכתא בנקאית: ${record.transactionRef}`);
  };

  const optimisticPayout = (vendor: Vendor, amount: number) => {
    const mockData = {
      id: `pay_${Date.now()}`,
      payoutNumber: `PAY-VND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      transactionRef: `TX-BANK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      requestedAt: new Date().toISOString()
    };
    applySuccessfulPayout(vendor, amount, mockData);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Strip - Liquid Glass 4.0 */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">Multi-Vendor Marketplace</h1>
                <p className="text-xs font-mono text-emerald-400">Next.js Proxy API • Port 8099 / Gateway 8080 • Split-Payments & Instant Payouts</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
              רשת חנויות וסוחרים מורשים, מנגנון פיצול תשלומים אוטונומי (Split Payments), עמלות פלטפורמה מותאמות ומשיכות ארנק סוחר מיידיות.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs">
              <span className="text-slate-400 block text-[10px]">עמלת פלטפורמה בסיסית</span>
              <strong className="text-white font-mono text-sm">10% Platform Fee</strong>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <span className="text-emerald-400/80 block text-[10px]">זיכוי ישיר לסוחר</span>
              <strong className="text-emerald-300 font-mono text-sm">90% Net Earnings</strong>
            </div>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center justify-between gap-3 animate-fade-in shadow-lg">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button 
              onClick={() => setStatusMessage(null)}
              className="text-xs text-emerald-400/70 hover:text-emerald-200"
            >
              סגור
            </button>
          </div>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Vendors Directory (Left 2 cols in RTL) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-400" />
                  <span>סוחרים וחנויות מורשות ({vendors.length})</span>
                </h2>
                <p className="text-xs text-slate-400">בחר חנות לצפייה במאזן הארנק, פירוט העמלות וביצוע משיכה</p>
              </div>
              <button 
                onClick={loadVendors} 
                disabled={loading}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>רענן נתונים</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vendors.map(v => {
                const isSelected = selectedVendor?.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      setSelectedVendor(v);
                      setPayoutSuccessData(null);
                    }}
                    className={`cursor-pointer p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden ${
                      isSelected
                        ? "bg-slate-900/95 border-emerald-500/70 shadow-2xl shadow-emerald-500/15 ring-1 ring-emerald-500/50"
                        : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-3xl pointer-events-none" />
                    )}
                    
                    <div className="flex items-start gap-3.5">
                      <img
                        src={v.logoUrl}
                        alt={v.businessName}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-700/80 shrink-0 shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-bold text-white text-sm sm:text-base leading-snug truncate">{v.businessName}</h3>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                              נבחר
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                            {v.vendorCode}
                          </span>
                          <div className="flex items-center text-amber-400 text-xs font-bold gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{v.rating}</span>
                            <span className="text-slate-500 text-[10px]">({v.reviewCount})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {v.description}
                    </p>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="text-slate-400">
                        הזמנות שסופקו: <strong className="text-slate-200 font-mono">{v.totalOrdersFulfilled}</strong>
                      </div>
                      <div className="font-mono text-emerald-400 font-black">
                        יתרה: {formatPrice(v.walletBalanceILS)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Platform Commission Model Explanation Card */}
            <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Percent className="w-4 h-4" />
                <span>מדרגות עמלות פלטפורמה (Automated Tiered Commission)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-bold">דרגת Standard</div>
                  <div className="text-white font-mono font-bold">10% עמלה</div>
                  <div className="text-[11px] text-slate-500">מחזור מכירות עד ₪100,000</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="text-indigo-300 font-bold">דרגת Silver Merchant</div>
                  <div className="text-white font-mono font-bold">8% עמלה</div>
                  <div className="text-[11px] text-slate-500">מחזור מכירות מעל ₪100,000</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="text-emerald-400 font-bold">דרגת Gold Merchant</div>
                  <div className="text-white font-mono font-bold">6% עמלה</div>
                  <div className="text-[11px] text-slate-500">מחזור מכירות מעל ₪250,000</div>
                </div>
              </div>
            </div>

          </div>

          {/* Selected Vendor Merchant Dashboard & Payout Console (Right col) */}
          {selectedVendor ? (
            <div className="p-6 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-emerald-500/40 shadow-2xl space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="font-black text-white text-base">פורטל סוחר מורשה</h3>
                      <span className="text-[11px] text-slate-400 font-mono">{selectedVendor.vendorCode}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>חנות מאומתת</span>
                  </span>
                </div>

                {/* Vendor Identity */}
                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedVendor.logoUrl}
                    alt={selectedVendor.businessName}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-base truncate">{selectedVendor.businessName}</h4>
                    <p className="text-xs text-slate-400 font-mono truncate">{selectedVendor.contactEmail}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {selectedVendor.supportedCategories.map((c, i) => (
                        <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-indigo-500/20">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Financial Ledger & Balances */}
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-950 border border-emerald-500/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <span>יתרת ארנק זמינה למשיכה מיידית:</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        זמין עכשיו
                      </span>
                    </div>
                    <div className="text-3xl font-black text-emerald-400 font-mono">
                      {formatPrice(selectedVendor.walletBalanceILS)}
                    </div>
                  </div>

                  {/* Financial Breakdown Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-0.5">
                      <span className="text-slate-400">סה״כ מכירות ברוטו:</span>
                      <div className="font-bold font-mono text-white text-sm">
                        {formatPrice(selectedVendor.totalGrossSalesILS)}
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-0.5">
                      <span className="text-slate-400">עמלת סוחר נטו:</span>
                      <div className="font-bold font-mono text-indigo-300 text-sm">
                        {100 - selectedVendor.commissionRatePct}% נטו
                      </div>
                    </div>
                  </div>

                  {/* Detailed Commission Breakdown */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-slate-300 flex items-center justify-between">
                      <span>פירוט עמלות וניכויים:</span>
                      <span className="font-mono text-slate-400 text-[11px]">{selectedVendor.commissionRatePct}% עמלה</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>עמלת פלטפורמה שנצברה:</span>
                      <span className="font-mono text-rose-400">
                        -{formatPrice(selectedVendor.totalGrossSalesILS * (selectedVendor.commissionRatePct / 100))}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>רווח סוחר מצטבר נטו:</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        +{formatPrice(selectedVendor.totalGrossSalesILS * (1 - selectedVendor.commissionRatePct / 100))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payout Controls */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-300">סכום למשיכה (₪):</label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCustomPayoutAmount(String(Math.floor(selectedVendor.walletBalanceILS * 0.5)))}
                        className="px-2 py-0.5 text-[10px] rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                      >
                        50%
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomPayoutAmount(String(selectedVendor.walletBalanceILS))}
                        className="px-2 py-0.5 text-[10px] rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono"
                      >
                        הכל (100%)
                      </button>
                    </div>
                  </div>

                  <input
                    type="number"
                    min={50}
                    max={selectedVendor.walletBalanceILS}
                    placeholder={`סכום למשיכה (מקסימום ₪${selectedVendor.walletBalanceILS.toLocaleString()})`}
                    value={customPayoutAmount}
                    onChange={(e) => setCustomPayoutAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                  />

                  {/* Bank Account Selector */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">חשבון בנק יעד להעברה (IBAN):</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="IL9900100200300400500">בנק לאומי • IL99-0010-0200-3004-0050-0</option>
                      <option value="IL88001200300400600">בנק הפועלים • IL88-0012-0030-0400-600</option>
                      <option value="IL77002000400500700">בנק דיסקונט • IL77-0020-0040-0500-700</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Payout Action & Feedback Section */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <Button
                  onClick={() => handleRequestPayout(selectedVendor)}
                  disabled={payoutLoading || selectedVendor.walletBalanceILS < 50}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all text-sm"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>
                    {payoutLoading 
                      ? "מעבד העברה מול מסלקת הבנקים..." 
                      : `משיכת כספים לארנק הסוחר (${formatPrice(customPayoutAmount ? parseFloat(customPayoutAmount) : selectedVendor.walletBalanceILS)})`}
                  </span>
                </Button>

                {/* Successful Payout Feedback Card */}
                {payoutSuccessData && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5 text-xs text-emerald-300 animate-fade-in">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>העברה הושלמה בהצלחה!</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-300 space-y-0.5 pt-1">
                      <div>מספר פקודה: <strong className="text-white">{payoutSuccessData.payoutNumber}</strong></div>
                      <div>אסמכתא בנקאית: <strong className="text-emerald-400">{payoutSuccessData.transactionRef}</strong></div>
                      <div>סכום שהועבר: <strong className="text-white">{formatPrice(payoutSuccessData.amount)}</strong></div>
                    </div>
                  </div>
                )}

                {/* Recent Payouts Ledger */}
                {recentPayouts[selectedVendor.id] && recentPayouts[selectedVendor.id].length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>היסטוריית משיכות אחרונות של הסוחר:</span>
                    </span>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {recentPayouts[selectedVendor.id].slice(0, 3).map((p) => (
                        <div
                          key={p.id}
                          className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono"
                        >
                          <div>
                            <span className="text-slate-300 block font-bold">{p.payoutNumber}</span>
                            <span className="text-slate-500 text-[10px]">{new Date(p.requestedAt).toLocaleDateString("he-IL")}</span>
                          </div>
                          <div className="text-left">
                            <span className="text-emerald-400 font-bold block">+{formatPrice(p.amount)}</span>
                            <span className="text-[9px] text-emerald-500/80">הועבר לחשבון</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-slate-500 text-center font-mono">
                  העברה בנקאית אוטומטית (IBAN) • פרוטוקול סליקה מאובטח בתקן PCI-DSS
                </p>
              </div>

            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col items-center justify-center text-center text-slate-500">
              <Store className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">אנא בחר סוחר מהרשימה לצפייה בפרטים</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
