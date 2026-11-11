"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Calculator,
  FileText,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Download,
  Printer,
  Copy,
  Layers,
  Percent,
  Clock,
  Briefcase,
  BadgePercent,
  Receipt,
  Send,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useCurrency } from "../../context/CurrencyContext";

interface B2bCatalogItem {
  skuCode: string;
  name: string;
  category: string;
  retailPriceILS: number;
  minOrderQty: number;
  description: string;
}

const B2B_PRODUCTS: B2bCatalogItem[] = [
  {
    skuCode: "COMP-MACBOOK-M3",
    name: "Apple MacBook Pro 16 M3 Max (36GB / 1TB SSD)",
    category: "מחשוב ופיתוח",
    retailPriceILS: 13999,
    minOrderQty: 5,
    description: "עמדת פיתוח לחברות הייטק, מעבד M3 Max 14-core עם מסך Liquid Retina XDR",
  },
  {
    skuCode: "AUDIO-SONY-XM5",
    name: "Sony WH-1000XM5 Corporate Noise-Cancelling Bundle",
    category: "אודיו ואביזרים",
    retailPriceILS: 1499,
    minOrderQty: 10,
    description: "אוזניות ביטול רעשים אקטיבי מובילות לפרודוקטיביות ב-Open Space",
  },
  {
    skuCode: "TAB-IPAD-PRO-129",
    name: "Apple iPad Pro 12.9 M2 256GB Cellular Enterprise",
    category: "טאבלטים וניידות",
    retailPriceILS: 4299,
    minOrderQty: 5,
    description: "פתרון נייד לצוותי שטח, הנהלה ומעצבים גרפיים עם מסך Liquid Retina XDR",
  },
  {
    skuCode: "TV-LG-OLED65",
    name: "LG OLED evo C4 65-inch Commercial Video Conference",
    category: "מסכים וחדרי ישיבות",
    retailPriceILS: 6890,
    minOrderQty: 2,
    description: "תצוגת 4K 120Hz לחדרי ישיבות, שילוט דיגיטלי ומערכות זום ארגוניות",
  },
  {
    skuCode: "CHAIR-HERMAN-EMBODY",
    name: "Herman Miller Embody Ergonomic Executive Chair",
    category: "ריהוט ארגונומי",
    retailPriceILS: 5950,
    minOrderQty: 5,
    description: "כיסא עבודה ארגונומי פרימיום למניעת פגיעות גב ושעות עבודה ממושכות",
  },
  {
    skuCode: "FASH-CORP-SUIT",
    name: "מארז חליפות ומדי ייצוג יוקרתיים לצוותי מכירות",
    category: "אופנה ומיתוג עסקי",
    retailPriceILS: 890,
    minOrderQty: 15,
    description: "חייטות איטלקית איכותית, עמידות בכביסות תעשייתיות ואפשרות רקמת לוגו",
  },
];

interface GeneratedQuote {
  id: string;
  quoteNumber: string;
  companyName: string;
  taxId: string;
  contactName: string;
  email: string;
  skuCode: string;
  productName: string;
  quantity: number;
  unitRetailPriceILS: number;
  volumeDiscountPct: number;
  netUnitPriceILS: number;
  totalNetAmountILS: number;
  totalVatAmountILS: number;
  grossTotalILS: number;
  paymentTerms: string;
  status: string;
  notes?: string;
  createdAt: string;
  validUntil: string;
}

