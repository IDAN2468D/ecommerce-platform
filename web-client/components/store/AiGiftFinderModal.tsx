"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Gift,
  Heart,
  Users,
  Smile,
  Briefcase,
  Cpu,
  Coffee,
  Cake,
  HeartHandshake,
  TrendingUp,
  Home,
  Award,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Percent,
  Check,
  PackageCheck
} from "lucide-react";
import { Button } from "../ui/Button";
import { useCurrency } from "../../context/CurrencyContext";

export interface GiftBundleItem {
  skuCode: string;
  name: string;
  price: number;
  imageUrl: string;
}

export interface GiftBundle {
  id: string;
  title: string;
  subtitle: string;
  matchScore: number;
  occasion: string;
  recipient: string;
  aiExplanation: string;
  items: GiftBundleItem[];
  bundlePrice: number;
  originalPrice: number;
  discountPct: number;
  freeGifts: string[];
}

export interface AiGiftFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBundle?: (bundle: GiftBundle) => void;
}

const RECIPIENTS = [
  { id: "partner", label: "בן / בת זוג", desc: "אינטימי, רומנטי ומרגש", icon: Heart },
  { id: "parents", label: "הורים ומשפחה", desc: "פינוק יוקרתי, ביתי ומשמעותי", icon: Users },
  { id: "friend", label: "חבר / חברה טובה", desc: "קליל, מפתיע ומדויק", icon: Smile },
  { id: "colleague", label: "קולגה / צוות בעבודה", desc: "אלגנטי, מקצועי ומכבד", icon: Briefcase },
  { id: "tech_lover", label: "חובב טכנולוגיה", desc: "גאדג'טים חכמים וציוד קצה", icon: Cpu },
  { id: "coffee_chef", label: "פודי / חובב קפה", desc: "קפה בוטיק, אירוח ומטבח", icon: Coffee },
];

const BUDGETS = [
  { id: "b1", label: "עד ₪350", range: [50, 350], desc: "תשומת לב איכותית וקולעת" },
  { id: "b2", label: "₪350 - ₪900", range: [350, 900], desc: "מתנה מושקעת ומפנקת" },
  { id: "b3", label: "₪900 - ₪2,500", range: [900, 2500], desc: "פרימיום בלתי נשכח" },
  { id: "b4", label: "מעל ₪2,500+", range: [2500, 15000], desc: "מתנת חלומות או מימון משותף" },
];

const OCCASIONS = [
  { id: "birthday", label: "יום הולדת", desc: "חגיגה אישית שמחה", icon: Cake },
  { id: "wedding", label: "חתונה / אירוסין", desc: "פתיחת פרק חדש יחד", icon: HeartHandshake },
  { id: "promotion", label: "קידום בעבודה / פרידה", desc: "הערכה והצלחה בדרך", icon: TrendingUp },
  { id: "housewarming", label: "חנוכת בית", desc: "שדרוג האווירה והאירוח", icon: Home },
  { id: "thankyou", label: "מתנת תודה והוקרה", desc: "הבעת הערכה כנה מעומק הלב", icon: Award },
  { id: "holiday", label: "חג ומועד", desc: "מתנת חג חגיגית ומיוחדת", icon: Sparkles },
];

const STYLES = [
  { id: "luxury", label: "יוקרתי ומלוטש", desc: "חומרים מובחרים, גימור פרימיום נקי" },
  { id: "hitech", label: "חכם ודיגיטלי", desc: "חיבוריות מתקדמת, בינה מלאכותית וחדשנות" },
  { id: "wellness", label: "רוגע, קפה וספא", desc: "פינוק עצמי ורגעים איכותיים של שקט" },
  { id: "creative", label: "יצירתי ומפתיע", desc: "ייחודי, מחוץ לקופסה ואישי" },
];

