"use client";

import React from "react";
import { CheckCircle2, Clock, Truck, Package, Check, AlertCircle } from "lucide-react";

export interface OrderTrackerProps {
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  shipmentStatus?: "SCHEDULED" | "DISPATCHED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  trackingNumber?: string;
  carrier?: string;
  estimatedDeliveryDate?: string;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  status,
  shipmentStatus = "SCHEDULED",
  trackingNumber,
  carrier = "ישראל פוסט אקספרס",
  estimatedDeliveryDate,
}) => {
  if (status === "CANCELLED") {
    return (
      <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-3" dir="rtl">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          <span className="font-bold block">ההזמנה בוטלה</span>
          <span className="text-[11px] text-rose-600 dark:text-rose-300">סכום העסקה זוכה במלואו לאמצעי התשלום שלך.</span>
        </div>
      </div>
    );
  }

  // Determine current active step (1 to 4)
  let currentStep = 2; // Default for CONFIRMED
  if (shipmentStatus === "DISPATCHED" || shipmentStatus === "IN_TRANSIT") {
    currentStep = 3;
  } else if (shipmentStatus === "DELIVERED") {
    currentStep = 4;
  }

  const steps = [
    { id: 1, label: "התקבלה", desc: "ההזמנה נקלטה במערכת" },
    { id: 2, label: "אישור תשלום", desc: "התשלום אושר ונשמר" },
    { id: 3, label: "בדרך אליך", desc: "נמסר לשליח עם מספר מעקב" },
    { id: 4, label: "נמסרה", desc: "החבילה הגיעה ליעדה" },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4" dir="rtl">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span className="font-bold text-slate-800 dark:text-slate-200">סטטוס משלוח ואספקה</span>
        </div>
        {trackingNumber && (
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            מספר מעקב: {trackingNumber}
          </span>
        )}
      </div>

      {/* Visual Stepper */}
      <div className="grid grid-cols-4 gap-2 relative">
        {steps.map((step) => {
          const isCompleted = step.id < currentStep || (step.id === currentStep && currentStep === 4);
          const isCurrent = step.id === currentStep && currentStep < 4;

          return (
            <div key={step.id} className="flex flex-col items-center text-center space-y-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition shadow-xs ${
                  isCompleted
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                    ? "bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-950 animate-pulse"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span className={`text-[11px] font-bold ${isCurrent ? "text-brand-600 dark:text-brand-400" : isCompleted ? "text-slate-800 dark:text-slate-200" : "text-slate-400"}`}>
                {step.label}
              </span>
              <span className="hidden sm:block text-[9px] text-slate-400 line-clamp-1">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* Shipment metadata */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
        <span>חברת שליחויות: <strong className="text-slate-700 dark:text-slate-300">{carrier}</strong></span>
        {estimatedDeliveryDate && (
          <span>זמן הגעה משוער: <strong className="text-emerald-600 dark:text-emerald-400">{estimatedDeliveryDate}</strong></span>
        )}
      </div>
    </div>
  );
};