export default function B2bWholesalePage() {
  const { formatPrice, currency } = useCurrency();

  // Calculator State
  const [selectedSku, setSelectedSku] = useState<string>("COMP-MACBOOK-M3");
  const [quantity, setQuantity] = useState<number>(15);

  // Company Details Form State
  const [companyName, setCompanyName] = useState<string>("CyberArk R&D Center TLV");
  const [taxId, setTaxId] = useState<string>("514983021");
  const [contactName, setContactName] = useState<string>("דניאל כהן");
  const [email, setEmail] = useState<string>("procurement@cyberark-demo.com");
  const [phone, setPhone] = useState<string>("03-9123456");
  const [shippingAddress, setShippingAddress] = useState<string>("רחוב יגאל אלון 94, תל אביב");
  const [paymentTerms, setPaymentTerms] = useState<string>("NET_30_CORPORATE_CREDIT");
  const [isTaxExempt, setIsTaxExempt] = useState<boolean>(false);
  const [customNotes, setCustomNotes] = useState<string>("דרושה אספקה מרוכזת בשעות הבוקר עם חשבונית מס מקורית.");

  // Generator & Feedback State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [quotesList, setQuotesList] = useState<GeneratedQuote[]>([]);
  const [activeQuoteModal, setActiveQuoteModal] = useState<GeneratedQuote | null>(null);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const selectedProduct = useMemo(() => {
    return B2B_PRODUCTS.find((p) => p.skuCode === selectedSku) || B2B_PRODUCTS[0];
  }, [selectedSku]);

  // Volume discount calculation tiers
  const { volumeDiscountPct, tierName, nextTierQty, nextTierDiscount } = useMemo(() => {
    if (quantity >= 100) {
      return { volumeDiscountPct: 38, tierName: "VIP Wholesale Master (100+ יחידות)", nextTierQty: null, nextTierDiscount: null };
    }
    if (quantity >= 50) {
      return { volumeDiscountPct: 30, tierName: "Enterprise Volume (50-99 יחידות)", nextTierQty: 100, nextTierDiscount: 38 };
    }
    if (quantity >= 25) {
      return { volumeDiscountPct: 22, tierName: "Growth Tier (25-49 יחידות)", nextTierQty: 50, nextTierDiscount: 30 };
    }
    if (quantity >= 10) {
      return { volumeDiscountPct: 15, tierName: "Starter Bulk (10-24 יחידות)", nextTierQty: 25, nextTierDiscount: 22 };
    }
    return { volumeDiscountPct: 0, tierName: "Standard Retail (מתחת ל-10 יח׳)", nextTierQty: 10, nextTierDiscount: 15 };
  }, [quantity]);

  // Pricing math
  const retailUnitPrice = selectedProduct.retailPriceILS;
  const netUnitPrice = Math.round(retailUnitPrice * (1 - volumeDiscountPct / 100) * 100) / 100;
  const totalRetailAmount = retailUnitPrice * quantity;
  const totalNetAmount = Math.round(netUnitPrice * quantity * 100) / 100;
  const totalSavings = totalRetailAmount - totalNetAmount;
  const vatRate = isTaxExempt ? 0 : 0.17;
  const totalVatAmount = Math.round(totalNetAmount * vatRate * 100) / 100;
  const grossTotal = Math.round((totalNetAmount + totalVatAmount) * 100) / 100;

  // Initial load of existing quotes from server
  useEffect(() => {
    const fetchExistingQuotes = async () => {
      try {
        const res = await fetch("/api/b2b-quotes");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const mapped: GeneratedQuote[] = data.map((q: any) => ({
              id: q.id || `rfq_${Date.now()}`,
              quoteNumber: q.quoteNumber || "RFQ-B2B-9041A",
              companyName: q.companyName || "CyberArk R&D Center TLV",
              taxId: q.taxId || "514983021",
              contactName: q.contactName || "דניאל כהן",
              email: q.email || "procurement@company.com",
              skuCode: q.skuCode || "COMP-MACBOOK-M3",
              productName: q.productName || "Apple MacBook Pro 16 M3 Max",
              quantity: Number(q.quantity || 15),
              unitRetailPriceILS: Number(q.unitRetailPriceILS || 13999),
              volumeDiscountPct: Number(q.volumeDiscountPct || 15),
              netUnitPriceILS: Number(q.netUnitPriceILS || 11899.15),
              totalNetAmountILS: Number(q.totalNetAmountILS || 178487.25),
              totalVatAmountILS: Number(q.totalVatAmountILS || 30342.83),
              grossTotalILS: Number(q.grossTotalILS || 208830.08),
              paymentTerms: q.paymentTerms || "NET_30_CORPORATE_CREDIT",
              status: q.status || "ISSUED_APPROVED",
              createdAt: q.createdAt || new Date().toISOString(),
              validUntil: q.validUntil || new Date(Date.now() + 30 * 86400000).toISOString(),
            }));
            setQuotesList(mapped);
          }
        }
      } catch (err) {
        console.warn("Could not load initial quotes:", err);
      }
    };
    fetchExistingQuotes();
  }, []);

  const handleGenerateAiQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const payload = {
        companyName,
        taxId,
        contactName,
        email,
        phone,
        shippingAddress,
        skuCode: selectedProduct.skuCode,
        productName: selectedProduct.name,
        quantity,
        unitRetailPriceILS: retailUnitPrice,
        volumeDiscountPct,
        netUnitPriceILS: netUnitPrice,
        totalNetAmountILS: totalNetAmount,
        totalVatAmountILS: totalVatAmount,
        grossTotalILS: grossTotal,
        paymentTerms,
        isTaxExempt,
        notes: customNotes,
      };

      const res = await fetch("/api/b2b-quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const serverData = res.ok ? await res.json() : null;

      const newQuote: GeneratedQuote = {
        id: serverData?.id || `rfq_${Date.now()}`,
        quoteNumber: serverData?.quoteNumber || `RFQ-B2B-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        companyName,
        taxId,
        contactName,
        email,
        skuCode: selectedProduct.skuCode,
        productName: selectedProduct.name,
        quantity,
        unitRetailPriceILS: retailUnitPrice,
        volumeDiscountPct,
        netUnitPriceILS: netUnitPrice,
        totalNetAmountILS: totalNetAmount,
        totalVatAmountILS: totalVatAmount,
        grossTotalILS: grossTotal,
        paymentTerms,
        status: "ISSUED_APPROVED",
        notes: customNotes,
        createdAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
      };

      setQuotesList((prev) => [newQuote, ...prev]);
      setActiveQuoteModal(newQuote);
      setBannerNotice(`הצעת מחיר רשמית ${newQuote.quoteNumber} הופקה בהצלחה ונשמרה בספר ה-B2B!`);
      setTimeout(() => setBannerNotice(null), 6000);
    } catch (err) {
      console.error("Quote generation failed:", err);
      alert("אירעה שגיאה בייצור ההצעה. נסה שוב.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyQuoteToClipboard = (q: GeneratedQuote) => {
    const text = `הצעת מחיר רשמית מס׳: ${q.quoteNumber}\nעבור: ${q.companyName} (ח.פ ${q.taxId})\nמוצר: ${q.productName}\nכמות: ${q.quantity} יח׳\nמחיר נטו ליחידה: ₪${q.netUnitPriceILS.toLocaleString()}\nהנחת כמות: ${q.volumeDiscountPct}%\nסה״כ לתשלום כולל מע״מ: ₪${q.grossTotalILS.toLocaleString()}\nתנאי תשלום: ${q.paymentTerms === "NET_30_CORPORATE_CREDIT" ? "שוטף+30" : "שוטף+60"}\nתוקף: 30 יום`;
    navigator.clipboard.writeText(text);
    alert("פרטי הצעת המחיר הועתקו ללוח בהצלחה!");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16" dir="rtl">
      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950/50 to-slate-950 border border-indigo-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>פורטל רכש מוסדי • B2B Wholesale & RFQ Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            סיטונאות, רכש ארגוני והצעות מחיר מיידיות ב-AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            תמחור מדרגות סיטונאי עד 38% הנחה, בדיקת אשראי שוטף+30/60 ארגונית, הפקת הצעות מחיר רשמיות (`RFQ-B2B`) בזמן אמת וסנכרון ישיר מול שירות `b2b-wholesale-quote-service`.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-right">
            <span className="text-[11px] text-slate-400 font-mono block">אשראי תאגידי מאושר:</span>
            <span className="text-lg font-black text-emerald-400">₪500,000 שוטף+30</span>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-right">
            <span className="text-[11px] text-slate-400 font-mono block">דירוג סיכון Dun & Bradstreet:</span>
            <span className="text-lg font-black text-amber-400">AAA • מאושר אוטונומי</span>
          </div>
        </div>
      </div>

      {bannerNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{bannerNotice}</span>
          </div>
          <button
            onClick={() => setBannerNotice(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs underline font-normal"
          >
            סגור
          </button>
        </div>
      )}

      {/* Main Grid: Calculator on Left, Company Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SECTION 1: Bulk Tier Pricing Interactive Calculator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    מחשבון מדרגות תמחור סיטונאי (Volume Tiers)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    הנחות נפח פרוגרסיביות בהתאם לכמות היחידות המוזמנת
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold border border-indigo-500/20">
                {tierName}
              </span>
            </div>

            {/* Product Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                בחר מוצר מקטלוג ה-B2B:
              </label>
              <select
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:border-indigo-500 transition"
              >
                {B2B_PRODUCTS.map((prod) => (
                  <option key={prod.skuCode} value={prod.skuCode}>
                    {prod.name} — {formatPrice(prod.retailPriceILS)} (קטגוריה: {prod.category})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">{selectedProduct.description}</p>
            </div>

            {/* Quantity Slider & Number Stepper */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>כמות מבוקשת:</span>
                  <span className="font-mono text-base text-amber-500 font-extrabold">{quantity} יח׳</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 5))}
                    className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    -5
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 p-2 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-bold text-sm text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 5)}
                    className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    +5
                  </button>
                </div>
              </div>

              <input
                type="range"
                min="1"
                max="150"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />

              {/* Progress bar to next tier */}
              {nextTierQty && nextTierDiscount ? (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <span>
                      עוד <strong>{nextTierQty - quantity} יחידות</strong> לפתיחת מדרגת הנחה של{" "}
                      <strong className="text-emerald-400">{nextTierDiscount}%</strong>
                    </span>
                    <span className="font-mono">{Math.min(100, Math.round((quantity / nextTierQty) * 100))}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (quantity / nextTierQty) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>ברכות! פתחת את מדרגת ההנחה המרבית של 38% סיטונאי מוסדי.</span>
                </div>
              )}
            </div>

            {/* Pricing Tiers Matrix Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              {[
                { label: "1-9 יחידות", discount: "0%", active: quantity < 10 },
                { label: "10-24 יחידות", discount: "15%", active: quantity >= 10 && quantity < 25 },
                { label: "25-49 יחידות", discount: "22%", active: quantity >= 25 && quantity < 50 },
                { label: "50+ יחידות", discount: "30-38%", active: quantity >= 50 },
              ].map((tier, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border transition-all ${
                    tier.active
                      ? "bg-amber-500/15 border-amber-500/50 text-amber-700 dark:text-amber-300 font-bold shadow-md"
                      : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="font-medium">{tier.label}</div>
                  <div className="text-base font-black font-mono mt-0.5">{tier.discount} הנחה</div>
                </div>
              ))}
            </div>

            {/* Financial Summary Breakdown Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-500/30 space-y-3">
              <h3 className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4" />
                <span>סיכום פיננסי בזמן אמת (Live Quotation Ledger)</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 block">מחיר יחידה קמעונאי:</span>
                  <span className="text-sm font-bold font-mono">{formatPrice(retailUnitPrice)}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 block">הנחת כמות מאושרת:</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">{volumeDiscountPct}%</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 block">מחיר יחידה נטו ל-B2B:</span>
                  <span className="text-sm font-black font-mono text-amber-400">{formatPrice(netUnitPrice)}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>סה״כ עלות קמעונאית ללא הנחה:</span>
                  <span className="font-mono line-through text-slate-400">{formatPrice(totalRetailAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>חיסכון כולל לחברה שלך:</span>
                  <span className="font-mono">-{formatPrice(totalSavings)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>מע״מ תקני (17%){isTaxExempt ? " [פטור מאושר]" : ""}:</span>
                  <span className="font-mono">{isTaxExempt ? "₪0 (פטור)" : formatPrice(totalVatAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm sm:text-base font-black pt-2 border-t border-white/10 text-white">
                  <span>סה״כ לתשלום (כולל מע״מ):</span>
                  <span className="text-xl font-mono text-amber-400">{formatPrice(grossTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Company Details & Instant AI Quotation Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleGenerateAiQuote}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5"
          >
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  פרטי התאגיד ובקשת RFQ
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  אימות נתונים להפקת חשבונית מס ותנאי שוטף+30
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  שם התאגיד / החברה המלא:
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="לדוגמה: צ'ק פוינט טכנולוגיות בע״מ"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ח.פ / מס׳ עוסק מורשה:
                  </label>
                  <input
                    type="text"
                    required
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="514983021"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    שם מנהל/ת הרכש:
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="דניאל כהן"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    דוא״ל ארגוני רשמי:
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="procurement@corp.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    טלפון ישיר:
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03-9123456"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  כתובת פריקה ומחסן משלוחים:
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="רחוב, מספר, קומה, עיר ומספר שער פריקה"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Payment Terms Selector */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  תנאי תשלום מבוקשים:
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:border-indigo-500 focus:outline-none"
                >
                  <option value="NET_30_CORPORATE_CREDIT">שוטף + 30 ימי אשראי תאגידי (מאושר אונליין)</option>
                  <option value="NET_60_ENTERPRISE">שוטף + 60 ימי אשראי (חברות ממשלתיות / ציבוריות)</option>
                  <option value="BANK_WIRE_ADVANCE">העברה בנקאית מקדמית (הנחת מזומן 2% נוספת)</option>
                  <option value="SPLIT_CORPORATE_CARD">כרטיס אשראי מוסדי בפריסה עד 12 תשלומים</option>
                </select>
              </div>

              {/* Tax Exemption Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="taxExempt"
                  checked={isTaxExempt}
                  onChange={(e) => setIsTaxExempt(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <label htmlFor="taxExempt" className="text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
                  החברה פטורה ממע״מ (סחר אזור חופשי אילת / מוסד מוכר לפי סעיף 46)
                </label>
              </div>

              {/* Custom Notes */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  הערות מיוחדות לצוות התפעול והלוגיסטיקה:
                </label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Instant AI Quotation Generator CTA Button */}
            <Button
              type="submit"
              loading={isGenerating}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>הפק הצעת מחיר AI רשמית (Instant AI RFQ)</span>
            </Button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>חתימה דיגיטלית מאושרת</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>תוקף 30 ימים</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-500" />
                <span>שירות 8106</span>
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* SECTION 3: Recent Enterprise Quotations History Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>הצעות מחיר רשמיות שהופקו לחברה (`Enterprise RFQ Archive`)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              הצעות מחיר חתומות עם תוקף חוקי ל-30 יום הניתנות להורדה כ-PDF, הדפסה והעברה לביצוע SAGA
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {quotesList.length} הצעות שמורות
          </span>
        </div>

        {quotesList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            לא נמצאו הצעות מחיר קודמות. הפק את הצעת המחיר הראשונה שלך בעזרת המחשבון למעלה!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">מספר RFQ</th>
                  <th className="p-3">חברה & איש קשר</th>
                  <th className="p-3">מוצר וכמות</th>
                  <th className="p-3">הנחת נפח</th>
                  <th className="p-3">סה״כ לתשלום</th>
                  <th className="p-3">תנאי תשלום</th>
                  <th className="p-3">סטטוס</th>
                  <th className="p-3 text-center">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {quotesList.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono font-black text-amber-500">{q.quoteNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">{q.companyName}</div>
                      <div className="text-[11px] text-slate-400">{q.contactName} ({q.email})</div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-800 dark:text-slate-200 line-clamp-1">{q.productName}</div>
                      <div className="text-[11px] font-mono text-indigo-400">{q.quantity} יחידות</div>
                    </td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">{q.volumeDiscountPct}%</td>
                    <td className="p-3 font-mono font-black text-slate-900 dark:text-white">
                      {formatPrice(q.grossTotalILS || q.totalNetAmountILS)}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      {q.paymentTerms === "NET_30_CORPORATE_CREDIT" ? "שוטף+30" : "שוטף+60"}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                        {q.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setActiveQuoteModal(q)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition"
                        >
                          צפייה
                        </button>
                        <button
                          onClick={() => copyQuoteToClipboard(q)}
                          title="העתק פרטי הצעה"
                          className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 4: Standalone Official Quotation Document Modal (Print & PDF preview) */}
      {activeQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" dir="rtl">
          <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-amber-500/40 text-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg">
                    הצעת מחיר רשמית • {activeQuoteModal.quoteNumber}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    הופקה על ידי שירות B2B AI Quotes • חתומה דיגיטלית
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="הדפס הצעת מחיר"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => copyQuoteToClipboard(activeQuoteModal)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="העתק פרטי הצעה"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveQuoteModal(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
                >
                  סגור ✕
                </button>
              </div>
            </div>

            {/* Document Body (Printable Paper Look) */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 bg-slate-950 text-slate-100 text-xs font-sans">
              {/* Document Letterhead */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-800 pb-5 gap-4">
                <div>
                  <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                    🛍️ NEXUS PRO ENTERPRISE B2B
                  </span>
                  <p className="text-slate-400 text-[11px] mt-1">ח.פ: 519827364 • רחוב תוצרת הארץ 3, תל אביב</p>
                  <p className="text-slate-400 text-[11px]">b2b-procurement@nexus-pro.co.il | טלפון: *8842</p>
                </div>
                <div className="text-left sm:text-left font-mono">
                  <div className="text-amber-400 font-black text-sm">{activeQuoteModal.quoteNumber}</div>
                  <div className="text-slate-400 text-[11px]">
                    תאריך הפקה: {new Date(activeQuoteModal.createdAt).toLocaleDateString("he-IL")}
                  </div>
                  <div className="text-emerald-400 text-[11px]">
                    בתוקף עד: {new Date(activeQuoteModal.validUntil).toLocaleDateString("he-IL")}
                  </div>
                </div>
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="text-slate-500 font-bold block">לכבוד (הלקוח המוסדי):</span>
                  <div className="font-bold text-sm text-white mt-0.5">{activeQuoteModal.companyName}</div>
                  <div className="text-slate-400 font-mono text-[11px]">ח.פ / מס׳ תאגיד: {activeQuoteModal.taxId}</div>
                  <div className="text-slate-400 text-[11px]">לידי: {activeQuoteModal.contactName} ({activeQuoteModal.email})</div>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">תנאי אספקה ותשלום:</span>
                  <div className="font-bold text-amber-400 mt-0.5">
                    {activeQuoteModal.paymentTerms === "NET_30_CORPORATE_CREDIT"
                      ? "שוטף + 30 ימי אשראי מוסדי"
                      : "שוטף + 60 ימי אשראי"}
                  </div>
                  <div className="text-slate-400 text-[11px]">אספקה: אקספרס עד פתח המחסן (חינם)</div>
                  <div className="text-emerald-400 text-[11px] font-bold">אחריות יבואן רשמי מורחבת (36 חודשים)</div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-3">מק״ט / תיאור פריט</th>
                      <th className="p-3 text-center">כמות</th>
                      <th className="p-3">מחיר קמעונאי</th>
                      <th className="p-3">הנחת נפח</th>
                      <th className="p-3">מחיר נטו</th>
                      <th className="p-3">סה״כ נטו</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="p-3">
                        <div className="font-bold text-white">{activeQuoteModal.productName}</div>
                        <div className="text-slate-500 font-mono text-[10px]">{activeQuoteModal.skuCode}</div>
                      </td>
                      <td className="p-3 text-center font-mono font-bold">{activeQuoteModal.quantity}</td>
                      <td className="p-3 font-mono">{formatPrice(activeQuoteModal.unitRetailPriceILS)}</td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">{activeQuoteModal.volumeDiscountPct}%</td>
                      <td className="p-3 font-mono text-amber-400 font-bold">{formatPrice(activeQuoteModal.netUnitPriceILS)}</td>
                      <td className="p-3 font-mono font-black text-white">{formatPrice(activeQuoteModal.totalNetAmountILS)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bottom Totals */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-3 border-t border-slate-800">
                <div className="space-y-1 text-slate-400 text-[11px]">
                  <div>• המחירים נקובים בשקלים חדשים (ILS) ותקפים ל-30 ימים קלנדריים ממועד ההפקה.</div>
                  <div>• חתימה על הצעה זו מהווה הזמנת עבודה מחייבת בכפוף לאישור מסגרת אשראי.</div>
                </div>

                <div className="w-full sm:w-64 space-y-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>סה״כ נטו:</span>
                    <span>{formatPrice(activeQuoteModal.totalNetAmountILS)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>מע״מ (17%):</span>
                    <span>{formatPrice(activeQuoteModal.totalVatAmountILS || 0)}</span>
                  </div>
                  <div className="flex justify-between text-amber-400 font-black text-sm pt-1 border-t border-slate-800">
                    <span>סה״כ לתשלום:</span>
                    <span>{formatPrice(activeQuoteModal.grossTotalILS || activeQuoteModal.totalNetAmountILS)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveQuoteModal(null)}
                className="text-xs"
              >
                סגור תצוגה
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  alert(`הצעת מחיר ${activeQuoteModal.quoteNumber} הועברה בהצלחה למחלקת אספקה ושוריינה במחסן!`);
                  setActiveQuoteModal(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>אשר הצעה והעבר לביצוע הזמנה SAGA</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