export const AiGiftFinderModal: React.FC<AiGiftFinderModalProps> = ({
  isOpen,
  onClose,
  onSelectBundle,
}) => {
  const { formatPrice } = useCurrency();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedRecipient, setSelectedRecipient] = useState<string>("partner");
  const [selectedBudget, setSelectedBudget] = useState<string>("b2");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("birthday");
  const [selectedStyle, setSelectedStyle] = useState<string>("hitech");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [curatedBundles, setCuratedBundles] = useState<GiftBundle[]>([]);
  const [addedBundleId, setAddedBundleId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAiMatch = () => {
    setIsAnalyzing(true);
    setCurrentStep(5);

    setTimeout(() => {
      const generated = generateTailoredBundles(
        selectedRecipient,
        selectedBudget,
        selectedOccasion,
        selectedStyle
      );
      setCuratedBundles(generated);
      setIsAnalyzing(false);
    }, 1200);
  };

  const generateTailoredBundles = (
    recip: string,
    budg: string,
    occ: string,
    sty: string
  ): GiftBundle[] => {
    const recipLabel = RECIPIENTS.find(r => r.id === recip)?.label || "מקבל המתנה";
    const occLabel = OCCASIONS.find(o => o.id === occ)?.label || "האירוע המיוחד";

    const allBundles: GiftBundle[] = [
      {
        id: "bundle_sound_focus",
        title: "מארז סאונד ופוקוס פרימיום",
        subtitle: "שקט מוחלט, מוזיקה איכותית ופרודוקטיביות מרבית",
        matchScore: 99,
        occasion: occLabel,
        recipient: recipLabel,
        aiExplanation: `נבחר במיוחד עבור ${recipLabel} לרגל ${occLabel}: שילוב מנצח של סינון רעשים אקטיבי מוביל לצד נרתיק מגן מהודר וכרטיס ברכה אישי.`,
        items: [
          {
            skuCode: "SONY-WH1000XM5",
            name: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
            price: 1390,
            imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
          },
          {
            skuCode: "ACCESSORY-CASE-LEATHER",
            name: "נרתיק מגן מעור איטלקי מותאם אישית",
            price: 260,
            imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80",
          },
        ],
        bundlePrice: 1399,
        originalPrice: 1650,
        discountPct: 15,
        freeGifts: ["אריזת מתנה יוקרתית בחינם", "כרטיס ברכה מותאם אישית בלייזר"],
      },
      {
        id: "bundle_barista_boutique",
        title: "מארז באריסטה ובוטיק קפה טרי",
        subtitle: "חוויית קפה גורמה מותאמת לבית ולמשרד",
        matchScore: 96,
        occasion: occLabel,
        recipient: recipLabel,
        aiExplanation: `מתנה קלאסית ומפנקת עבור ${recipLabel}: פולי קפה ספיישלטי מובחרים לצד אביזרי חליטה מדויקים לאירוח מושלם.`,
        items: [
          {
            skuCode: "COFFEE-BEANS-SPECIALTY",
            name: "מארז שלישיית פולי קפה ספיישלטי בקלייה טרייה TLV",
            price: 240,
            imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80",
          },
          {
            skuCode: "COFFEE-DRIP-PITCHER",
            name: "קנקן מזיגה גוזנק בריסטה נירוסטה מט",
            price: 190,
            imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80",
          },
        ],
        bundlePrice: 349,
        originalPrice: 430,
        discountPct: 18,
        freeGifts: ["מארז כוסות דופן כפולה בחינם", "מדריך חליטה דיגיטלי"],
      },
      {
        id: "bundle_apple_ecosystem",
        title: "מארז ניידות ופרודוקטיביות Apple Ultimate",
        subtitle: "סביבת עבודה ניידת מושלמת לעיצוב, למידה ויצירה",
        matchScore: 98,
        occasion: occLabel,
        recipient: recipLabel,
        aiExplanation: `מתנת שיא עבור ${recipLabel} לחגיגת ${occLabel}: ביצועי M4 אדירים עם מסך OLED ואוזניות שמע מרחבי תואמות.`,
        items: [
          {
            skuCode: "IPAD-PRO-M4",
            name: "Apple iPad Pro 11-inch M4 256GB OLED Space Black",
            price: 4299,
            imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80",
          },
          {
            skuCode: "AIRPODS-MAX",
            name: "Apple AirPods Max USB-C Premium Headphones",
            price: 2199,
            imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80",
          },
        ],
        bundlePrice: 5690,
        originalPrice: 6498,
        discountPct: 12,
        freeGifts: ["מטען מהיר 70W GaN מקורי", "משלוח VIP באותו היום עד הדלת"],
      },
      {
        id: "bundle_gaming_social",
        title: "מארז גיימינג ובידור סלוני Pro",
        subtitle: "מתנה מושלמת לשעות של כיף משותף עם חברים ומשפחה",
        matchScore: 97,
        occasion: occLabel,
        recipient: recipLabel,
        aiExplanation: `קולע בדיוק להעדפות הגיימינג והבידור של ${recipLabel}: קונסולת פרימיום עם 2 שלטים לפעילות משותפת מיידית.`,
        items: [
          {
            skuCode: "GAME-PS5-PRO-30",
            name: "PlayStation 5 Pro 2TB Console",
            price: 3290,
            imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80",
          },
          {
            skuCode: "GAME-DUALSENSE-EXTRA",
            name: "בקר אלחוטי נוסף DualSense Midnight Black",
            price: 320,
            imageUrl: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=400&q=80",
          },
        ],
        bundlePrice: 3190,
        originalPrice: 3610,
        discountPct: 11,
        freeGifts: ["עמדת טעינה כפולה לשלטים", "מנוי PlayStation Plus למשך 3 חודשים"],
      },
    ];

    // Filter or re-order based on budget & style
    if (budg === "b1" || budg === "b2") {
      return allBundles.filter(b => b.bundlePrice <= 1500);
    }
    return allBundles;
  };

  const handleAddBundleToCart = (bundle: GiftBundle) => {
    try {
      const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
      
      bundle.items.forEach((item) => {
        const existingIdx = currentCart.findIndex((i: any) => i.skuCode === item.skuCode);
        if (existingIdx >= 0) {
          currentCart[existingIdx].quantity += 1;
        } else {
          currentCart.push({
            skuCode: item.skuCode,
            name: item.name,
            title: item.name,
            price: item.price,
            quantity: 1,
            imageUrl: item.imageUrl,
          });
        }
      });

      localStorage.setItem("cart", JSON.stringify(currentCart));
      window.dispatchEvent(new Event("cart-updated"));
      setAddedBundleId(bundle.id);

      if (onSelectBundle) {
        onSelectBundle(bundle);
      }

      setTimeout(() => {
        setAddedBundleId(null);
      }, 3000);
    } catch (e) {
      console.error("Failed to add bundle to cart", e);
    }
  };

  const handleStartSharedGifting = async (bundle: GiftBundle) => {
    try {
      // Create social gifting campaign directly
      await fetch("/api/gifting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: `gift_ai_${Date.now()}`,
          contributorName: "יוזם הקמפיין (VIP)",
          amountILS: Math.round(bundle.bundlePrice * 0.25),
          greetingMessage: `פתחנו מתנה משותפת: ${bundle.title}! הצטרפו אלינו לחגיגה 🎁`,
        }),
      });

      onClose();
      window.location.href = "/gifting";
    } catch {
      onClose();
      window.location.href = "/gifting";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-slate-900/95 backdrop-blur-2xl border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white flex flex-col space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 start-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label="סגור חלון"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Strip */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-white">AI Gift Finder & Personal Shopper</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                סוכן סטיילינג אוטונומי
              </span>
            </div>
            <p className="text-xs text-slate-400">
              מענה על 4 שאלות קצרות להתאמת מארז מתנה חכם בדיוק מקסימלי לתקציב, לאירוע ולסגנון האישי
            </p>
          </div>
        </div>

        {/* Step Progress Bar */}
        {currentStep <= 4 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>שלב {currentStep} מתוך 4: {
                currentStep === 1 ? "למי המתנה?" :
                currentStep === 2 ? "מה התקציב?" :
                currentStep === 3 ? "מה האירוע?" : "סגנון ו-Vibe"
              }</span>
              <span className="text-emerald-400 font-bold">{currentStep * 25}% הושלם</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${currentStep * 25}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: Recipient Selection */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="text-base font-bold text-slate-200">1. למי מיועדת המתנה?</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {RECIPIENTS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedRecipient === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedRecipient(item.id)}
                    className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500/70 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{item.label}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Budget Selection */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="text-base font-bold text-slate-200">2. מה מסגרת התקציב המתוכננת?</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BUDGETS.map((item) => {
                const isSelected = selectedBudget === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedBudget(item.id)}
                    className={`p-4 rounded-2xl border text-right transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500/70 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="font-black text-base text-white font-mono">{item.label}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Occasion Selection */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="text-base font-bold text-slate-200">3. מה האירוע הנחגג?</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {OCCASIONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedOccasion === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedOccasion(item.id)}
                    className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500/70 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{item.label}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Style / Vibe Selection */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="text-base font-bold text-slate-200">4. מה הסגנון המועדף על מקבל המתנה?</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STYLES.map((item) => {
                const isSelected = selectedStyle === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedStyle(item.id)}
                    className={`p-4 rounded-2xl border text-right transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500/70 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white">{item.label}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Buttons for Steps 1 - 4 */}
        {currentStep <= 4 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="px-4 py-2 text-xs text-slate-300 border-slate-700 hover:bg-slate-800"
            >
              <ArrowRight className="w-3.5 h-3.5 ms-1" />
              <span>חזור</span>
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5"
              >
                <span>המשך</span>
                <ArrowLeft className="w-3.5 h-3.5 me-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleRunAiMatch}
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white font-black text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/25"
              >
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                <span>הרץ התאמת AI ומצא מתנות</span>
              </Button>
            )}
          </div>
        )}

        {/* STEP 5: AI Generating or Curated Results */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            {isAnalyzing ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-white">ה-AI סורק ומנתח את קטלוג המוצרים...</h4>
                  <p className="text-xs text-slate-400">
                    מחשב ציוני התאמה לסגנון, בונה מארזים חסכוניים ומשקלל הנחות כמות
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Result Top Summary */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <div>
                    <h4 className="font-bold text-emerald-300 text-sm">
                      נמצאו {curatedBundles.length} מארזי מתנה אולטימטיביים בהתאמה אישית
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      עבור {curatedBundles[0]?.recipient} • לכבוד {curatedBundles[0]?.occasion}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentStep(1);
                      setCuratedBundles([]);
                    }}
                    className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>התחל שאלון מחדש</span>
                  </button>
                </div>

                {/* Bundles List */}
                <div className="space-y-5">
                  {curatedBundles.map((bundle) => {
                    const isAdded = addedBundleId === bundle.id;
                    return (
                      <div
                        key={bundle.id}
                        className="p-5 sm:p-6 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-4 relative overflow-hidden shadow-xl"
                      >
                        {/* Top Badge & Match Score */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{bundle.matchScore}% התאמת AI</span>
                            </span>
                            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                              חיסכון {bundle.discountPct}% במארז
                            </span>
                          </div>
                          <div className="text-left font-mono">
                            <div className="text-lg font-black text-white">{formatPrice(bundle.bundlePrice)}</div>
                            <div className="text-xs text-slate-500 line-through">{formatPrice(bundle.originalPrice)}</div>
                          </div>
                        </div>

                        {/* Title & AI Explanation */}
                        <div>
                          <h5 className="text-base font-black text-white">{bundle.title}</h5>
                          <p className="text-xs text-slate-400 mt-0.5">{bundle.subtitle}</p>
                          <div className="mt-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                            <strong className="text-emerald-400 block mb-0.5">ניתוח ה-AI Stylist:</strong>
                            {bundle.aiExplanation}
                          </div>
                        </div>

                        {/* Items in Bundle */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {bundle.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3"
                            >
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-slate-200 truncate">{item.name}</div>
                                <div className="text-[11px] font-mono text-emerald-400 mt-0.5">{formatPrice(item.price)}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Included Gifts */}
                        <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-emerald-400">
                          {bundle.freeGifts.map((fg, i) => (
                            <span key={i} className="flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>{fg}</span>
                            </span>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                          <Button
                            type="button"
                            onClick={() => handleAddBundleToCart(bundle)}
                            className={`w-full font-black py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs transition-all ${
                              isAdded
                                ? "bg-emerald-500 text-slate-950"
                                : "bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-md shadow-emerald-600/20"
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <PackageCheck className="w-4 h-4" />
                                <span>המארז נוסף לעגלת הקניות!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-4 h-4" />
                                <span>הוסף מארז שלם לעגלה (קליק אחד)</span>
                              </>
                            )}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleStartSharedGifting(bundle)}
                            className="w-full border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs"
                          >
                            <HeartHandshake className="w-4 h-4 text-indigo-400" />
                            <span>פתח קמפיין מתנה משותפת עם חברים</span>
                          </Button>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
export default AiGiftFinderModal;
