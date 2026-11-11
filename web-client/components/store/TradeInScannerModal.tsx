"use client";

import React, { useState, useEffect } from "react";
import {
  Recycle,
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  X,
  ShieldCheck,
  Tag,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  ShoppingBag,
  Zap,
  Check,
  AlertCircle,
  Copy,
} from "lucide-react";
import { Button } from "../ui/Button";
import { useCurrency } from "../../context/CurrencyContext";

interface TradeInAppraisalResult {
  id: string;
  appraisalCode: string;
  deviceModel: string;
  deviceCategory: string;
  serialOrImei: string;
  conditionGrade: "MINT_A_PLUS" | "GOOD_A" | "FAIR_B";
  baseMarketValueILS: number;
  approvedCreditILS: number;
  tradeInVoucherCode: string;
  resaleRetention24mPct: number;
  diagnostics: {
    screenIntegrity: string;
    batteryHealthPct: number;
    chassisScore: string;
    cameraLensStatus: string;
  };
}

interface TradeInScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoucherApplied?: (voucherCode: string, creditAmountILS: number) => void;
}

const PRESET_DEVICES = [
  { name: "Apple MacBook Pro 14 M1 Pro (2022)", category: "COMPUTERS", retailILS: 5800 },
  { name: "Apple iPhone 14 Pro Max 256GB", category: "SMARTPHONES", retailILS: 4200 },
  { name: "Sony WH-1000XM4 Wireless Headphones", category: "AUDIO", retailILS: 1190 },
  { name: "Apple iPad Pro 12.9 M2 256GB", category: "TABLETS", retailILS: 4400 },
  { name: "Samsung Galaxy S23 Ultra 512GB", category: "SMARTPHONES", retailILS: 3600 },
  { name: "Apple Watch Ultra 2 GPS + Cellular", category: "SMARTWATCHES", retailILS: 2900 },
];

