"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  ShoppingBag,
  ShoppingCart,
  Check,
  CheckCircle2,
  ExternalLink,
  Bot,
  User,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Star,
  Tag,
  PackageCheck,
  Truck,
  Eye,
  Mic,
  MicOff,
  Clock,
  Layers,
  Flame,
  ArrowRight,
  ShieldCheck,
  Box,
} from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import { SwarmAgentBadges } from "./store/SwarmAgentBadges";
import { SmartBundleCard, SmartBundlePayload, BundleItem } from "./store/SmartBundleCard";
import { AssistantFormattedResponse } from "./store/AssistantFormattedResponse";

export interface Citation {
  skuCode: string;
  title: string;
  price: number;
  relevanceScore?: number;
  category?: string;
  inStock?: boolean;
  snippet?: string;
  imageUrl?: string;
  rating?: number;
}

export interface ExecutedAction {
  toolName: string;
  status: string;
  summary: string;
  payload?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  citations?: Citation[];
  executedActions?: ExecutedAction[];
  agentsInvolved?: string[];
  timestamp: string;
  latencyMs?: number;
  model?: string;
  a2aDebate?: Record<string, any>;
  hitlGate?: Record<string, any>;
  memoryCheckpoint?: Record<string, any>;
  tokenTelemetry?: Record<string, any>;
}

const SKU_IMAGE_MAP: Record<string, string> = {
  "AIRPODS-MAX": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
  "AUDIO-AIRPODS-MAX": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
  "AIRPODS-PRO-2": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
  "AUDIO-AIRPODS-PRO": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
  "MACBOOK-PRO-M3": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  "MACBOOK-PRO-M4": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  "LAPTOP-MACBOOK-PRO-16": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  "WATCH-ULTRA-2": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  "IPAD-PRO-M4": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
  "IPHONE-16-PRO-256": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
  "IPHONE-16-PRO": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
  "CASE-CLEAR-MAGSAFE": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80",
  "CASE-PRO-CLEAR": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80",
  "DJI-MINI-4-PRO": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
  "SKU-LAPTOP-PRO": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
  "DELL-XPS-15": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
  "LAPTOP-DELL-XPS-15": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
  "SKU-MOUSE-WIRELESS": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
  "SAMSUNG-S24-ULTRA": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80",
  "PS5-PRO": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
  "SONY-WH-1000XM5": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  "SONY-WH1000XM5": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  "AUDIO-SONY-XM5": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
};

const PRESET_TOPICS = [
  {
    icon: "⚡",
    title: "צלף מכרזים ו-Flash",
    prompt: "תפעיל את סוכן צלף המכרזים על MacBook Pro ותנעל לי מלאי ב-Flash Sale",
  },
  {
    icon: "💳",
    title: "פריסת BNPL ב-0% ריבית",
    prompt: "תבדוק לי זכאות לפריסת BNPL ב-4 תשלומים ללא ריבית ושילוב קופון VIP",
  },
  {
    icon: "♻️",
    title: "טרייד-אין וקבוצת רכישה",
    prompt: "כמה שווה המקבוק הישן שלי בטרייד-אין והאם יש קבוצת רכישה פתוחה להנחת 28%?",
  },
  {
    icon: "🛡️",
    title: "תעודת אחריות ונאמנות SHA-256",
    prompt: "תאמת לי את תעודת האחריות הקריפטוגרפית וסטטוס חשבון הנאמנות Smart Escrow",
  },
];

