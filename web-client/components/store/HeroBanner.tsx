"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Zap } from "lucide-react";

export const HeroBanner: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      id: "iphone-16-pro",
      badge: "NEW ARRIVAL • השקה חדשה",
      title: "iPhone 16 Pro",
      tagline: "More Power. More Possibilities.",
      subtitle: "עוצמה בלתי מתפשרת, שלדת טיטניום תעופתית קלת משקל, שבב A18 Pro פורץ דרך ומערך מצלמות 48MP Fusion מתקדם.",
      ctaText: "קנה עכשיו",
      ctaLink: "/cart",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-deserttitanium?wid=5120&hei=2880&fmt=p-jpg",
      colorTag: "Desert Titanium • טיטניום מדברי",
      startingPrice: "החל מ-₪4,899",
    },
    {
      id: "galaxy-s24-ultra",
      badge: "GALAXY AI IS HERE",
      title: "Samsung Galaxy S24 Ultra",
      tagline: "עידן חדש של בינה מלאכותית בסלולר.",
      subtitle: "שלדת טיטניום יוקרתית, מעבד Snapdragon 8 Gen 3 for Galaxy, עט S-Pen מובנה ומערך מצלמות 200MP עם זום אופטי כפול.",
      ctaText: "גלה את המבצע",
      ctaLink: "/cart",
      image: "https://images.samsung.com/is/image/samsung/p6pim/il/2401/gallery/il-galaxy-s24-s928-sm-s928bztcmea-thumb-539304192",
      colorTag: "Titanium Gray • אפור טיטניום",
      startingPrice: "החל מ-₪4,499",
    },
  ];

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
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none">
                {current.title}
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-blue-200/90 tracking-wide">
                {current.tagline}
              </p>
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300/90 max-w-xl leading-relaxed">
              {current.subtitle}
            </p>

            {/* Price & CTA Row */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href={current.ctaLink}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-base shadow-xl shadow-blue-600/30 transition-all transform active:scale-95 cursor-pointer"
              >
                <span>{current.ctaText}</span>
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-[11px] text-slate-400 block font-mono">מחיר השקה</span>
                <span className="text-base font-black text-amber-300 font-mono">{current.startingPrice}</span>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center gap-2 pt-4">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeSlide === idx ? "w-8 bg-blue-500" : "w-2 bg-slate-700 hover:bg-slate-500"
                  }`}
                  title={`שקופית ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right / Product Showcase Image (5 Cols in RTL: Left side visually) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
              
              {/* Product Glow Frame */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-blue-600/20 via-indigo-500/20 to-transparent blur-2xl pointer-events-none" />

              <img
                src={current.image}
                alt={current.title}
                className="relative z-10 w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(37,99,235,0.35)] transform transition-transform duration-700 hover:scale-105"
              />

              {/* Slide Navigation Arrows */}
              <div className="absolute bottom-2 left-2 flex items-center gap-2 z-20">
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1))}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white backdrop-blur-md transition active:scale-90 cursor-pointer"
                  title="הקודם"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white backdrop-blur-md transition active:scale-90 cursor-pointer"
                  title="הבא"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              {/* Color badge */}
              <div className="absolute top-2 right-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-[11px] font-medium text-slate-300">
                {current.colorTag}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