export const TradeInScannerModal: React.FC<TradeInScannerModalProps> = ({
  isOpen,
  onClose,
  onVoucherApplied,
}) => {
  const { formatPrice } = useCurrency();

  const [selectedDeviceName, setSelectedDeviceName] = useState<string>(PRESET_DEVICES[0].name);
  const [deviceCategory, setDeviceCategory] = useState<string>(PRESET_DEVICES[0].category);
  const [serialImei, setSerialImei] = useState<string>("SN-APL-M1P-88412");
  const [conditionGrade, setConditionGrade] = useState<"MINT_A_PLUS" | "GOOD_A" | "FAIR_B">("MINT_A_PLUS");
  const [photoPreview, setPhotoPreview] = useState<string>(
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80"
  );
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [appraisalResult, setAppraisalResult] = useState<TradeInAppraisalResult | null>(null);
  const [voucherApplied, setVoucherApplied] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  useEffect(() => {
    const dev = PRESET_DEVICES.find((d) => d.name === selectedDeviceName);
    if (dev) {
      setDeviceCategory(dev.category);
    }
  }, [selectedDeviceName]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunAiAppraisal = async () => {
    setIsScanning(true);
    setAppraisalResult(null);
    setVoucherApplied(false);

    // Simulated 4-phase AI Vision diagnostics progression
    const steps = [1, 2, 3, 4];
    for (let i = 0; i < steps.length; i++) {
      setScanStep(steps[i]);
      await new Promise((r) => setTimeout(r, 600));
    }

    const dev = PRESET_DEVICES.find((d) => d.name === selectedDeviceName) || PRESET_DEVICES[0];
    const multiplier =
      conditionGrade === "MINT_A_PLUS" ? 0.6 : conditionGrade === "GOOD_A" ? 0.45 : 0.3;
    const approvedCredit = Math.round(dev.retailILS * multiplier);
    const code = `TRD-IL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newAppraisal: TradeInAppraisalResult = {
      id: `apr_${Date.now()}`,
      appraisalCode: `APR-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      deviceModel: selectedDeviceName,
      deviceCategory,
      serialOrImei: serialImei || "SN-VERIFIED-AI",
      conditionGrade,
      baseMarketValueILS: dev.retailILS,
      approvedCreditILS: approvedCredit,
      tradeInVoucherCode: code,
      resaleRetention24mPct: conditionGrade === "MINT_A_PLUS" ? 78 : conditionGrade === "GOOD_A" ? 65 : 52,
      diagnostics: {
        screenIntegrity:
          conditionGrade === "MINT_A_PLUS"
            ? "מושלם • 0 שריטות (OLED Pixel 100%)"
            : conditionGrade === "GOOD_A"
            ? "מצב טוב • שפשוף מיקרוסקופי בלתי מורגש"
            : "סביר • שריטות שטחיות קלות, תצוגה תקינה",
        batteryHealthPct:
          conditionGrade === "MINT_A_PLUS" ? 96 : conditionGrade === "GOOD_A" ? 87 : 79,
        chassisScore:
          conditionGrade === "MINT_A_PLUS" ? "A+ ללא מעיכות" : conditionGrade === "GOOD_A" ? "A סימני שימוש קלים" : "B שפשופים בפינות",
        cameraLensStatus: "נקי • חיישנים אופטיים תקינים לחלוטין",
      },
    };

    try {
      await fetch("/api/trade-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: "usr_demo",
          deviceModel: selectedDeviceName,
          deviceCategory,
          serialOrImei: serialImei,
          conditionGrade,
          originalRetailPriceILS: dev.retailILS,
        }),
      });
    } catch (e) {
      console.warn("Trade-in backend log error:", e);
    }

    setAppraisalResult(newAppraisal);
    setIsScanning(false);
  };

  const handleApplyVoucherToCart = () => {
    if (!appraisalResult) return;

    try {
      // Store voucher in localStorage for immediate checkout application
      const voucherData = {
        code: appraisalResult.tradeInVoucherCode,
        discountILS: appraisalResult.approvedCreditILS,
        description: `זיכוי טרייד-אין בגין ${appraisalResult.deviceModel}`,
      };
      localStorage.setItem("applied_voucher", JSON.stringify(voucherData));
      window.dispatchEvent(new Event("cart-updated"));
      setVoucherApplied(true);
      onVoucherApplied?.(appraisalResult.tradeInVoucherCode, appraisalResult.approvedCreditILS);
    } catch (e) {
      console.error("Failed to apply voucher to cart:", e);
    }
  };

  const copyVoucherCode = () => {
    if (!appraisalResult) return;
    navigator.clipboard.writeText(appraisalResult.tradeInVoucherCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-fade-in" dir="rtl">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-emerald-500/40 text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-emerald-950/40 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">
                  סורק ושמאי טרייד-אין AI (AI Visual Condition Appraisal)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  Gemini Vision 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                הערכת שווי אופטית מיידית למכשירים ישנים ושובר זיכוי מיידי בעגלת הקניות
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Top Form & Scanner Viewport */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {/* Left: Device Photo & Animated Laser Viewport */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex items-center justify-center group">
                <img
                  src={photoPreview}
                  alt="Device for Appraisal"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                />

                {/* Laser scan line overlay when scanning */}
                {isScanning && (
                  <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none overflow-hidden">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-pulse absolute top-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-2 right-2 bg-slate-950/90 border border-emerald-500/40 px-3 py-1 rounded-full text-[11px] font-mono text-emerald-300">
                      סורק פגמים וחיישנים...
                    </div>
                  </div>
                )}

                <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                  {deviceCategory} • תמונה נסרקת
                </div>
              </div>

              {/* Upload or Re-take Photo */}
              <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold cursor-pointer transition text-slate-200">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>העלה תצלום מכשיר (מסך / גב)</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            {/* Right: Device Details Selection */}
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  בחר דגם מכשיר לטרייד-אין:
                </label>
                <select
                  value={selectedDeviceName}
                  onChange={(e) => setSelectedDeviceName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:border-emerald-500 focus:outline-none"
                >
                  {PRESET_DEVICES.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name} (שווי שוק: {formatPrice(d.retailILS)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  מספר סידורי / IMEI (אופציונלי):
                </label>
                <input
                  type="text"
                  value={serialImei}
                  onChange={(e) => setSerialImei(e.target.value)}
                  placeholder="SN-12345678"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Condition Grade Selection (Like New / Good / Fair) */}
              <div>
                <label className="font-bold text-slate-300 block mb-1.5">
                  דירוג מצב פיזי ראשוני (Condition Grade):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      key: "MINT_A_PLUS",
                      title: "Like New (כמו חדש)",
                      sub: "ללא שריטות",
                      ret: "60% שווי",
                    },
                    {
                      key: "GOOD_A",
                      title: "Good (טוב מאוד)",
                      sub: "שפשופים קלים",
                      ret: "45% שווי",
                    },
                    {
                      key: "FAIR_B",
                      title: "Fair (סביר)",
                      sub: "סימני שימוש",
                      ret: "30% שווי",
                    },
                  ].map((grade) => {
                    const active = conditionGrade === grade.key;
                    return (
                      <button
                        key={grade.key}
                        type="button"
                        onClick={() => setConditionGrade(grade.key as any)}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          active
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-md"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        <div className="text-[11px] font-bold">{grade.title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{grade.sub}</div>
                        <div className="text-[10px] font-mono text-emerald-400 mt-0.5">{grade.ret}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Run Appraisal CTA */}
              <Button
                onClick={handleRunAiAppraisal}
                loading={isScanning}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>
                  {isScanning
                    ? scanStep === 1
                      ? "מעבד תמונת מכשיר..."
                      : scanStep === 2
                      ? "סורק תצוגה ושריטות..."
                      : scanStep === 3
                      ? "בודק בריאות סוללה..."
                      : "מחשב שווי שוק..."
                    : "הרץ הערכת שווי AI והפק שובר זיכוי"}
                </span>
              </Button>
            </div>
          </div>

          {/* Results Card after Appraisal */}
          {appraisalResult && (
            <div className="p-5 rounded-3xl bg-slate-950 border border-emerald-500/50 shadow-xl space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base">
                      שובר זיכוי טרייד-אין מאושר!
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">
                      מספר שומה: {appraisalResult.appraisalCode} • {appraisalResult.deviceModel}
                    </span>
                  </div>
                </div>

                <div className="text-left font-mono">
                  <span className="text-xs text-slate-400 block">סכום זיכוי מאושר:</span>
                  <span className="text-2xl font-black text-emerald-400">
                    {formatPrice(appraisalResult.approvedCreditILS)}
                  </span>
                </div>
              </div>

              {/* AI Diagnostics Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px] block">שלמות תצוגה:</span>
                  <div className="font-bold text-white line-clamp-1">{appraisalResult.diagnostics.screenIntegrity}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px] block">בריאות סוללה (AI):</span>
                  <div className="font-bold font-mono text-emerald-400">
                    {appraisalResult.diagnostics.batteryHealthPct}% קיבולת
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px] block">מצב שלדה ומסגרת:</span>
                  <div className="font-bold text-white">{appraisalResult.diagnostics.chassisScore}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px] block">שימור ערך (24 חודש):</span>
                  <div className="font-bold font-mono text-amber-400">
                    {appraisalResult.resaleRetention24mPct}% שימור
                  </div>
                </div>
              </div>

              {/* Voucher Code & Action Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-right">
                  <span className="text-[11px] text-emerald-300 font-bold block">
                    קוד שובר הזיכוי המאובטח שלך:
                  </span>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="font-mono font-black text-lg text-white bg-slate-950 px-3 py-1 rounded-xl border border-emerald-500/40">
                      {appraisalResult.tradeInVoucherCode}
                    </span>
                    <button
                      onClick={copyVoucherCode}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="העתק קוד שובר"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    onClick={handleApplyVoucherToCart}
                    disabled={voucherApplied}
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                      voucherApplied
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {voucherApplied
                        ? `השובר הוחל על סל הקניות (-${formatPrice(appraisalResult.approvedCreditILS)}) ✓`
                        : `החל שובר זיכוי מיידי על סל הקניות`}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>תוכנית טרייד-אין חוזרת ירוקה • Trade-in Circular Economy</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
          >
            סיום
          </button>
        </div>
      </div>
    </div>
  );
};
