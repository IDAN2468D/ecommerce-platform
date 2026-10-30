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
  SlidersHorizontal
} from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/ui/Button";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New product form state
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

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "הכל" || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.skuCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

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
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>פלטפורמת מיקרו-שירותים מבוזרת (EDA + Kafka + Next.js)</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            קטלוג מוצרי פרימיום בזמן אמת
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            תזמור הזמנות מהיר בזמן אמת עם שריון מלאי פסימי, סליקה אידמפוטנטית, תמונות אמיתיות ברזולוציה גבוהה, וקאש מבוזר ב-Redis לקריאות של פחות מ-5ms.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/cart">
              <Button
                variant="primary"
                size="lg"
                icon={<ShoppingCart className="w-5 h-5" />}
              >
                מעבר לעגלת הקניות
              </Button>
            </Link>
            <Button
              onClick={fetchCatalog}
              loading={loading}
              variant="outline"
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              icon={<RefreshCw className="w-4 h-4" />}
            >
              רענן קטלוג מ-API
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              variant="secondary"
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white border-none"
              icon={<PackagePlus className="w-5 h-5" />}
            >
              הוסף מוצר חדש ל-API
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle flex items-center gap-4 hover:border-brand-500/40 transition">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Virtual Threads & Redis</h4>
            <p className="text-xs text-slate-500 mt-0.5">קריאת קטלוג מלא מקאש מבוזר ב-Sub-5ms</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle flex items-center gap-4 hover:border-brand-500/40 transition">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Pessimistic Locking</h4>
            <p className="text-xs text-slate-500 mt-0.5">הגנה מוחלטת מפני מכירת יתר בעומסי שיא</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle flex items-center gap-4 hover:border-brand-500/40 transition">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
            🖼️
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">High-Res Product Assets</h4>
            <p className="text-xs text-slate-500 mt-0.5">תמונות אמיתיות, קטגוריות ופרטי מפרט מלאים</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש לפי שם מוצר, מקט או מפרט..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
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

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold text-slate-500">
            <SlidersHorizontal className="w-4 h-4" />
            <span>סנן לפי קטגוריה:</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">מוצרים זמינים במחסן המרכזי</h2>
            <p className="text-sm text-slate-500">מוזן בזמן אמת מ-API של Inventory Service בפורט 8082 דרך Spring Cloud Gateway</p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            נמצאו {filteredProducts.length} מתוך {products.length} פריטים
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-slate-100 animate-pulse border border-slate-200/60" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <div className="text-5xl">🔍</div>
            <h3 className="text-lg font-bold text-slate-800">לא נמצאו מוצרים התואמים את החיפוש</h3>
            <p className="text-sm text-slate-500">נסה לשנות את מילת החיפוש או לבחור קטגוריה אחרת</p>
            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedCategory("הכל"); }}>
              איפוס סינונים
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              />
            ))}
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">הוספת מוצר חדש ל-API</h3>
                  <p className="text-xs text-slate-500">הזן פרטים ותמונה אמיתית שתסונכרן ב-Kafka וב-PostgreSQL</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">מקט מוצר (SKU) *</label>
                  <input
                    type="text"
                    required
                    placeholder="למשל: SONY-A7-IV"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono uppercase focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">קטגוריה *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none bg-white"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">שם המוצר המלא *</label>
                <input
                  type="text"
                  required
                  placeholder="למשל: Sony Alpha 7 IV Full-Frame Mirrorless Camera"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">מחיר ליחידה (₪) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="למשל: 7999.00"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">כמות מלאי התחלתית *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">כתובת תמונה אמיתית (URL)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">הדבק קישור ישיר לתמונה מ-Unsplash או CDN</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">תיאור ומפרט המוצר</label>
                <textarea
                  rows={2}
                  placeholder="תיאור קצר ומפרט טכני של המוצר..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
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
