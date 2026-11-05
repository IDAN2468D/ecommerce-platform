"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Sparkles, X, ShoppingCart, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { useCurrency } from "../../context/CurrencyContext";

export interface VoiceShoppingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceShoppingModal: React.FC<VoiceShoppingModalProps> = ({ isOpen, onClose }) => {
  const { formatPrice } = useCurrency();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [assistantReply, setAssistantReply] = useState("שלום! אני סוכנת הקניות הקולית שלך. אמור לי מה תרצה לחפש או להוסיף לעגלה.");
  const [lastAction, setLastAction] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    startListening();
    speak("שלום! אני סוכנת הקניות הקולית שלך. במה תרצה שנתמקד?");

    return () => {
      stopListening();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "he-IL";
    utterance.rate = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setAssistantReply("דפדפן זה אינו תומך בזיהוי קולי ישיר. תוכל להשתמש באפשרויות המהירות למטה.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "he-IL";
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.results[0][0].transcript;
        setTranscript(current);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          handleVoiceQuery(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn("Speech recognition init error:", e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    stopListening();

    try {
      let cart = [];
      try {
        cart = JSON.parse(localStorage.getItem("cart") || "[]");
      } catch {}

      const res = await fetch("/api/agents/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: queryText, cart }),
      });

      if (res.ok) {
        const data = await res.json();
        setAssistantReply(data.spokenText);
        setLastAction(data);
        speak(data.spokenText);

        // Execute cart mutation if action is ADD
        if (data.actionType === "VOICE_ADD_TO_CART" && data.skuCode) {
          const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
          const existingIdx = currentCart.findIndex((i: any) => i.skuCode === data.skuCode);
          if (existingIdx >= 0) {
            currentCart[existingIdx].quantity += 1;
          } else {
            currentCart.push({
              skuCode: data.skuCode,
              name: data.productName || data.title,
              title: data.productName || data.title,
              price: data.price,
              quantity: 1,
            });
          }
          localStorage.setItem("cart", JSON.stringify(currentCart));
          window.dispatchEvent(new Event("cart-updated"));
        } else if (data.actionType === "CLEAR_CART") {
          localStorage.removeItem("cart");
          window.dispatchEvent(new Event("cart-updated"));
        } else if (data.actionType === "NAVIGATE_CHECKOUT") {
          setTimeout(() => {
            window.location.href = "/cart";
          }, 1500);
        }
      }
    } catch {
      const fallbackMsg = "הקלט נשמע, נסה לבקש להוסיף מקבוק, אייפון או אוזניות סוני.";
      setAssistantReply(fallbackMsg);
      speak(fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white flex flex-col items-center text-center space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 start-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>סוכן קניות קולי • Gemini Live Assistant</span>
        </div>

        {/* Pulsing Visual Waveform Orb */}
        <div className="relative flex items-center justify-center my-4">
          <div className={`absolute w-32 h-32 rounded-full transition-all duration-700 ${
            isSpeaking ? "bg-amber-500/30 scale-125 animate-ping" : isListening ? "bg-indigo-500/30 scale-110 animate-pulse" : "bg-slate-800/50"
          }`} />
          <button
            onClick={isListening ? stopListening : startListening}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
              isListening ? "bg-red-500 hover:bg-red-600 scale-105" : isSpeaking ? "bg-amber-500 hover:bg-amber-600" : "bg-gradient-to-tr from-amber-500 to-indigo-600 hover:scale-105"
            }`}
          >
            {isListening ? (
              <MicOff className="w-10 h-10 text-white animate-pulse" />
            ) : isSpeaking ? (
              <Volume2 className="w-10 h-10 text-white animate-bounce" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </button>
        </div>

        {/* State Label */}
        <div className="text-xs font-mono tracking-wider text-slate-400 uppercase">
          {isListening ? "● מאזינה בקשב רב..." : isSpeaking ? "🔊 סוכנת הקולית מדברת..." : isLoading ? "⚡ מעבדת את הבקשה..." : "לחץ על המיקרופון כדי לדבר"}
        </div>

        {/* Spoken Query / Transcript Display */}
        {transcript && (
          <div className="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 max-w-sm">
            <span className="text-slate-500">זיהוי קולי:</span> &ldquo;{transcript}&rdquo;
          </div>
        )}

        {/* Assistant Response Box */}
        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-sm sm:text-base font-medium text-slate-200 leading-relaxed max-w-md">
          {assistantReply}
        </div>

        {/* Last Executed Action Card */}
        {lastAction?.actionType === "VOICE_ADD_TO_CART" && (
          <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>נוסף לעגלה: {lastAction.productName || lastAction.title}</span>
            </div>
            <span className="font-mono font-black">{formatPrice(lastAction.price)}</span>
          </div>
        )}

        {/* Quick Voice Suggestions */}
        <div className="w-full space-y-2 pt-2">
          <p className="text-[11px] text-slate-400 font-semibold">או נסה פקודה מהירה:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "תוסיפי אייפון 16 פרו לעגלה",
              "תמצאי לי מקבוק פרו M3",
              "אוזניות סוני ביטול רעשים",
              "מעבר לתשלום בקופה",
            ].map((cmd) => (
              <button
                key={cmd}
                onClick={() => {
                  setTranscript(cmd);
                  handleVoiceQuery(cmd);
                }}
                className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs transition-colors hover:text-white"
              >
                &ldquo;{cmd}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
