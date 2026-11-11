"use client";

import React, { useEffect, useState, useMemo } from "react";
import { HeroBanner } from "../components/store/HeroBanner";
import { TrustBadges } from "../components/store/TrustBadges";
import { CatalogFilterBar } from "../components/store/CatalogFilterBar";
import { ProductCard } from "../components/store/ProductCard";
import { ProductQuickViewModal, QuickViewProduct } from "../components/store/ProductQuickViewModal";
import { ProductComparisonModal } from "../components/store/ProductComparisonModal";

interface Product {
  skuCode: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock?: {
    availableQuantity: number;
    reservedQuantity: number;
  };
  tags?: string[];
  liquidGlassSpecs?: any;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("הכל");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name" | "stock">("featured");

  // Single modal instance states
  const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null);
  const [comparedSkus, setComparedSkus] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadProducts = async (attempt = 1) => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          if (attempt < 3 && mounted) {
            setTimeout(() => loadProducts(attempt + 1), 1500);
            return;
          }
        }
        if (mounted && Array.isArray(data)) {
          const mapped = data.map((item: any) => ({
            skuCode: String(item.skuCode || ""),
            name: String(item.productName || item.name || item.skuCode || "מוצר איכותי"),
            price: Number(item.unitPrice || item.price || 0),
            description: String(item.description || "מוצר איכותי מקורי עם אחריות יבואן רשמי"),
            image: String(item.imageUrl || item.image || "📦"),
            category: String(item.category || "כללי"),
            stock: {
              availableQuantity: Number(item.availableQuantity ?? item.stock?.availableQuantity ?? 10),
              reservedQuantity: Number(item.reservedQuantity ?? item.stock?.reservedQuantity ?? 0),
            },
            tags: Array.isArray(item.tags) ? item.tags : [],
            liquidGlassSpecs: item.liquidGlassSpecs || null,
          }));
          setProducts(mapped);
          setLoading(false);
        }
      } catch (e) {
        console.error("Failed to fetch products:", e);
        if (attempt < 3 && mounted) {
          setTimeout(() => loadProducts(attempt + 1), 1500);
        } else if (mounted) {
          setLoading(false);
        }
      }
    };
    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    const primaryOrder = ["הכל", "FASHION", "CLOTHING", "ACCESSORIES"];
    const otherCats = Array.from(set).filter((c) => !primaryOrder.includes(c));
    return [...primaryOrder.filter((c) => c === "הכל" || set.has(c)), ...otherCats];
  }, [products]);

  const toggleCompare = (sku: string) => {
    setComparedSkus((prev) => {
      if (prev.includes(sku)) return prev.filter((s) => s !== sku);
      if (prev.length >= 3) {
        alert("ניתן להשוות עד 3 מוצרים במקביל");
        return prev;
      }
      return [...prev, sku];
    });
  };

  const filteredProducts = useMemo(() => {
    const q = (searchQuery || "").toLowerCase();
    const selCatLower = selectedCategory.toLowerCase();
    return products
      .filter((p) => {
        const matchesCat =
          selectedCategory === "הכל" ||
          p.category.toLowerCase() === selCatLower ||
          (p.tags && p.tags.some((t: string) => t.toLowerCase() === selCatLower));
        const pName = (p.name || "").toLowerCase();
        const pSku = (p.skuCode || "").toLowerCase();
        const pDesc = (p.description || "").toLowerCase();
        const pTags = (p.tags || []).join(" ").toLowerCase();
        const matchesQuery = !q || pName.includes(q) || pSku.includes(q) || pDesc.includes(q) || pTags.includes(q);
        const matchesMin = minPrice === "" || (p.price || 0) >= Number(minPrice);
        const matchesMax = maxPrice === "" || (p.price || 0) <= Number(maxPrice);
        const matchesStock = !onlyInStock || ((p.stock?.availableQuantity || 0) > 0);
        return matchesCat && matchesQuery && matchesMin && matchesMax && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
        if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
        if (sortBy === "name") return String(a.name || "").localeCompare(String(b.name || ""), "he");
        if (sortBy === "stock") return (b.stock?.availableQuantity || 0) - (a.stock?.availableQuantity || 0);
        return 0;
      });
  }, [products, selectedCategory, searchQuery, minPrice, maxPrice, onlyInStock, sortBy]);

  const addToCart = (product: Product & { quantity?: number }) => {
    if (typeof window === "undefined") return;
    const qty = product.quantity || 1;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx = cart.findIndex((i: any) => i.skuCode === product.skuCode);
    if (idx > -1) {
      cart[idx].quantity += qty;
    } else {
      cart.push({ ...product, quantity: qty });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("הכל");
    setMinPrice("");
    setMaxPrice("");
    setOnlyInStock(false);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Cinematic Hero Banner */}
      <HeroBanner />

      {/* 2. Customer Trust Strip */}
      <TrustBadges />

      {/* 3. Catalog Filter Toolbar */}
      <CatalogFilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        minPrice={minPrice}
        onMinPriceChange={setMinPrice}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
        onlyInStock={onlyInStock}
        onToggleOnlyInStock={() => setOnlyInStock(!onlyInStock)}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Product Grid Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">מוצרים נבחרים בקטלוג</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">משלוח מהיר עד פתח הבית, צבירת 5% Cashback VIP ואחריות יבואן רשמית</p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            נמצאו {filteredProducts.length} מתוך {products.length} פריטים
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[560px] rounded-3xl bg-slate-100 dark:bg-slate-900/60 animate-pulse border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="h-72 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                </div>
                <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-5xl">🔍</div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">לא נמצאו מוצרים התואמים את הסינון</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">נסה לאפס או לשנות את מילת החיפוש</p>
            <button onClick={handleResetFilters} className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold">
              איפוס כל הסינונים
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.skuCode}
                skuCode={product.skuCode}
                name={product.name}
                price={product.price}
                description={product.description}
                image={product.image}
                category={product.category}
                stock={product.stock}
                tags={product.tags}
                liquidGlassSpecs={product.liquidGlassSpecs}
                onAddToCart={addToCart}
                isCompared={comparedSkus.includes(product.skuCode)}
                onToggleCompare={toggleCompare}
                onOpenQuickView={setQuickViewProduct}
                isFeatured={idx === 0 || idx === 2}
              />
            ))}
          </div>
        )}
      </div>

      {/* TechNova Promotional Banner (Up to 30% Off) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 border border-blue-500/30 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
          <div className="space-y-4 text-right">
            <span className="px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-mono font-bold">
              מבצע לזמן מוגבל • LIMITED TIME OFFER
            </span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
              עד 30% הנחה על סמארטפונים נבחרים
            </h3>
            <p className="text-sm text-slate-300 max-w-md">
              שדרגו לדגמי הדגל המובילים בעולם במחירים חסרי תקדים, פריסה ל-4 תשלומים ללא ריבית ומשלוח אקספרס עד פתח הבית חינם.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("סמארטפונים");
                  window.scrollTo({ top: 700, behavior: "smooth" });
                }}
                className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition transform active:scale-95 cursor-pointer"
              >
                צפה במבצעים עכשיו ←
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center space-y-2">
              <span className="text-4xl sm:text-6xl">📱✨</span>
              <div className="text-lg font-bold text-blue-200">Better. Faster. Smarter. ♡</div>
              <p className="text-xs text-slate-400">אחריות יבואן רשמי ל-24 חודשים בכל רכישה</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shop by Brand Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">קנה לפי מותג מוביל</h3>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer">
            צפה בכל המותגים ←
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { name: "Apple", logo: "🍎", count: "12 דגמים" },
            { name: "Samsung", logo: "🪐", count: "18 דגמים" },
            { name: "Google", logo: "🌐", count: "8 דגמים" },
            { name: "OnePlus", logo: "⚡", count: "6 דגמים" },
            { name: "Xiaomi", logo: "🟧", count: "14 דגמים" },
            { name: "Sony", logo: "🎧", count: "9 דגמים" },
          ].map((brand) => (
            <button
              key={brand.name}
              type="button"
              onClick={() => {
                setSearchQuery(brand.name);
                window.scrollTo({ top: 700, behavior: "smooth" });
              }}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 transition-all text-center space-y-1 shadow-sm hover:shadow-md cursor-pointer group"
            >
              <div className="text-2xl group-hover:scale-110 transition-transform">{brand.logo}</div>
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{brand.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">{brand.count}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Stay Connected Newsletter Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 border border-slate-800 text-center space-y-4">
        <div className="max-w-xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-blue-400">NEWSLETTER & VIP OFFERS</span>
          <h3 className="text-2xl sm:text-3xl font-black">הישאר מחובר להשקות והנחות בלעדיות</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            הירשם לניוזלטר של TechNova וקבל שובר ₪100 לרכישה הראשונה והטבות VIP מוקדמות.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
            <input
              type="email"
              placeholder="הזן כתובת דוא״ל..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
            />
            <button
              type="button"
              onClick={() => alert("תודה שנרשמת! שובר ההטבה נשלח לתיבת הדוא״ל שלך.")}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              הרשמה
            </button>
          </div>
        </div>
      </div>

      {/* 5. Standalone Quick View & Reviews Modal (Single Instance) */}
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={addToCart}
      />

      {/* 6. Product Comparison Modal & Bottom Tray */}
      <ProductComparisonModal
        products={products}
        comparedSkus={comparedSkus}
        isModalOpen={isCompareModalOpen}
        onOpenModal={() => setIsCompareModalOpen(true)}
        onCloseModal={() => setIsCompareModalOpen(false)}
        onRemoveSku={(sku) => setComparedSkus((prev) => prev.filter((s) => s !== sku))}
        onClearAll={() => setComparedSkus([])}
        onAddToCart={addToCart}
      />
    </div>
  );
}
