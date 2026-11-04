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
    return ["הכל", ...Array.from(set)];
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
    return products
      .filter((p) => {
        const matchesCat = selectedCategory === "הכל" || p.category === selectedCategory;
        const pName = (p.name || "").toLowerCase();
        const pSku = (p.skuCode || "").toLowerCase();
        const pDesc = (p.description || "").toLowerCase();
        const matchesQuery = !q || pName.includes(q) || pSku.includes(q) || pDesc.includes(q);
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
