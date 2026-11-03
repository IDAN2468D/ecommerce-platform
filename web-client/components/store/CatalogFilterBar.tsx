"use client";

import React from "react";
import { Search, ArrowUpDown, Filter, X, SlidersHorizontal, Mic, MicOff, Camera, ChevronDown, Check } from "lucide-react";
import { Button } from "../ui/Button";

const SORT_OPTIONS: { id: "featured" | "price-asc" | "price-desc" | "name" | "stock"; label: string }[] = [
  { id: "featured", label: "מומלץ לחברי VIP" },
  { id: "price-asc", label: "מחיר: מהנמוך לגבוה" },
  { id: "price-desc", label: "מחיר: מהגבוה לנמוך" },
  { id: "name", label: "שם מוצר (א-ת)" },
  { id: "stock", label: "זמינות מלאי במרלו״ג" },
];

export interface CatalogFilterBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  minPrice: number | "";
  onMinPriceChange: (val: number | "") => void;
  maxPrice: number | "";
  onMaxPriceChange: (val: number | "") => void;
  onlyInStock: boolean;
  onToggleOnlyInStock: () => void;
  sortBy: "featured" | "price-asc" | "price-desc" | "name" | "stock";
  onSortChange: (sort: any) => void;
  onResetFilters: () => void;
}

export const CatalogFilterBar: React.FC<CatalogFilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  onlyInStock,
  onToggleOnlyInStock,
  sortBy,
  onSortChange,
  onResetFilters,
}) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [isSortOpen, setIsSortOpen] = React.useState(false);
  const sortRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleVoiceSearch = () => {
    if (typeof window === "undefined") return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      window.dispatchEvent(new Event("open-command-palette"));
      return;
    }
    const recognition = new SpeechRec();
    recognition.lang = "he-IL";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript;
      if (transcript) {
        onSearchChange(transcript);
      }
    };
    recognition.start();
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "הכל" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    onlyInStock;

  return (
    <div className="space-y-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-lg">
      {/* Top Row: Search & Fast Sort & Toggle Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input + Voice & Visual Search */}
        <div className="relative flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isListening ? "מקשיב... דבר כעת לחיפוש קולי" : "חיפוש לפי שם מוצר, מק״ט, חיפוש קולי או תמונה..."}
              className="w-full pl-9 pr-11 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleVoiceSearch}
            title="חיפוש קולי (Web Speech API)"
            className={`p-2.5 rounded-2xl border transition shrink-0 ${
              isListening
                ? "bg-rose-500 text-white border-rose-500 animate-pulse"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-500"
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
            title="חיפוש ויזואלי לפי תמונה (Multimodal Command Palette)"
            className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition shrink-0"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Advanced Filter Toggle Button */}
          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition ${
              isFilterPanelOpen || hasActiveFilters
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>סינון מתקדם</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

          {/* Custom Modern Sort Dropdown (Replacing native select for 100% theme control) */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen((v) => !v)}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 transition-all active:scale-95 shadow-xs"
              title="מיון מוצרים"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{SORT_OPTIONS.find((o) => o.id === sortBy)?.label || "מומלץ לחברי VIP"}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Custom Dropdown Floating Menu with 100% Contrast & Liquid Glass Style */}
            {isSortOpen && (
              <div
                className="absolute end-0 top-full mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50 animate-fade-in backdrop-blur-xl"
                dir="rtl"
              >
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-2.5 py-1 font-mono uppercase tracking-wider">
                  מיון לפי
                </div>
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = sortBy === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onSortChange(opt.id);
                        setIsSortOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition text-right ${
                        isSelected
                          ? "bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filter Drawer (Price Range & In-Stock) */}
      {isFilterPanelOpen && (
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">מחיר מ:</span>
            <input
              type="number"
              placeholder="₪0"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value ? Number(e.target.value) : "")}
              className="w-24 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none text-xs"
            />
            <span className="text-slate-500 dark:text-slate-400 font-medium">עד:</span>
            <input
              type="number"
              placeholder="₪10,000"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value ? Number(e.target.value) : "")}
              className="w-24 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={onToggleOnlyInStock}
                className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
              />
              <span>הצג פריטים במלאי מיידי בלבד</span>
            </label>
          </div>

          <div className="flex justify-end items-center">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onResetFilters} className="text-xs text-rose-500 hover:text-rose-600">
                איפוס סינונים
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Category Pills (Horizontal Scrollable) */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 scroll-smooth">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 active:scale-95 ${
              selectedCategory === cat
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};