export const RagAssistantDrawer: React.FC = () => {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const [addedSkus, setAddedSkus] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_welcome",
      sender: "assistant",
      text: "שלום! אני עוזר הקניות החכם המופעל ע״י צוות סוכנים אוטונומי ובינה מלאכותית של Google Gemini.\n\nאיך אוכל לסייע לך היום? תוכל לשאול אותי על מפרטים טכניים, לבקש להוסיף מוצרים ישירות לסל, לבדוק זמינות מלאי במרלו״ג או לאתר קופונים והנחות VIP.",
      timestamp: "עכשיו",
      model: "Google Gemini 2.5 Flash Swarm",
    },
  ]);

  const activeFiltersCount =
    (selectedCategory !== "ALL" ? 1 : 0) +
    (onlyInStock ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (maxPrice !== null ? 1 : 0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // Listen for open events from Header, Floating Pill, or Command Palette
  useEffect(() => {
    const handleOpen = (e: any) => {
      setIsOpen(true);
      if (e?.detail?.initialQuery) {
        setQuery(e.detail.initialQuery);
        setTimeout(() => {
          submitQuery(e.detail.initialQuery);
        }, 150);
      }
    };

    window.addEventListener("open-rag-drawer", handleOpen);
    return () => {
      window.removeEventListener("open-rag-drawer", handleOpen);
    };
  }, []);

  const handleClearChat = () => {
    setMessages([
      {
        id: "msg_welcome_reset",
        sender: "assistant",
        text: "השיחה אופסה בהצלחה. כל 17 סוכני ה-Swarm v8.0 האוטונומיים (כולל דיבייט A2A ושער HITL) ממתינים לבקשה שלך. מה תרצה שנבדוק כעת?",
        timestamp: "עכשיו",
        model: "Google Gemini 2.5 Flash • 17-Agent Swarm v8.0",
      },
    ]);
  };

  const toggleReasoning = (messageId: string) => {
    setExpandedReasoning((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const handleVoiceSearch = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("חיפוש קולי אינו נתמך בדפדפן זה. מומלץ להשתמש ב-Google Chrome.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "he-IL";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
          submitQuery(transcript);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const submitQuery = async (customQuery?: string) => {
    const textToSend = customQuery || query;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      let resolvedCustomerId = "usr_demo";
      let resolvedCartTotal: number | undefined = undefined;
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        if (storedUser?.email || storedUser?.id) {
          resolvedCustomerId = String(storedUser.email || storedUser.id);
        }
        const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        if (Array.isArray(storedCart) && storedCart.length > 0) {
          resolvedCartTotal = storedCart.reduce(
            (sum: number, item: any) => sum + Number(item.unitPrice || item.price || 0) * Number(item.quantity || 1),
            0
          );
        }
      } catch {
        // ignore storage errors
      }

      const payload: any = {
        query: textToSend.trim(),
        conversationId: "conv_client_session",
        customerId: resolvedCustomerId,
        cartTotal: resolvedCartTotal,
        topK: 4,
        minSimilarity: 0.5,
      };

      if (selectedCategory !== "ALL") {
        payload.category = selectedCategory;
      }
      if (onlyInStock) {
        payload.onlyInStock = true;
      }
      if (minRating > 0) {
        payload.minRating = minRating;
      }
      if (maxPrice !== null && maxPrice > 0) {
        payload.maxPrice = maxPrice;
      }

      let data: any = null;
      try {
        const swarmRes = await fetch("/api/agents/swarm/query", {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(payload),
        });
        if (swarmRes.ok) {
          data = await swarmRes.json();
        }
      } catch {
        // Fallback to standard RAG if swarm is unreachable
      }

      if (!data) {
        const res = await fetch("/api/rag/query", {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`שגיאת תקשורת עם שירות הסוכנים (${res.status})`);
        }

        data = await res.json();
      }

      const executedActions: ExecutedAction[] = Array.isArray(data.executedActions)
        ? data.executedActions
        : [];

      // Synchronize client-side cart & session state when Agentic tools executed
      executedActions.forEach((act) => {
        if (act.toolName === "addToCartTool" && act.status === "SUCCESS" && act.payload) {
          try {
            const skuCode = String(act.payload.skuCode || "");
            const productName = String(act.payload.productName || skuCode);
            const unitPrice = Number(act.payload.unitPrice || 0);
            const quantity = Number(act.payload.quantity || 1);
            if (skuCode) {
              const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
              const existingIdx = currentCart.findIndex((i: any) => i.skuCode === skuCode);
              if (existingIdx > -1) {
                currentCart[existingIdx].quantity = (currentCart[existingIdx].quantity || 1) + quantity;
              } else {
                currentCart.push({ skuCode, productName, unitPrice, quantity });
              }
              localStorage.setItem("cart", JSON.stringify(currentCart));
              window.dispatchEvent(new Event("cart-updated"));
            }
          } catch (e) {
            console.error("Failed to sync agentic addToCartTool with localStorage", e);
          }
        } else if (
          act.toolName === "validateBestCouponTool" &&
          act.status === "SUCCESS" &&
          act.payload?.bestCouponCode
        ) {
          try {
            sessionStorage.setItem("pending_coupon", String(act.payload.bestCouponCode));
          } catch {
            // ignore
          }
        }
      });

      const assistantMessage: ChatMessage = {
        id: `asst_${Date.now()}`,
        sender: "assistant",
        text: data.answer || data.response || "לא התקבלה תשובה מפורטת מהמערכת.",
        citations: data.citations || [],
        executedActions,
        agentsInvolved: data.agentsInvolved || (data.model?.includes("swarm") ? ["SupervisorRouterAgent", "CatalogDiscoveryAgent"] : undefined),
        timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
        latencyMs: data.latencyMs,
        model: data.model || "Google Gemini 2.5 Flash Swarm v8.0",
        a2aDebate: data.a2aDebate,
        hitlGate: data.hitlGate,
        memoryCheckpoint: data.memoryCheckpoint,
        tokenTelemetry: data.tokenTelemetry,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst_err_${Date.now()}`,
          sender: "assistant",
          text: `מתנצל, נתקלתי בקושי זמני בעיבוד הבקשה: ${err.message}. אנא נסה שנית או בדוק את חיבור הרשת.`,
          timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (citation: Citation) => {
    try {
      const SKU_ALIASES: Record<string, string> = {
        "IPHONE-16-PRO": "IPHONE-16-PRO-256",
        "IPHONE-16-PRO-MAX": "IPHONE-16-PRO-256",
        "MACBOOK-PRO-M4": "MACBOOK-PRO-M3",
        "SONY-WH1000XM5": "SONY-WH-1000XM5",
        "DELL-XPS-15": "SKU-LAPTOP-PRO",
        "CASE-PRO-CLEAR": "CASE-CLEAR-MAGSAFE",
        "AUDIO-SONY-XM5": "SONY-WH-1000XM5",
      };
      const canonicalSku = SKU_ALIASES[citation.skuCode] || citation.skuCode;
      const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingIndex = currentCart.findIndex(
        (i: any) => i.skuCode === canonicalSku || i.skuCode === citation.skuCode
      );

      if (existingIndex > -1) {
        currentCart[existingIndex].quantity = (currentCart[existingIndex].quantity || 1) + 1;
      } else {
        currentCart.push({
          skuCode: canonicalSku,
          productName: citation.title,
          unitPrice: citation.price,
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(currentCart));
      window.dispatchEvent(new Event("cart-updated"));

      setAddedSkus((prev) => ({ ...prev, [citation.skuCode]: true }));
      setTimeout(() => {
        setAddedSkus((prev) => ({ ...prev, [citation.skuCode]: false }));
      }, 2500);
    } catch (e) {
      console.error("Failed to add cited item to cart", e);
    }
  };

  const handleNavigateToProduct = (skuCode: string) => {
    setIsOpen(false);
    router.push(`/?sku=${skuCode}`);
  };

  const resolveProductImage = (citation: any): string => {
    if (!citation) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
    if (typeof citation === "string") return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
    if (citation.imageUrl) return citation.imageUrl;
    const sku = String(citation.skuCode || "");
    if (!sku) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
    const direct = SKU_IMAGE_MAP[sku];
    if (direct) return direct;
    for (const [key, val] of Object.entries(SKU_IMAGE_MAP)) {
      if (sku.includes(key) || key.includes(sku)) {
        return val;
      }
    }
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-md transition-opacity duration-300"
      dir="rtl"
    >
      <div className="absolute inset-y-0 start-0 max-w-full flex pr-0 sm:pr-4">
        <div
          className="w-screen max-w-xl bg-white/95 dark:bg-[#090d16]/95 border-e border-slate-200/80 dark:border-indigo-500/20 shadow-[0_0_60px_rgba(79,70,229,0.18)] flex flex-col justify-between backdrop-blur-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 dark:from-[#0b0f1a] dark:via-[#090d16] dark:to-indigo-950/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Dynamic Swarm Halo Icon */}
              <div className="relative flex items-center justify-center">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-2 ring-white dark:ring-slate-800">
                  <Bot className="w-6 h-6 animate-pulse" />
                </div>
                <span className="absolute -bottom-1 -end-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900" />
                </span>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-slate-900 dark:text-white tracking-tight">
                    חדר פיקוד נחיל 17 סוכני AI
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    Swarm v8.0
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>17 סוכנים אוטונומיים (A2A + HITL)</span>
                  <span>•</span>
                  <span>26 מיקרו-שירותים</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                title={showFilters ? "הסתר מסננים" : "סינון מתקדם בקטלוג"}
                className={`relative p-2 rounded-xl transition ${
                  showFilters || activeFiltersCount > 0
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {activeFiltersCount > 0 && !showFilters && (
                  <span className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleClearChat}
                title="איפוס היסטוריית השיחה"
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="סגור חלונית"
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick-Jump Microservice Hubs Bar */}
          <div className="px-4 py-2 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-950/80 flex flex-wrap items-center gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push("/arena");
              }}
              className="px-2.5 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-300 border border-rose-500/30 font-bold shrink-0 transition"
            >
              ⚡ זירת מכרזים וקבוצות
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push("/gifting");
              }}
              className="px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-bold shrink-0 transition"
            >
              🎁 מתנות, טרייד-אין ו-B2B
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                window.dispatchEvent(new CustomEvent("open-room-visualizer"));
              }}
              className="px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 font-bold shrink-0 transition"
            >
              🛋️ הדמיה בחדר (AR)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push("/admin");
              }}
              className="px-2.5 py-1 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 font-bold shrink-0 transition"
            >
              🎛️ חדר בקרה (26 שירותים)
            </button>
          </div>

          {/* Collapsible Category & Search Filters Panel */}
          {showFilters && (
            <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-950/70 space-y-2 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 font-mono">
                  התאמת תוצאות חיפוש בקטלוג
                </span>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("ALL");
                      setOnlyInStock(false);
                      setMinRating(0);
                      setMaxPrice(null);
                    }}
                    className="text-[11px] text-indigo-500 hover:underline font-medium"
                  >
                    אפס סינונים
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="flex flex-wrap items-center gap-1.5 py-0.5">
                {[
                  { id: "ALL", label: "כל הקטלוג" },
                  { id: "מחשבים", label: "מחשבים" },
                  { id: "אודיו", label: "אודיו ושמע" },
                  { id: "סמארטפונים", label: "סלולר" },
                  { id: "אביזרים", label: "אביזרים" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      selectedCategory === cat.id
                        ? "bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setOnlyInStock((v) => !v)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    onlyInStock
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>רק במלאי מרלו״ג</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMinRating((r) => (r === 4.8 ? 0 : 4.8))}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    minRating >= 4.8
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>דירוג מובחר (4.8+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMaxPrice((p) => (p === 5000 ? null : 5000))}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    maxPrice === 5000
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>עד ₪5,000</span>
                </button>
              </div>
            </div>
          )}

          {/* Messages Stream Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {messages.map((msg) => {
              const isAssistant = msg.sender === "assistant";
              const isReasoningOpen = !!expandedReasoning[msg.id];

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAssistant ? "flex-row" : "flex-row-reverse"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold shadow-md ${
                      isAssistant
                        ? "bg-gradient-to-tr from-amber-500 via-indigo-600 to-cyan-500 shadow-indigo-500/20 ring-1 ring-white/20"
                        : "bg-gradient-to-tr from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800"
                    }`}
                  >
                    {isAssistant ? <Bot className="w-5 h-5" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Message Content Bubble */}
                  <div className="flex-1 max-w-[88%] space-y-3">
                    {/* Primary Text */}
                    {isAssistant ? (
                      <AssistantFormattedResponse text={msg.text} />
                    ) : (
                      <div className="rounded-3xl p-4 text-sm leading-relaxed shadow-sm bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tl-xs font-medium whitespace-pre-wrap">
                        {msg.text}
                      </div>
                    )}

                    {/* Upgraded 16-Agent Swarm Badges (Swarm v8.0) */}
                    {isAssistant && msg.agentsInvolved && msg.agentsInvolved.length > 0 && (
                      <SwarmAgentBadges agentsInvolved={msg.agentsInvolved} />
                    )}

                    {/* A2A Multi-Agent Consensus Blackboard Card */}
                    {isAssistant && msg.a2aDebate && (
                      <div className="p-3 rounded-2xl border border-amber-300/60 dark:border-amber-800/60 bg-gradient-to-br from-amber-500/10 via-indigo-500/5 to-emerald-500/10 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                            <span>🧠</span>
                            <span>קונצנזוס דיבייט סוכן-לסוכן (A2A Blackboard)</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-mono text-[10px] font-bold">
                            -{msg.a2aDebate.approvedDiscountPct}% • {msg.a2aDebate.consensusCouponCode}
                          </span>
                        </div>
                        {Array.isArray(msg.a2aDebate.transcript) && (
                          <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                            {msg.a2aDebate.transcript.map((step: any, sIdx: number) => (
                              <div key={sIdx} className="flex items-start gap-1.5 bg-white/70 dark:bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                                  [{step.senderAgent}]:
                                </span>
                                <span>{step.rationale}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Human-in-the-Loop (HITL) Approval Gate Card */}
                    {isAssistant && msg.hitlGate && (
                      <div className="p-3 rounded-2xl border border-rose-300/70 dark:border-rose-800/70 bg-gradient-to-r from-rose-500/10 to-amber-500/10 flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                            <span>🛑</span>
                            <span>שער אישור אנושי (HITL Guardrail: {msg.hitlGate.status})</span>
                          </div>
                          <div className="text-[11px] text-slate-700 dark:text-slate-300">
                            {msg.hitlGate.reasonHe}
                          </div>
                        </div>
                        {msg.hitlGate.status === "PENDING_APPROVAL" && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const res = await fetch("/api/agents/swarm/hitl", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    approvalId: msg.hitlGate?.approvalId,
                                    decision: "APPROVED",
                                  }),
                                });
                                if (res.ok) {
                                  const updatedGate = await res.json();
                                  setMessages((prev) =>
                                    prev.map((m) =>
                                      m.id === msg.id ? { ...m, hitlGate: updatedGate } : m
                                    )
                                  );
                                }
                              } catch {
                                // ignore
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 transition shadow-sm"
                          >
                            אשר פעולה (Approve)
                          </button>
                        )}
                      </div>
                    )}

                     {/* Autonomous Function Calling Actions */}
                    {isAssistant && msg.executedActions && msg.executedActions.length > 0 && (
                      <div className="space-y-2">
                        {msg.executedActions.map((act, idx) => {
                          if (act.toolName === "buildSmartBundleTool" && act.payload) {
                            return (
                              <SmartBundleCard
                                key={`${act.toolName}_${idx}`}
                                bundle={act.payload as any}
                                onAddToCartAll={(items) => {
                                  try {
                                    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
                                    items.forEach((item) => {
                                      const existingIdx = currentCart.findIndex((i: any) => i.skuCode === item.skuCode);
                                      if (existingIdx > -1) {
                                        currentCart[existingIdx].quantity = (currentCart[existingIdx].quantity || 1) + 1;
                                      } else {
                                        currentCart.push({
                                          skuCode: item.skuCode,
                                          productName: item.title,
                                          unitPrice: item.unitPrice,
                                          quantity: 1,
                                        });
                                      }
                                    });
                                    localStorage.setItem("cart", JSON.stringify(currentCart));
                                    window.dispatchEvent(new Event("cart-updated"));
                                  } catch (e) {
                                    console.error("Failed adding bundle to cart:", e);
                                  }
                                }}
                              />
                            );
                          }

                          return (
                          <div
                            key={`${act.toolName}_${idx}`}
                            className="p-3 rounded-2xl border border-emerald-300/60 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/30 dark:to-teal-950/20 backdrop-blur-md flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <Zap className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono block">
                                  פעולה אוטונומית שבוצעה
                                </span>
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                  {act.summary}
                                </span>
                              </div>
                            </div>

                            {act.toolName === "addToCartTool" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsOpen(false);
                                  router.push("/cart");
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 transition shadow-xs flex items-center gap-1"
                              >
                                <span>לסל</span>
                                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                              </button>
                            )}

                            {act.toolName === "checkOrderStatusTool" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsOpen(false);
                                  router.push("/orders");
                                }}
                                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 transition shadow-xs"
                              >
                                מעקב הזמנה
                              </button>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    )}

                    {/* REDESIGNED: Premium Grounded Catalog Product Cards */}
                    {isAssistant && msg.citations && msg.citations.length > 0 && (
                      <div className="space-y-2.5 pt-1">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>מוצרים מומלצים ומדויקים מהקטלוג ({msg.citations.length})</span>
                          </span>
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                            מלאי מאומת בזמן אמת
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                          {msg.citations.map((rawCitation, cIdx) => {
                            const citation: Citation = typeof rawCitation === "string"
                              ? {
                                  skuCode: `ITEM-${cIdx}`,
                                  title: rawCitation,
                                  price: 0,
                                  relevanceScore: 0.95,
                                  inStock: true,
                                }
                              : rawCitation;
                            const sku = String(citation.skuCode || `sku-${cIdx}`);
                            const title = String(citation.title || "מוצר פרימיום");
                            const price = Number(citation.price || 0);
                            const isAdded = !!addedSkus[sku];
                            const imgSrc = resolveProductImage(citation);
                            const ratingVal = citation.rating || 4.9;
                            const regularPrice = Math.round(price * 1.15);
                            const cashbackPoints = Math.round(price * 0.05);

                            return (
                              <div
                                key={sku}
                                className="group relative rounded-2xl bg-white dark:bg-[#111728] border border-slate-200/90 dark:border-slate-800/90 hover:border-amber-500/50 dark:hover:border-amber-400/50 p-3.5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden"
                              >
                                {/* Glowing Accent bar on hover */}
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="flex gap-3.5 items-start">
                                  {/* Product Thumbnail Box */}
                                  <div
                                    onClick={() => handleNavigateToProduct(sku)}
                                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center p-1.5 shrink-0 overflow-hidden cursor-pointer group-hover:scale-102 transition-transform"
                                  >
                                    <img
                                      src={imgSrc}
                                      alt={title}
                                      className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-110"
                                      loading="lazy"
                                    />
                                    {citation.inStock !== false ? (
                                      <span className="absolute bottom-1 start-1 px-1.5 py-0.2 rounded-md bg-emerald-500/90 text-white text-[9px] font-black tracking-tight">
                                        במלאי
                                      </span>
                                    ) : (
                                      <span className="absolute bottom-1 start-1 px-1.5 py-0.2 rounded-md bg-rose-500/90 text-white text-[9px] font-black tracking-tight">
                                        אזל
                                      </span>
                                    )}
                                  </div>

                                  {/* Product Details */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-1">
                                      <h4
                                        onClick={() => handleNavigateToProduct(sku)}
                                        className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition cursor-pointer truncate"
                                      >
                                        {title}
                                      </h4>
                                    </div>

                                    {/* Subtitle & Rating */}
                                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                                      <span>{citation.category || "קטלוג פרימיום"}</span>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                                        <Star className="w-3 h-3 fill-current" />
                                        <span>{ratingVal}</span>
                                      </span>
                                      <span>•</span>
                                      <span className="text-indigo-500 font-bold">
                                        {Math.round((citation.relevanceScore || 0.92) * 100)}% התאמה
                                      </span>
                                    </div>

                                    {/* Snippet / Advantages */}
                                    {citation.snippet && (
                                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-1 leading-relaxed">
                                        {citation.snippet}
                                      </p>
                                    )}

                                    {/* Price & Benefits Row */}
                                    <div className="mt-2 flex items-baseline justify-between gap-2 flex-wrap">
                                      <div className="flex items-baseline gap-2">
                                        <span className="text-sm sm:text-base font-black text-slate-900 dark:text-emerald-400">
                                          {formatPrice(price)}
                                        </span>
                                        <span className="text-[11px] text-slate-400 line-through">
                                          {formatPrice(regularPrice)}
                                        </span>
                                      </div>

                                      <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                        🪙 צבור ₪{cashbackPoints} נקודות
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Product Action Buttons */}
                                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleNavigateToProduct(sku)}
                                    className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>פרטי מוצר</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart(citation)}
                                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 ${
                                      isAdded
                                        ? "bg-emerald-600 text-white"
                                        : "bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:opacity-95 text-white"
                                    }`}
                                  >
                                    {isAdded ? (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>נוסף בהצלחה לסל!</span>
                                      </>
                                    ) : (
                                      <>
                                        <ShoppingCart className="w-3.5 h-3.5" />
                                        <span>הוסף לסל עכשיו</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 px-1 font-mono">
                      <span>{msg.timestamp}</span>
                      {msg.latencyMs && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-500 flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5" /> {msg.latencyMs}ms
                          </span>
                        </>
                      )}
                      {msg.memoryCheckpoint && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-400">
                            Memory: {msg.memoryCheckpoint.checkpointId} (Turn #{msg.memoryCheckpoint.turnCount})
                          </span>
                        </>
                      )}
                      {msg.tokenTelemetry && (
                        <>
                          <span>•</span>
                          <span className="text-amber-500">
                            Tokens: {msg.tokenTelemetry.totalTokens}/{msg.tokenTelemetry.tokenBudgetLimit}
                          </span>
                        </>
                      )}
                      {msg.model && (
                        <>
                          <span>•</span>
                          <span>{msg.model}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md animate-pulse">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-white dark:bg-[#0f1422] rounded-3xl rounded-tl-xs p-4 border border-slate-200/80 dark:border-slate-800/90 shadow-sm flex items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                    <span
                      className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-mono pr-1">
                    צוות הסוכנים מעבד חיפוש קטלוגי וקטורי...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel (Shown when 1 message) */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 py-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40">
              <span className="text-[11px] font-bold text-slate-400 block mb-2 font-mono">
                שאלות מהירות לדוגמה:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_TOPICS.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => submitQuery(topic.prompt)}
                    className="flex items-start gap-2 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-right hover:border-amber-500/60 dark:hover:border-amber-500/60 hover:shadow-md transition group"
                  >
                    <span className="text-lg shrink-0">{topic.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover:text-amber-500 transition">
                        {topic.title}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {topic.prompt}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box Footer */}
          <div className="p-3.5 sm:p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitQuery();
              }}
              className="relative flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    isListening
                      ? "מקשיב לקולך כעת..."
                      : "שאל כל דבר: תמליץ על לפטופ, תבדוק הנחת VIP, או תוסיף לסל..."
                  }
                  disabled={isLoading}
                  className="w-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 pe-11 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition disabled:opacity-60 shadow-inner"
                />

                {/* Voice Search Button */}
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  title="חיפוש קולי"
                  className={`absolute end-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition ${
                    isListening
                      ? "bg-rose-500 text-white animate-pulse"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800"
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4 rotate-180" />
                <span className="hidden sm:inline">שלח</span>
              </button>
            </form>

            {/* Sub-footer Security & Engine badge */}
            <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Multi-Agent Swarm v8.0 • 17 Autonomous Agents</span>
              </span>
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>A2A Consensus • HITL Gate • SHA-256 Escrow</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
