"use client";

import React, { useEffect, useState } from "react";
import {
  Gift,
  Recycle,
  Building2,
  CheckCircle2,
  Sparkles,
  HeartHandshake,
  Tag,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useCurrency } from "../../context/CurrencyContext";

interface GiftCampaign {
  id: string;
  campaignCode: string;
  recipientName: string;
  occasionTitle: string;
  skuCode: string;
  productName: string;
  imageUrl: string;
  targetAmountILS: number;
  raisedAmountILS: number;
  status: string;
  contributions: Array<{
    contributorName: string;
    amountILS: number;
    greetingMessage: string;
    timestamp: string;
  }>;
}

interface TradeInAppraisal {
  id: string;
  appraisalCode: string;
  deviceModel: string;
  conditionGrade: string;
  baseMarketValueILS: number;
  approvedCreditILS: number;
  tradeInVoucherCode: string;
  resaleRetention24mPct: number;
}

interface B2bQuote {
  id: string;
  quoteNumber: string;
  companyName: string;
  skuCode: string;
  productName: string;
  quantity: number;
  unitRetailPriceILS: number;
  volumeDiscountPct: number;
  netUnitPriceILS: number;
  totalNetAmountILS: number;
  paymentTerms: string;
}

export default function GiftingTradeInB2bPage() {
  const { formatPrice } = useCurrency();
  const [gifts, setGifts] = useState<GiftCampaign[]>([]);
  const [appraisals, setAppraisals] = useState<TradeInAppraisal[]>([]);
  const [quotes, setQuotes] = useState<B2bQuote[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Trade-In Form state
  const [deviceModel, setDeviceModel] = useState("Apple iPad Pro 12.9 M2");
  const [conditionGrade, setConditionGrade] = useState("MINT_A_PLUS");
  const [retailValue, setRetailValue] = useState(4200);

  // B2B Form state
  const [companyName, setCompanyName] = useState("Wix Engineering TLV");
  const [b2bProduct, setB2bProduct] = useState("Sony WH-1000XM5 Corporate Edition");
  const [b2bQty, setB2bQty] = useState(25);

  const loadAll = async () => {
    const [gRes, tRes, bRes] = await Promise.all([
      fetch("/api/gifting"),
      fetch("/api/trade-in"),
      fetch("/api/b2b-quotes"),
    ]);
    if (gRes.ok) setGifts(await gRes.json());
    if (tRes.ok) setAppraisals(await tRes.json());
    if (bRes.ok) setQuotes(await bRes.json());
  };

  useEffect(() => {
    loadAll();
  }, []);

  const showNotice = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleChipInGift = async (camp: GiftCampaign) => {
    const amount = 250;
    await fetch("/api/gifting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId: camp.id,
        contributorName: "עידן קזם (VIP)",
        amountILS: amount,
        greetingMessage: "מזל טוב מכל הלב! 🎁🎉",
      }),
    });
    setGifts((prev) =>
      prev.map((g) => {
        if (g.id !== camp.id) return g;
        const nextRaised = g.raisedAmountILS + amount;
        return {
          ...g,
          raisedAmountILS: nextRaised,
          status: nextRaised >= g.targetAmountILS ? "FUNDED_ORDER_DISPATCHED" : g.status,
          contributions: [
            {
              contributorName: "עידן קזם (VIP)",
              amountILS: amount,
              greetingMessage: "מזל טוב מכל הלב! 🎁🎉",
              timestamp: new Date().toISOString(),
            },
            ...(g.contributions || []),
          ],
        };
      })
    );
    showNotice(`השתתפת ב-${formatPrice(amount)} במתנה עבור ${camp.recipientName}!`);
  };

  const handleRunTradeIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/trade-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: "usr_demo",
        deviceModel,
        conditionGrade,
        originalRetailPriceILS: retailValue,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setAppraisals((prev) => [created, ...prev]);
      if (typeof window !== "undefined") {
        localStorage.setItem("active_trade_in_credit", String(created.approvedCreditILS));
        localStorage.setItem("active_trade_in_voucher", created.tradeInVoucherCode);
      }
      showNotice(
        `שמאות AI אושרה! הונפק שובר טרייד-אין ${created.tradeInVoucherCode} על סך ${formatPrice(
          created.approvedCreditILS
        )} לקיזוז מיידי בקופה.`
      );
    }
  };

  const handleGenerateB2bQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/b2b-quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName,
        skuCode: "CORP-BUNDLE-PRO",
        productName: b2bProduct,
        quantity: b2bQty,
        unitRetailPriceILS: 1499,
      }),
    });
    if (res.ok) {
      const q = await res.json();
      setQuotes((prev) => [q, ...prev]);
      showNotice(
        `הצעת מחיר ארגונית ${q.quoteNumber} הופקה עם ${q.volumeDiscountPct}% הנחת כמות בתנאי שוטף + 30!`
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16" dir="rtl">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-emerald-950/40 to-slate-950 border border-emerald-500/30 shadow-2xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ports 8104 • 8105 • 8106 | TradeInValuationAgent & Social Split-Pay</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">
          מתנות משותפות, טרייד-אין חכם (`AI Trade-In`) ורכש ארגוני `B2B`
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
          פיצול תשלום מתנות בין חברים (`gift-registry-splitpay-service`), שמאות מכשירים ישנים עם זיכוי מיידי לקופה (`trade-in-circular-service`), והצעות מחיר כמותיות לעסקים (`b2b-wholesale-quote-service`).
        </p>
      </div>

      {toast && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* SECTION 1: Social Gifting & Multi-Payer Split */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-rose-500" />
            <span>מתנות משותפות ומימון חברתי (`Social Gifting & Multi-Payer Split`)</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">פורט 8105 • שחרור הזמנה אוטומטי ב-100% מימון</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gifts.map((g) => {
            const pct = Math.min(100, Math.round((g.raisedAmountILS / Math.max(1, g.targetAmountILS)) * 100));
            return (
              <div
                key={g.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={g.imageUrl}
                      alt={g.productName}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-rose-500">{g.occasionTitle}</span>
                      <h3 className="font-black text-base text-slate-900 dark:text-white">
                        עבור: {g.recipientName} • {g.productName}
                      </h3>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">{g.campaignCode}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">נאסף עד כה מהחברים:</span>
                      <strong className="font-mono text-emerald-500">
                        {formatPrice(g.raisedAmountILS)} מתוך {formatPrice(g.targetAmountILS)} ({pct}%)
                      </strong>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {g.contributions && g.contributions.length > 0 && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 max-h-28 overflow-y-auto">
                      {g.contributions.slice(0, 3).map((c, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-300">
                            <strong>{c.contributorName}:</strong> &ldquo;{c.greetingMessage}&rdquo;
                          </span>
                          <span className="font-mono font-bold text-emerald-500">+{formatPrice(c.amountILS)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleChipInGift(g)}
                  className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>השתתף במתנה (+{formatPrice(250)}) והוסף ברכה</span>
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: AI Trade-In Estimator & Circular Economy */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Recycle className="w-5 h-5 text-emerald-500" />
              <span>שמאי טרייד-אין אוטונומי (`TradeInValuationAgent`)</span>
            </h2>
            <span className="text-xs font-mono text-emerald-500">פורט 8104</span>
          </div>

          <form onSubmit={handleRunTradeIn} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">דגם המכשיר הישן שלך:</label>
              <input
                type="text"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">מצב המכשיר:</label>
                <select
                  value={conditionGrade}
                  onChange={(e) => setConditionGrade(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="MINT_A_PLUS">כמו חדש (MINT A+ - 60% זיכוי)</option>
                  <option value="GOOD_A">מצב טוב (GOOD A - 45% זיכוי)</option>
                  <option value="FAIR_B">סימני שימוש (FAIR B - 30% זיכוי)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">מחיר מקור מוערך (₪):</label>
                <input
                  type="number"
                  value={retailValue}
                  onChange={(e) => setRetailValue(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-2xl"
            >
              חשב שווי טרייד-אין והנפק שובר קיזוז לקופה
            </Button>
          </form>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 block">שוברי טרייד-אין פעילים בחשבונך:</span>
            {appraisals.slice(0, 3).map((apr) => (
              <div
                key={apr.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <strong className="text-slate-900 dark:text-white block">{apr.deviceModel}</strong>
                  <span className="font-mono text-[11px] text-amber-500">
                    שובר: {apr.tradeInVoucherCode} • שמירת ערך 24 חודשים: {apr.resaleRetention24mPct}%
                  </span>
                </div>
                <span className="font-mono font-black text-sm text-emerald-500">
                  {formatPrice(apr.approvedCreditILS)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: B2B Corporate Wholesale RFQ */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" />
              <span>הצעות מחיר ארגוניות (`B2B Bulk RFQ & Net-30`)</span>
            </h2>
            <span className="text-xs font-mono text-indigo-400">פורט 8106</span>
          </div>

          <form onSubmit={handleGenerateB2bQuote} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">שם החברה / הארגון:</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">מוצר לרכש מרוכז:</label>
                <input
                  type="text"
                  value={b2bProduct}
                  onChange={(e) => setB2bProduct(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">כמות יחידות (10+ / 25+ / 50+):</label>
                <input
                  type="number"
                  min={5}
                  value={b2bQty}
                  onChange={(e) => setB2bQty(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>הפק הצעת מחיר B2B רשמית בתנאי שוטף + 30</span>
            </Button>
          </form>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 block">הצעות מחיר B2B מאושרות:</span>
            {quotes.slice(0, 3).map((q) => (
              <div
                key={q.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <strong className="text-slate-900 dark:text-white block">
                    {q.companyName} • {q.quantity} יח׳ {q.productName}
                  </strong>
                  <span className="font-mono text-[11px] text-indigo-400">
                    {q.quoteNumber} • הנחת כמות: -{q.volumeDiscountPct}% • {q.paymentTerms}
                  </span>
                </div>
                <span className="font-mono font-black text-sm text-amber-500">
                  {formatPrice(q.totalNetAmountILS)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
