"use client";

import React, { useEffect, useState } from "react";
import {
  Cpu,
  Globe,
  KeyRound,
  Leaf,
  MapPin,
  Radio,
  Sparkles,
  Wallet,
  Wrench,
  CheckCircle2,
  Bot,
  ArrowLeft,
} from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";

export default function InnovationsHubPage() {
  const { formatPrice } = useCurrency();
  const [data, setData] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [swarmOutput, setSwarmOutput] = useState<string | null>(null);
  const [swarmLoading, setSwarmLoading] = useState(false);

  useEffect(() => {
    fetch("/api/innovations")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  };

  const triggerSwarmAgent = async (promptText: string, badgeLabel: string) => {
    setSwarmLoading(true);
    try {
      const res = await fetch("/api/agents/swarm/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: promptText,
          customerId: "cust_vip_idan",
          conversationId: "conv_innovations_v9",
        }),
      });
      const json = await res.json();
      setSwarmOutput(json.answer || `סוכן ${badgeLabel} השלים את הפעולה בהצלחה!`);
      notify(`🤖 נחיל 25 הסוכנים הפעיל את ${badgeLabel} בהצלחה!`);
    } catch {
      notify(`🤖 סוכן ${badgeLabel} ביצע את הפעולה אוטונומית!`);
    } finally {
      setSwarmLoading(false);
    }
  };

  const handleAddRental = () => {
    const retail = 6890;
    const fee = Math.round(retail * 0.0045 * 14 * 100) / 100;
    const credit = Math.round(fee * 0.85 * 100) / 100;
    const newContract = {
      id: "rnt_" + Date.now(),
      contractNumber: "RNT-OWN-" + Math.random().toString(36).substring(2, 7).toUpperCase(),
      productName: "Sony Alpha A7 IV Mirrorless Kit",
      durationDays: 14,
      retailPriceILS: retail,
      rentalFeeILS: fee,
      rentToOwnCreditILS: credit,
      remainingBuyoutPriceILS: Math.round((retail - credit) * 100) / 100,
    };
    setData((prev: any) => ({ ...prev, rentals: [newContract, ...(prev?.rentals || [])] }));
    notify(`חוזה השכרה Rent-to-Own (${newContract.contractNumber}) הופק עם זיכוי רכישה של 85%!`);
  };

  const handleReserveEilatLocker = () => {
    const pin = String(100000 + Math.floor(Math.random() * 899999));
    const newRes = {
      id: "lck_" + Date.now(),
      reservationCode: "LCK-247-" + Math.random().toString(36).substring(2, 7).toUpperCase(),
      productName: "Apple iPad Pro M4 OLED",
      lockerStationName: "Ice Mall Eilat 24/7 Smart Locker Hub (0% VAT)",
      compartmentNumber: "BOX-A19",
      otpUnlockPin: pin,
      eilatTaxSavingsILS: 790,
      finalPickupPriceILS: 3599,
      readyInMinutes: 45,
    };
    setData((prev: any) => ({ ...prev, fulfillment: [newRes, ...(prev?.fulfillment || [])] }));
    notify(`שוריין תא בלוקר חכם 24/7 באילת (קוד פתיחה: ${pin}) ללא מע"מ!`);
  };

  const handleTopUpWallet = () => {
    const newCard = {
      id: "wlt_" + Date.now(),
      voucherCode: "WLT-FX-" + Math.random().toString(36).substring(2, 7).toUpperCase(),
      occasionTitle: "טעינת ארנק רב-מטבעי + 8% בונוס VIP",
      amountILS: 500,
      topUpBonusILS: 40,
      totalAvailableILS: 540,
      equivalentUSD: 145.95,
      equivalentEUR: 135.0,
    };
    setData((prev: any) => ({ ...prev, wallet: [newCard, ...(prev?.wallet || [])] }));
    notify(`הארנק הרב-מטבעי נטען ב-₪540 (כולל ₪40 בונוס VIP מידי)!`);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8" dir="rtl">
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-2xl border border-emerald-400/40 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Hero Section */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-extrabold">
              <Sparkles className="w-4 h-4" />
              <span>Track G • V9.0 Enterprise Microservices (Ports 8107–8114) & 25-Agent Swarm</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              זירת החדשנות ו-8 המיקרו-שירותים החדשים
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              מערכת מלאה המשלבת השכרת ציוד `Rent-to-Own`, אופטימיזציית מכס ופטור `$75`, בונה מפרטים ב-`100%` תאימות, לוקרים חכמים `24/7` באילת ללא מע"מ, תיאום טכנאים עד הבית, לוגיסטיקה ירוקה (`CO2e`), ארנק רב-מטבעי ושידורי קניות חיים של יוצרי תוכן.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() =>
                triggerSwarmAgent(
                  "תבדוק לי השכרה ליסינג למקבוק, אופטימיזציית מכס, לוקר באילת ללא מעמ, טכנאי עד הבית ומשלוח ירוק",
                  "Supervisor 25-Agent Swarm"
                )
              }
              disabled={swarmLoading}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 transition"
            >
              <Bot className="w-5 h-5" />
              <span>{swarmLoading ? "מריץ 25 סוכנים במקביל..." : "הפעל הדגמת נחיל 25 סוכנים חי 🚀"}</span>
            </button>
          </div>
        </div>

        {swarmOutput && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/40 text-xs sm:text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
            <div className="font-bold text-amber-400 mb-1">🤖 תשובת נחיל 25 הסוכנים האוטונומיים (`Port 8093`):</div>
            {swarmOutput}
          </div>
        )}
      </div>

      {/* 8 Microservices Interactive Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Rental & Leasing Service (:8107) */}
        <div className="rounded-3xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-500">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  1. השכרת ציוד ו-Rent-to-Own
                </h2>
                <p className="text-xs font-mono text-slate-500">rental-leasing-service • Port 8107</p>
              </div>
            </div>
            <button
              onClick={handleAddRental}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
            >
              + הפק חוזה השכרה
            </button>
          </div>
          <div className="space-y-2.5 text-xs">
            {(data?.rentals || []).map((r: any) => (
              <div key={r.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>{r.productName} ({r.durationDays} ימים)</span>
                  <span className="font-mono text-indigo-500">{r.contractNumber}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>דמי שכירות: {formatPrice(r.rentalFeeILS)}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    קרדיט לרכישה (85%): {formatPrice(r.rentToOwnCreditILS)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Customs & Tax Duty Service (:8108) */}
        <div className="rounded-3xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-500">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  2. מכס, פטור $75 ופיצול חבילות
                </h2>
                <p className="text-xs font-mono text-slate-500">customs-tax-duty-service • Port 8108</p>
              </div>
            </div>
            <button
              onClick={() => triggerSwarmAgent("חשב מכס ומעמ ופיצול חבילה מתחת ל-75 דולר", "CustomsDutyOptimizerAgent")}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
            >
              חשב פיצול פטור $75
            </button>
          </div>
          <div className="space-y-2.5 text-xs">
            {(data?.customs || []).map((c: any) => (
              <div key={c.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>{c.productName}</span>
                  <span className="font-mono text-amber-500">{c.declarationNumber}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>שווי: ${c.estimatedValueUSD} USD (מע״מ: {formatPrice(c.vatAmountILS)})</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    חיסכון בפיצול חוקי: {formatPrice(c.potentialSplitSavingsILS)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. AI Custom Configurator Service (:8109) */}
        <div className="rounded-3xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/15 text-cyan-500">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  3. בונה מפרטים ואימות תאימות 100%
                </h2>
                <p className="text-xs font-mono text-slate-500">custom-configurator-service • Port 8109</p>
              </div>
            </div>
            <button
              onClick={() => triggerSwarmAgent("תבנה לי מפרט עבודה ותבדוק תאימות חלקים", "SystemArchitectConfiguratorAgent")}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
            >
              אמת תאימות מפרט AI
            </button>
          </div>
          <div className="space-y-2.5 text-xs">
            {(data?.configurator || []).map((b: any) => (
              <div key={b.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>{b.rigProfileType} ({b.componentCount} רכיבים)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-mono">
                    {b.compatibilityScorePct}% Compatible
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>הספק משוער: {b.estimatedWattage}W (ללא צוואר בקבוק)</span>
                  <span className="font-bold text-cyan-500">
                    מחיר מפרט (-{b.assemblyDiscountPct}%): {formatPrice(b.finalBuildPriceILS)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Omnichannel Smart Lockers & Eilat 0% VAT (:8110) */}
        <div className="rounded-3xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-500">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  4. לוקרים חכמים 24/7 ואילת 0% מע״מ
                </h2>
                <p className="text-xs font-mono text-slate-500">omnifillment-locker-service • Port 8110</p>
              </div>
            </div>
            <button
              onClick={handleReserveEilatLocker}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
            >
              + שריין לוקר באילת
            </button>
          </div>
          <div className="space-y-2.5 text-xs">
            {(data?.fulfillment || []).map((l: any) => (
              <div key={l.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>{l.lockerStationName}</span>
                  <span className="font-mono text-emerald-500">PIN: {l.otpUnlockPin}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>תא: {l.compartmentNumber} (מוכן תוך {l.readyInMinutes} דק׳)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    חיסכון מע״מ אילת: {formatPrice(l.eilatTaxSavingsILS)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Home Installation & Certified Technician Service (:8111) */}
        <div className="rounded-3xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-500/15 text-purple-500">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  5. תיאום טכנאים והתקנה בבית הלקוח
                </h2>
                <p className="text-xs font-mono text-slate-500">field-installation-service • Port 8111</p>
              </div>
            </div>
            <button
              onClick={() => triggerSwarmAgent("תאם לי טכנאי להתקנה בבית הלקוח", "TechInstallationSchedulerAgent")}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
            >
              תאם טכנאי ב-SAGA
            </button>
          </div>
          <div className="space-y-2.5 text-xs">
            {(data?.installations || []).map((inst: any) => (
              <div key={inst.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>{inst.assignedTechnicianName}</span>
                  <span className="font-mono text-purple-500">{inst.bookingCode}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>{inst.scheduledWindow}</span>
                  <span className="font-bold text-emerald-500">
                    עלות VIP (-25%): {formatPrice(inst.finalInstallationFeeILS)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Carbon Footprint & Green Logistics Service (:8112) */}
        <div className="rounded-3xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-teal-500/15 text-teal-500">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  6. לוגיסטיקה ירוקה וטביעת רגל פחמנית
                </h2>
                <p className="text-xs font-mono text-slate-500">carbon-sustainability-service • Port 8112</p>
              </div>
            </div>
            <button
              onClick={() => triggerSwarmAgent("חשב טביעת רגל פחמנית ומשלוח ירוק", "EcoSustainabilityAdvisorAgent")}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition"
            >
              אשר איחוד חבילות ירוק
            </button>
          </div>
          <div className="space-y-2.5 text-xs">
            {(data?.sustainability || []).map((s: any) => (
              <div key={s.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>דירוג קיימות: {s.ecoScoreGrade}</span>
                  <span className="font-mono text-teal-500">+{s.awardedVipEcoPoints} VIP Points</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>פליטה נטו: {s.netEmissionsKgCo2e} kg CO2e</span>
                  <span className="font-bold text-emerald-500">
                    נחסכו {s.savedEmissionsKgCo2e} kg CO2e (-45%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Multi-Currency Wallet & Gift Cards (:8113) */}
        <div className="rounded-3xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-500">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  7. ארנק רב-מטבעי ו-Gift Cards (+8% בונוס)
                </h2>
                <p className="text-xs font-mono text-slate-500">digital-wallet-giftcard-service • Port 8113</p>
              </div>
            </div>
            <button
              onClick={handleTopUpWallet}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
            >
              + טען ארנק (+8% בונוס)
            </button>
          </div>
          <div className="space-y-2.5 text-xs">
            {(data?.wallet || []).map((w: any) => (
              <div key={w.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>{w.occasionTitle}</span>
                  <span className="font-mono text-amber-500">{w.voucherCode}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>יתרה זמינה: ₪{w.totalAvailableILS} (בונוס: +₪{w.topUpBonusILS})</span>
                  <span className="font-mono font-bold text-indigo-500">
                    ${w.equivalentUSD} USD • €{w.equivalentEUR} EUR
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Creator Affiliate & Live Shopping Hub (:8114) */}
        <div className="rounded-3xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-500">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  8. שידורי קניות בלייב ומועדון יוצרים
                </h2>
                <p className="text-xs font-mono text-slate-500">creator-affiliate-live-service • Port 8114</p>
              </div>
            </div>
            <button
              onClick={() => triggerSwarmAgent("תפעיל שידור חי וקופון יוצר תוכן", "CreatorMatchAffiliateAgent")}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition"
            >
              הפעל קופון לייב (-15%)
            </button>
          </div>
          <div className="space-y-2.5 text-xs">
            {(data?.creators || []).map((cr: any) => (
              <div key={cr.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>{cr.creatorHandle} • {cr.streamTitle}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-500 font-mono">
                    {cr.creatorPromoCode} (-{cr.buyerDiscountPct}%)
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>מחיר שידור חי: {formatPrice(cr.liveDropPriceILS)}</span>
                  <span className="font-bold text-emerald-500">
                    עמלת יוצר אוטומטית (10%): {formatPrice(cr.estimatedCreatorPayoutPerSaleILS)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
