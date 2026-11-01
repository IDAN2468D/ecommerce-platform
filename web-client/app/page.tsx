"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  ShoppingCart, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Search, 
  PlusCircle, 
  X, 
  CheckCircle2, 
  AlertCircle,
  PackagePlus,
  SlidersHorizontal,
  Scale,
  Star,
  ArrowUpDown,
  Filter,
  Check,
} from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/ui/Button";
import { useCurrency } from "../context/CurrencyContext";
import { HeroBanner } from "../components/store/HeroBanner";
import { TrustBadges } from "../components/store/TrustBadges";

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
  const { formatPrice, symbol } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("הכל");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name" | "stock">("featured");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Comparison tray state
  const [comparedSkus, setComparedSkus] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Add Product modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSku, setNewSku] = useState("");
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newQuantity, setNewQuantity] = useState("50");
  const [newCategory, setNewCategory] = useState("סמארטפונים");
  const [newDescription, setNewDescription] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        const mapped: Product[] = data.map((item: any) => ({
          skuCode: item.skuCode,
          name: item.productName,
          price: Number(item.unitPrice),
          description: item.description || "מוצר איכותי מקורי עם אחריות יבואן רשמי",
          image: item.imageUrl || "📦",
          category: item.category || "כללי",
          stock: {
            availableQuantity: item.availableQuantity,
            reservedQuantity: item.reservedQuantity,
          },
        }));
        setProducts(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch products:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
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
      if (prev.includes(sku)) {
        return prev.filter((s) => s !== sku);
      }
      if (prev.length >= 3) {
        alert("ניתן להשוות עד 3 מוצרים במקביל");
        return prev;
      }
      return [...prev, sku];
    });
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory =
          selectedCategory === "הכל" || p.category === selectedCategory;
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.skuCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMinPrice = minPrice === "" || p.price >= Number(minPrice);
        const matchesMaxPrice = maxPrice === "" || p.price <= Number(maxPrice);
        const matchesStock = !onlyInStock || (p.stock && p.stock.availableQuantity > 0);

        return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "name") return a.name.localeCompare(b.name, "he");
        if (sortBy === "stock") return (b.stock?.availableQuantity || 0) - (a.stock?.availableQuantity || 0);
        return 0;
      });
  }, [products, selectedCategory, searchQuery, minPrice, maxPrice, onlyInStock, sortBy]);

  const addToCart = (product: Product & { quantity?: number }) => {
    if (typeof window === "undefined") return;
    const qtyToAdd = product.quantity || 1;
    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = currentCart.findIndex((item: any) => item.skuCode === product.skuCode);

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += qtyToAdd;
    } else {
      currentCart.push({
        skuCode: product.skuCode,
        name: product.name,
        price: product.price,
        quantity: qtyToAdd,
        image: product.image,
      });
    }

    localStorage.setItem("cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku || !newName || !newPrice) {
      setFormMessage({ type: "error", text: "נא למלא את כל שדות החובה: מקט, שם מוצר ומחיר" });
      return;
    }

    setFormSubmitting(true);
    setFormMessage(null);

    try {
      const payload = {
        skuCode: newSku.trim().toUpperCase(),
        productName: newName.trim(),
        quantity: parseInt(newQuantity) || 10,
        unitPrice: parseFloat(newPrice),
        category: newCategory.trim() || "סמארטפונים",
        description: newDescription.trim() || "מוצר איכותי מקורי עם אחריות יבואן רשמי",
        imageUrl: newImageUrl.trim() || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("שגיאה ביצירת המוצר בשרת");
      }

      setFormMessage({ type: "success", text: "המוצר נוסף בהצלחה לקטלוג והקאש רוענן!" });
      setNewSku("");
      setNewName("");
      setNewPrice("");
      setNewDescription("");
      setNewImageUrl("");

      await fetchCatalog();
      setTimeout(() => {
        setIsAddModalOpen(false);
        setFormMessage(null);
      }, 1500);
    } catch (err: any) {
      setFormMessage({ type: "error", text: err.message || "שגיאה ביצירת המוצר" });
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Premium Consumer Hero Banner */}
      <HeroBanner />

      {/* Trust & Guarantee Badges */}
      <TrustBadges />

      {/* Multi-Dimensional Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-3">
        {/* Search Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם מוצר, מקט או מפרט..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="flex items-center justify-between w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold active:scale-98 transition"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600 dark:text-amber-400" />
              <span>מסננים ומיון מתקדם</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-amber-400 border border-brand-500/20">
              {isMobileFiltersOpen ? "הסתר ▲" : "הצג מסננים ▼"}
            </span>
          </button>
        </div>

        {/* Filters Row (Always visible on desktop, toggleable on mobile) */}
        <div className={`flex-wrap items-center gap-3 text-xs ${isMobileFiltersOpen ? "flex" : "hidden lg:flex"}`}>
          {/* Price Range */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 font-medium">מחיר:</span>
            <input
              type="number"
              placeholder="מ-"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")}
              className="w-14 p-1 text-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              placeholder="עד"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
              className="w-14 p-1 text-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs"
            />
            <span className="text-slate-400 font-bold">{symbol}</span>
          </div>

          {/* In-Stock Toggle */}
          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 select-none">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
            />
            <span className="font-semibold text-slate-700 dark:text-slate-300">במלאי בלבד</span>
          </label>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-medium outline-none cursor-pointer text-xs"
            >
              <option value="featured">מומלץ</option>
              <option value="price-asc">מחיר: מהנמוך לגבוה</option>
              <option value="price-desc">מחיר: מהגבוה לנמוך</option>
              <option value="name">שם מוצר (א-ת)</option>
              <option value="stock">זמינות במלאי</option>
            </select>
          </div>
        </div>

        {/* Horizontal Scrolling Categories Pills for Mobile Thumb Flicking */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 scroll-smooth">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 active:scale-95 ${
                selectedCategory === cat
                  ? "bg-slate-900 dark:bg-brand-600 text-white shadow-sm ring-2 ring-amber-400/40"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">מוצרים זמינים במחסן המרכזי</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">מוזן בזמן אמת מ-API של Inventory Service בפורט 8082 דרך Spring Cloud Gateway</p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
            נמצאו {filteredProducts.length} מתוך {products.length} פריטים
          </span>
        </div>

        {/* Zero-CLS Skeleton Loader during load */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-[430px] rounded-3xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between p-5"
              >
                <div className="space-y-4">
                  <div className="h-44 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
                <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-5xl">🔍</div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">לא נמצאו מוצרים התואמים את הסינון</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">נסה לשנות את מילת החיפוש או לאפס את טווח המחירים</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("הכל");
                setMinPrice("");
                setMaxPrice("");
                setOnlyInStock(false);
              }}
            >
              איפוס כל הסינונים
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
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
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Product Comparison Tray */}
      {comparedSkus.length > 0 && (
        <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-6 sm:left-6 z-40 max-w-2xl mx-auto bg-slate-900/95 text-white p-4 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-md flex items-center justify-between gap-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xs font-bold">השוואת מוצרים פעילה ({comparedSkus.length}/3)</h4>
              <p className="text-[11px] text-slate-400 font-mono">
                {comparedSkus.join(" • ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition"
            >
              פתח השוואה מפורטת
            </button>
            <button
              onClick={() => setComparedSkus([])}
              className="p-2 text-slate-400 hover:text-slate-200"
              title="נקה בחירה"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detailed Product Comparison Modal */}
      {isCompareModalOpen && (
        <div
          onClick={() => setIsCompareModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-slate-100 text-lg">
                <Scale className="w-5 h-5 text-brand-600" />
                <span>השוואת מפרט מוצרים (Multi-Product Spec Comparison)</span>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparedSkus.map((sku) => {
                const item = products.find((p) => p.skuCode === sku);
                if (!item) return null;
                return (
                  <div
                    key={sku}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="h-36 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden">
                        {item.image.startsWith("http") ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-6xl">{item.image}</span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-600 font-bold">
                        {item.skuCode}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.description}</p>
                      
                      <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                        {formatPrice(item.price)}
                      </div>
                      
                      <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div>קטגוריה: <strong>{item.category}</strong></div>
                        <div>זמינות: <strong className="text-emerald-600">{item.stock?.availableQuantity || 0} יח׳</strong></div>
                        <div>דירוג: <strong className="text-amber-500">4.8 ★</strong></div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        addToCart(item);
                        window.dispatchEvent(new Event("open-cart-drawer"));
                      }}
                      className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition"
                    >
                      הוסף לסל
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">הוספת מוצר חדש ל-API</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">הזן פרטים ותמונה אמיתית שתסונכרן ב-Kafka וב-PostgreSQL</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formMessage && (
              <div
                className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
                  formMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {formMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{formMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">מקט מוצר (SKU) *</label>
                  <input
                    type="text"
                    required
                    placeholder="למשל: SONY-A7-IV"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-mono uppercase focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">קטגוריה *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  >
                    <option value="סמארטפונים">סמארטפונים</option>
                    <option value="מחשבים ניידים">מחשבים ניידים</option>
                    <option value="אודיו">אודיו</option>
                    <option value="שעונים חכמים">שעונים חכמים</option>
                    <option value="גיימינג">גיימינג</option>
                    <option value="טאבלטים">טאבלטים</option>
                    <option value="אביזרים">אביזרים</option>
                    <option value="רחפנים">רחפנים</option>
                    <option value="צילום">צילום</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">שם המוצר המלא *</label>
                <input
                  type="text"
                  required
                  placeholder="למשל: Sony Alpha 7 IV Full-Frame Mirrorless Camera"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">מחיר ליחידה (₪) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="למשל: 7999.00"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">כמות מלאי התחלתית *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">כתובת תמונה אמיתית (URL)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-mono text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">הדבק קישור ישיר לתמונה מ-Unsplash או CDN</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">תיאור ומפרט המוצר</label>
                <textarea
                  rows={2}
                  placeholder="תיאור קצר ומפרט טכני של המוצר..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  ביטול
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={formSubmitting}
                  icon={<PlusCircle className="w-4 h-4" />}
                >
                  הוסף מוצר ל-API
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}