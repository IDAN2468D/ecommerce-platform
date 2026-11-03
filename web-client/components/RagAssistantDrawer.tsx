"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  ShoppingBag,
  Check,
  CheckCircle2,
  ExternalLink,
  Bot,
  User,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  Info,
} from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";

export interface Citation {
  skuCode: string;
  title: string;
  price: number;
  relevanceScore?: number;
  category?: string;
  inStock?: boolean;
  snippet?: string;
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
}

const PRESET_PROMPTS = [
  "תוסיף לי לסל את האוזניות של סוני עם ביטול רעשים",
  "מה הקופון הכי משתלם לסל של 3500 ש״ח?",
  "מה סטטוס המשלוח וההזמנה האחרונה שלי?",
  "איזה מחשב נייד הכי מתאים לעריכת וידאו וגרפיקה?",
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
  const [isLoading, setIsLoading] = useState(false);
  const [addedSkus, setAddedSkus] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_welcome",
      sender: "assistant",
      text: "שלום! אני עוזר הקניות האישי החכם של Store 2026.\n\nאיך אוכל לסייע לך היום? תוכל לשאול אותי על מפרטים טכניים, המלצות ציוד, התאמת מוצרים לתקציב, או בדיקת זמינות מלאי.",
      timestamp: "עכשיו",
      model: "gemini-3.5-flash-lite",
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  // Listen for open events from Header, Floating Pill, or Command Palette
  useEffect(() => {
    const handleOpen = (e: any) => {
      setIsOpen(true);
      if (e?.detail?.initialQuery) {
        setQuery(e.detail.initialQuery);
        // Automatically submit query after open
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
        text: "השיחה אופסה. מה תרצה למצוא עבורך כעת?",
        timestamp: "עכשיו",
        model: "gemini-3.5-flash-lite",
      },
    ]);
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
        agentsInvolved: data.agentsInvolved || (data.model?.includes("swarm") ? ["SupervisorRouterAgent"] : undefined),
        timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
        latencyMs: data.latencyMs,
        model: data.model || "swarm-supervisor-gemini-2.5-flash",
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
      };
      const canonicalSku = SKU_ALIASES[citation.skuCode] || citation.skuCode;
      const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingIndex = currentCart.findIndex((i: any) => i.skuCode === canonicalSku || i.skuCode === citation.skuCode);

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm transition-opacity"
      dir="rtl"
    >
      <div className="absolute inset-y-0 start-0 max-w-full flex pr-0 sm:pr-6">
        <div
          className="w-screen max-w-lg bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-brand-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-2 ring-white/60 dark:ring-slate-800">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                    צוות סוכנים אוטונומי AI
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                    Swarm V5
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  5 Autonomous Agents • Multi-Agent Swarm
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="איפוס היסטוריית השיחה"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="סגור חלונית"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Category & Hybrid Reranking Filter Pills */}
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1 ml-1">
                <SlidersHorizontal className="w-3 h-3 text-slate-400" /> סינון:
              </span>
              {[
                { id: "ALL", label: "כל הקטלוג" },
                { id: "מחשבים", label: "מחשבים" },
                { id: "אוזניות", label: "אוזניות ושמע" },
                { id: "אביזרים", label: "אביזרים" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                    selectedCategory === cat.id
                      ? "bg-brand-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
              <button
                type="button"
                onClick={() => setOnlyInStock((v) => !v)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition shrink-0 ${
                  onlyInStock
                    ? "bg-emerald-600 text-white"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {onlyInStock ? "✓ רק במלאי" : "רק במלאי"}
              </button>
              <button
                type="button"
                onClick={() => setMinRating((r) => (r === 4.5 ? 0 : 4.5))}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition shrink-0 ${
                  minRating >= 4.5
                    ? "bg-amber-500 text-slate-950"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                }`}
              >
                ★ 4.5+
              </button>
              <button
                type="button"
                onClick={() => setMaxPrice((p) => (p === 6000 ? null : 6000))}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition shrink-0 ${
                  maxPrice === 6000
                    ? "bg-indigo-600 text-white"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {maxPrice === 6000 ? "✓ עד ₪6,000" : "עד ₪6,000"}
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-xs ${
                    msg.sender === "user"
                      ? "bg-slate-700 dark:bg-slate-600"
                      : "bg-gradient-to-tr from-brand-600 to-indigo-600"
                  }`}
                >
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div className={`max-w-[85%] space-y-2.5`}>
                  <div
                    className={`rounded-2xl p-3.5 text-sm leading-relaxed shadow-xs ${
                      msg.sender === "user"
                        ? "bg-brand-600 text-white rounded-tr-none text-right"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60 text-right whitespace-pre-wrap"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Multi-Agent Swarm Collaborative Badges */}
                  {msg.agentsInvolved && msg.agentsInvolved.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5 px-0.5">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Bot className="w-3 h-3 text-indigo-500" /> צוות סוכנים:
                      </span>
                      {msg.agentsInvolved.map((agent) => {
                        const labelMap: Record<string, string> = {
                          SupervisorRouterAgent: "מתאם ראשי",
                          CatalogDiscoveryAgent: "איתור קטלוג ומלאי",
                          CartPricingLoyaltyAgent: "סל, קופונים ו-VIP",
                          OrderLogisticsWorkspaceAgent: "לוגיסטיקה ומשלוחים",
                          KafkaAutonomousOpsAgent: "אירועי רקע Kafka",
                        };
                        return (
                          <span
                            key={agent}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40"
                          >
                            {labelMap[agent] || agent}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Agentic Executed Actions (Function Calling Chips) */}
                  {msg.executedActions && msg.executedActions.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 px-1">
                        <Zap className="w-3.5 h-3.5" /> פעולות אוטונומיות שבוצעו ע״י הסוכן:
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {msg.executedActions.map((act, idx) => (
                          <div
                            key={`${act.toolName}_${idx}`}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                              act.status === "SUCCESS"
                                ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/70 text-emerald-900 dark:text-emerald-200"
                                : "bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/70 text-amber-900 dark:text-amber-200"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <div>
                                <div className="font-bold text-[11px] font-mono opacity-80">
                                  {act.toolName}
                                </div>
                                <div className="font-semibold">{act.summary}</div>
                              </div>
                            </div>
                            {act.toolName === "addToCartTool" && act.status === "SUCCESS" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsOpen(false);
                                  router.push("/cart");
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shrink-0 transition"
                              >
                                עבור לסל
                              </button>
                            )}
                            {act.toolName === "validateBestCouponTool" &&
                              act.status === "SUCCESS" &&
                              (act.payload?.bestCouponCode || act.payload?.couponCode) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    sessionStorage.setItem(
                                      "pending_coupon",
                                      String(act.payload?.bestCouponCode || act.payload?.couponCode)
                                    );
                                    setIsOpen(false);
                                    router.push("/cart");
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shrink-0 transition"
                                >
                                  החל {String(act.payload.bestCouponCode || act.payload.couponCode)}
                                </button>
                              )}
                            {act.toolName === "checkOrderStatusTool" && act.status === "SUCCESS" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsOpen(false);
                                  router.push("/orders");
                                }}
                                className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] shrink-0 transition"
                              >
                                מעקב משלוח
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grounded Citation Product Cards */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block px-1">
                        📦 מוצרים רלוונטיים מתוך הקטלוג ({msg.citations.length}):
                      </span>

                      <div className="grid grid-cols-1 gap-2">
                        {msg.citations.map((citation) => {
                          const isAdded = !!addedSkus[citation.skuCode];
                          return (
                            <div
                              key={citation.skuCode}
                              className="p-3 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 transition group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                                      {citation.title}
                                    </h4>
                                    {citation.inStock !== false ? (
                                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">
                                        במלאי
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-semibold">
                                        אזל
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                    מק״ט: {citation.skuCode} • {citation.category || "מוצר"}
                                  </div>

                                  {citation.snippet && (
                                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-snug">
                                      {citation.snippet}
                                    </p>
                                  )}
                                </div>

                                <div className="text-left shrink-0">
                                  <div className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                                    {formatPrice(citation.price)}
                                  </div>
                                  <div className="text-[10px] text-amber-500 font-medium">
                                    5% Cashback
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons: Add to Cart & View */}
                              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleNavigateToProduct(citation.skuCode)}
                                  className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 transition"
                                >
                                  <span>צפה בפרטים</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleAddToCart(citation)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                                    isAdded
                                      ? "bg-emerald-600 text-white"
                                      : "bg-brand-600 hover:bg-brand-700 text-white active:scale-95"
                                  }`}
                                >
                                  {isAdded ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>נוסף לעגלה!</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingBag className="w-3.5 h-3.5" />
                                      <span>הוסף לסל</span>
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
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1 font-mono">
                    <span>{msg.timestamp}</span>
                    {msg.latencyMs && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-500 flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5" /> {msg.latencyMs}ms
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
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none p-3.5 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-600 animate-bounce" />
                  <div
                    className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono pr-1">
                    Gemini מעבד חיפוש וקטורי...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompts (if only welcome message) */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                שאלות מהירות לדוגמה:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => submitQuery(prompt)}
                    className="text-right text-xs px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition shadow-xs"
                  >
                    ✨ {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitQuery();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="שאל שאלה על המוצרים, מפרטים, או המלצה..."
                disabled={isLoading}
                className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Send className="w-4 h-4 rotate-180" />
                <span className="hidden sm:inline">שלח</span>
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                RAG Engine: Ready
              </span>
              <span>Resilience4j Circuit Breaker Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
