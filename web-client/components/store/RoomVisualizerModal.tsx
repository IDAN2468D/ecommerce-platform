"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, X, Upload, CheckCircle2, Layers, Sun, Maximize2 } from "lucide-react";
import { Button } from "../ui/Button";

interface RoomVisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProductName?: string;
}

export const RoomVisualizerModal: React.FC<RoomVisualizerModalProps> = ({
  isOpen,
  onClose,
  defaultProductName = "Apple MacBook Pro 16 M3 Max / Sony WH-1000XM5",
}) => {
  const [productName, setProductName] = useState(defaultProductName);

  useEffect(() => {
    if (defaultProductName) {
      setProductName(defaultProductName);
    }
  }, [defaultProductName]);
  const [roomType, setRoomType] = useState("חדר עבודה ושולחן הייטק");
  const [lightingStyle, setLightingStyle] = useState<"daylight" | "warm">("daylight");
  const [previewImage, setPreviewImage] = useState<string>(
    "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=900&q=80"
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    compatibilityScore: number;
    lightingAnalysis: string;
    spatialFitVerdict: string;
    recommendedAccessories: Array<{ sku: string; name: string; synergyDiscount: string }>;
  } | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreviewImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rag/room-visualizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          roomType,
          lightingStyle,
          dimensionsNotes: "התאמה ארגונומית מלאה לחלל העבודה",
        }),
      });
      if (res.ok) {
        setResult(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4" dir="rtl">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-amber-500/30 text-white shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg">AI Room & Setup Visualizer (Gemini Vision)</h3>
              <p className="text-xs text-slate-400">
                סימולטור התאמת מוצרים לחלל החדר, ניתוח תאורה והמלצות ארגונומיות חכמות
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto">
          {/* Left: Room Image & Controls */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 aspect-video bg-slate-950">
              <img src={previewImage} alt="Room Preview" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 right-2 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-amber-400 border border-amber-500/30">
                תצוגת חלל פעילה • {roomType}
              </div>
            </div>

            <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold cursor-pointer transition">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>העלה תמונת חדר / שולחן עבודה מהמכשיר</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-300 block">מוצר לבדיקת התאמה:</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setLightingStyle("daylight")}
                className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 ${
                  lightingStyle === "daylight"
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>תאורת יום / סטודיו</span>
              </button>
              <button
                type="button"
                onClick={() => setLightingStyle("warm")}
                className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 ${
                  lightingStyle === "warm"
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>תאורת אווירה חמה</span>
              </button>
            </div>

            <Button
              onClick={handleRunSimulation}
              loading={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black py-3 rounded-2xl"
            >
              {loading ? "מנתח חלל ותאורה באמצעות Gemini Vision..." : "הפעל הדמיית התאמה לחדר"}
            </Button>
          </div>

          {/* Right: AI Verdict */}
          <div className="space-y-4">
            {result ? (
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-black text-sm">ציון התאמה ויזואלית וארגונומית</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-black text-sm">
                    {result.compatibilityScore}%
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <p className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" /> ניתוח פרופורציות ומיקום בחלל:
                  </p>
                  <p>{result.spatialFitVerdict}</p>
                </div>

                <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <p className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5" /> ניתוח השתקפויות ותאורה:
                  </p>
                  <p>{result.lightingAnalysis}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 block">אביזרים משלימים מומלצים לחלל:</span>
                  {result.recommendedAccessories.map((acc) => (
                    <div
                      key={acc.sku}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                    >
                      <span className="font-semibold text-white">{acc.name}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
                        הנחת סינרגיה {acc.synergyDiscount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-400 space-y-3">
                <Sparkles className="w-10 h-10 text-amber-400/60" />
                <p className="text-sm font-bold text-slate-200">מוכן לבדיקת התאמה חכמה</p>
                <p className="text-xs leading-relaxed">
                  בחר מוצר, העלה תמונה של החדר או שולחן העבודה שלך, ולחץ על הכפתור כדי לקבל ניתוח מידות, תאורה ועיצוב מבוסס{" "}
                  <code className="text-amber-400">Gemini Vision</code>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
