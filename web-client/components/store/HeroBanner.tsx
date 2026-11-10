"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Star, Zap } from "lucide-react";

export const HeroBanner: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});

  const slides = [
    {
      id: "iphone-16-pro",
      badge: "NEW ARRIVAL • השקה בלעדית",
      title: "iPhone 16 Pro",
      tagline: "More Power. More Possibilities.",
      subtitle: "עוצמה בלתי מתפשרת, שלדת טיטניום תעופתית קלת משקל, שבב A18 Pro פורץ דרך ומערך מצלמות 48MP Fusion מתקדם עם בקרת מצלמה חדשה.",
      ctaText: "קנה עכשיו",
      ctaLink: "/cart",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-deserttitanium?wid=5120&hei=2880&fmt=p-jpg",
      fallbackImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80",
      colorTag: "Desert Titanium • טיטניום מדברי",
      startingPrice: "החל מ-₪4,899",
      rating: "4.9 (3,420 ביקורות)",
    },
    {
      id: "galaxy-s24-ultra",
      badge: "GALAXY AI IS HERE",
      title: "Samsung Galaxy S24 Ultra",
      tagline: "עידן חדש של בינה מלאכותית בסלולר.",
      subtitle: "שלדת טיטניום יוקרתית, מעבד Snapdragon 8 Gen 3 for Galaxy, עט S-Pen מובנה ומערך מצלמות 200MP ProVisual עם זום אופטי כפול.",
      ctaText: "גלה את הגלקסי",
      ctaLink: "/cart",
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80",
      fallbackImage: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
      colorTag: "Titanium Gray • אפור טיטניום",
      startingPrice: "החל מ-₪4,499",
      rating: "4.8 (2,890 ביקורות)",
    },
    {
      id: "macbook-pro-m3",
      badge: "M3 MAX • ביצועי על למקצוענים",
      title: "MacBook Pro 16\" M3 Max",
      tagline: "מפלצת עוצמה בגימור שחור חלל.",
      subtitle: "מסך Liquid Retina XDR מרהיב, חיי סוללה של עד 22 שעות, תמיכה בעד 128GB זיכרון אחיד ושלדת אלומיניום עמידה לטביעות אצבע.",
      ctaText: "שדרג ל-Mac",
      ctaLink: "/cart",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
      fallbackImage: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1200&q=80",
      colorTag: "Space Black • שחור חלל",
      startingPrice: "החל מ-₪11,999",
      rating: "5.0 (1,150 ביקורות)",
    },
    {
      id: "watch-ultra-2",
      badge: "ADVENTURE AWAITS",
      title: "Apple Watch Ultra 2",
      tagline: "השעון החזק והעמיד ביותר אי פעם.",
      subtitle: "שלדת טיטניום 49 מ\"מ, עמידות במים עד 100 מטרים, בהירות מסך מדהימה של 3,000 ניט, GPS מדויק בתדר כפול ועד 72 שעות סוללה במצב חסכון.",
      ctaText: "לפרטי השעון",
      ctaLink: "/cart",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
      fallbackImage: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=80",
      colorTag: "Natural Titanium • טיטניום טבעי",
      startingPrice: "החל מ-₪3,499",
      rating: "4.9 (870 ביקורות)",
    },
    {
      id: "sony-wh1000xm5",
      badge: "INDUSTRY LEADING NOISE CANCELING",
      title: "Sony WH-1000XM5",
      tagline: "חוויית שמע צלולה ללא הפרעות.",
      subtitle: "מעבד V1 משולב עם 8 מיקרופונים לסינון רעשים מושלם, תמיכה באודיו High-Res אלחוטי, עיצוב נוח במיוחד וחיי סוללה של עד 30 שעות.",
      ctaText: "האזן עכשיו",
      ctaLink: "/cart",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
      fallbackImage: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
      colorTag: "Silver Platinum • כסף פלטינום",
      startingPrice: "החל מ-₪1,299",
      rating: "4.8 (4,120 ביקורות)",
    },
  ];

  // Auto-advance slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[activeSlide];

  return (
    <div
      dir="rtl"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#060b1c] via-[#0b1536] to-[#040817] text-white shadow-2xl border border-slate-800/80"
    >
      {/* Ambient Sapphire Glow Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left / Text Content (7 Cols in RTL: Right side visually) */}
          <div className="lg:col-span-7 space-y-6 text-right">
            
            {/* New Arrival Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-mono font-bold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>{current.badge}</span>
            </div>

            {/* Giant Title */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                {current.title}
              </h1>
              <p className="text-lg sm:text-xl font-bold text-blue-200/90 tracking-wide">
                {current.tagline}
              </p>
            </div>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-300/90 max-w-xl leading-relaxed">
              {current.subtitle}
            </p>

            {/* Rating & Trust micro stats */}
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{current.rating}</span>
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">משלוח חינם עד הבית</span>
              <span>•</span>
              <span className="text-slate-300">אחריות רשמית</span>
            </div>

            {/* Price & CTA Row */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href={current.ctaLink}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm sm:text-base shadow-xl shadow-blue-600/30 transition-all transform active:scale-95 cursor-pointer"
              >
                <span>{current.ctaText}</span>
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-[10px] text-slate-400 block font-mono">מחיר השקה בלעדי</span>
                <span className="text-base font-black text-amber-300 font-mono">{current.startingPrice}</span>
              </div>
            </div>

            {/* Product Quick-Select Thumbnails / Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800/80">
              {slides.map((s, idx) => {
                const isSelected = activeSlide === idx;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-105"
                        : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    <span>{s.title.split(" ")[0]} {s.title.split(" ")[1] || ""}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right / Product Showcase Image (5 Cols in RTL: Left side visually) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
              
              {/* Product Glow Frame */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-blue-600/25 via-indigo-500/20 to-transparent blur-3xl pointer-events-none" />

              <img
                src={imgErrorMap[current.id] ? current.fallbackImage : current.image}
                alt={current.title}
                onError={() => setImgErrorMap((prev) => ({ ...prev, [current.id]: true }))}
                className="relative z-10 w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(37,99,235,0.4)] transform transition-transform duration-700 hover:scale-105"
              />

              {/* Slide Navigation Arrows */}
              <div className="absolute bottom-2 left-2 flex items-center gap-2 z-20">
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1))}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white backdrop-blur-md transition active:scale-90 cursor-pointer"
                  title="הקודם"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white backdrop-blur-md transition active:scale-90 cursor-pointer"
                  title="הבא"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              {/* Color badge */}
              <div className="absolute top-2 right-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-[11px] font-medium text-slate-300">
                {current.colorTag}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
