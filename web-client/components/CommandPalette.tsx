"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Search,
  Package,
  ShoppingCart,
  Store,
  Sun,
  Moon,
  Tag,
  Crown,
  Command,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface ProductItem {
  skuCode: string;
  productName: string;
  category: string;
  unitPrice: number;
  availableQuantity: number;
  imageUrl?: string;
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  // Listen for keyboard shortcut (Cmd+K / Ctrl+K) and custom event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    const handleOpen = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleOpen);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleOpen);
    };
  }, [isOpen]);

  // Fetch products on open
  useEffect(() => {
    if (isOpen && products.length === 0) {
      fetch("/api/products")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setProducts(data);
        })
        .catch(() => {});
    }
  }, [isOpen, products.length]);

  if (!isOpen) return null;

  const filteredProducts = products
    .filter(
      (p) =>
        p.productName.toLowerCase().includes(query.toLowerCase()) ||
        p.skuCode.toLowerCase().includes(query.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
    )
    .slice(0, 5);

  const navigateTo = (path: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(path);
  };

  const applyDemoCoupon = () => {
    setIsOpen(false);
    sessionStorage.setItem("pending_coupon", "WELCOME10");
    router.push("/cart");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפש מוצרים, פעולות מהירות, עמודים או קופונים... (Esc ליציאה)"
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
          {/* Products match section */}
          {filteredProducts.length > 0 && (
            <div className="pt-2 first:pt-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">
                מוצרים מהקטלוג
              </span>
              <div className="space-y-1">
                {filteredProducts.map((product) => (
                  <button
                    key={product.skuCode}
                    onClick={() => navigateTo(`/?sku=${product.skuCode}`)}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-right group"
                  >
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.productName}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-slate-800 flex items-center justify-center text-brand-600">
                          📦
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                          {product.productName}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          מק״ט: {product.skuCode} • {product.category || "מוצר"}
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                        ₪{product.unitPrice}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {product.availableQuantity > 0 ? `במלאי: ${product.availableQuantity}` : "אזל מהמלאי"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">
              ניווט מהיר
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => navigateTo("/")}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 text-right transition"
              >
                <Store className="w-4 h-4 text-brand-600" />
                <span>קטלוג מוצרים</span>
              </button>
              <button
                onClick={() => navigateTo("/cart")}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 text-right transition"
              >
                <ShoppingCart className="w-4 h-4 text-indigo-600" />
                <span>עגלת קניות</span>
              </button>
              <button
                onClick={() => navigateTo("/orders")}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 text-right transition"
              >
                <Package className="w-4 h-4 text-emerald-600" />
                <span>הזמנות ומעקב משלוחים</span>
              </button>
              <button
                onClick={applyDemoCoupon}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 text-right transition"
              >
                <Tag className="w-4 h-4 text-amber-500" />
                <span>הפעל קופון WELCOME10</span>
              </button>
            </div>
          </div>

          {/* Theme & Settings */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">
              ערכת נושא
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme("dark")}
                className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>מצב כהה (Dark)</span>
              </button>
              <button
                onClick={() => setTheme("light")}
                className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
              >
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>מצב בהיר (Light)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>למעבר מהיר: <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">↵</kbd></span>
            <span>לסגירה: <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">ESC</kbd></span>
          </div>
          <span className="font-mono text-brand-600 dark:text-brand-400">Ctrl+K / ⌘+K</span>
        </div>
      </div>
    </div>
  );
};
