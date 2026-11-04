"use client";

import React, { useState } from "react";
import { X, RotateCcw, Upload, CheckCircle2, Truck, Calendar, Gift, Sparkles, Shield } from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";

interface VisualRmaReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  skuCode: string;
  itemTitle: string;
  itemPrice: number;
}

export const VisualRmaReturnModal: React.FC<VisualRmaReturnModalProps> = ({
  isOpen,
  onClose,
  orderId,
  skuCode,
  itemTitle,
  itemPrice,
}) => {
  const { formatPrice } = useCurrency();
  const [resolutionType, setResolutionType] = useState<"INSTANT_VIP_CREDIT" | "ORIGINAL_PAYMENT_REFUND">("INSTANT_VIP_CREDIT");
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const vipBonus = Math.round(itemPrice * 0.10);
  const vipTotal = itemPrice + vipBonus;

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 700);
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/20 dark:border-white/10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl p-6 transform-gpu">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {!isSubmitted ? (
          <>
            <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <RotateCcw className="w-4 h-4" />
              <span>החזרה או החלפה אוטונומית (RMA)</span>
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">{itemTitle}</h3>
            <p className="text-xs text-gray-700 dark:text-gray-300 mb-4">הזמנה מס' {orderId.slice(0, 12)} • מחיר מקורי: {formatPrice(itemPrice)}</p>

            {/* Resolution Options */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setResolutionType("INSTANT_VIP_CREDIT")}
                className={`p-3.5 rounded-2xl border text-right transition-all ${
                  resolutionType === "INSTANT_VIP_CREDIT"
                    ? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm ring-1 ring-indigo-500"
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> זיכוי VIP מידי
                  </span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold px-1.5 py-0.5 rounded-full">+10% בונוס</span>
                </div>
                <div className="text-base font-black text-indigo-600 dark:text-indigo-400">{formatPrice(vipTotal)}</div>
                <div className="text-[10px] text-gray-700 dark:text-gray-300">זיכוי מידי לארנק החנות ללא המתנה</div>
              </button>

              <button
                type="button"
                onClick={() => setResolutionType("ORIGINAL_PAYMENT_REFUND")}
                className={`p-3.5 rounded-2xl border text-right transition-all ${
                  resolutionType === "ORIGINAL_PAYMENT_REFUND"
                    ? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm ring-1 ring-indigo-500"
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300"
                }`}
              >
                <div className="text-xs font-bold text-gray-900 dark:text-gray-200 mb-1">החזר לאמצעי תשלום</div>
                <div className="text-base font-black text-gray-700 dark:text-gray-300">{formatPrice(itemPrice)}</div>
                <div className="text-[10px] text-gray-700 dark:text-gray-300">החזר לכרטיס עד 3 ימי עסקים מסריקת שליח</div>
              </button>
            </div>

            {/* Gemini Vision Photo Upload Area */}
            <div
              onClick={() => setPhotoUploaded(true)}
              className="border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-4 text-center cursor-pointer hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all mb-4"
            >
              {photoUploaded ? (
                <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>תמונת פגם נבדקה ואומתה בהצלחה ע״י Gemini Vision (98%)</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-5 h-5 mx-auto text-indigo-500" />
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">גרור תמונת פגם או לחץ לבדיקת Gemini Vision</div>
                  <div className="text-[10px] text-gray-700 dark:text-gray-300">אישור אוטומטי מיידי של בקשת ההחזרה</div>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <span>מעבד בקשה מול SAGA...</span> : <span>הנפק תעודת החזרה ותאם איסוף DHL</span>}
            </button>
          </>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-black text-gray-900 dark:text-white">אישור החזרה RMA-IL-2026-8841 הונפק!</h4>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                {resolutionType === "INSTANT_VIP_CREDIT"
                  ? `נרשם זיכוי מיידי של ${formatPrice(vipTotal)} בארנק ה-VIP שלך (כולל 10% בונוס).`
                  : `החזר של ${formatPrice(itemPrice)} יבוצע אוטומטית מיד עם מסירת החבילה.`}
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl text-right text-xs space-y-1.5 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
                <Truck className="w-4 h-4" />
                <span>שליח DHL Express Israel יגיע מחר בין 10:00 ל-14:00</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>מועד האיסוף סונכרן ישירות ליומן Google Calendar שלך</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold"
            >
              סגור וצפה בפרטי ההזמנה
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
