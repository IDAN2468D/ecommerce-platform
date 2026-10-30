"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Box,
  CreditCard,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Code,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type SagaState =
  | "PENDING"
  | "STOCK_RESERVED"
  | "PAYMENT_CAPTURED"
  | "SHIPMENT_SCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "STOCK_FAILED"
  | "PAYMENT_FAILED"
  | "SHIPMENT_FAILED";

interface SagaStep {
  id: string;
  label: string;
  subLabel: string;
  description: string;
  latencyMs: number;
  icon: React.ReactNode;
  topic: string;
  eventClass: string;
}

interface SagaTrackerProps {
  status: string;
  orderId?: string;
  shipmentId?: string;
  trackingNumber?: string;
  className?: string;
}

const STEPS: SagaStep[] = [
  {
    id: "created",
    label: "הזמנה נקלטה ב-Gateway",
    subLabel: "שלב 1 - יצירת הזמנה",
    description: "אימות אסימון JWT, בדיקת כפילות ב-Idempotency Key ושידור אירוע OrderCreatedEvent",
    latencyMs: 12,
    icon: <ShoppingBag className="w-4 h-4" />,
    topic: "order-events",
    eventClass: "OrderCreatedEvent",
  },
  {
    id: "inventory",
    label: "שריון מלאי פסימי",
    subLabel: "שלב 2 - נעילת מחסן",
    description: "בדיקת זמינות, נעילת PESSIMISTIC_WRITE ב-MongoDB ועדכון מהיר ב-Redis Cache",
    latencyMs: 4,
    icon: <Box className="w-4 h-4" />,
    topic: "inventory-events",
    eventClass: "StockReservedEvent",
  },
  {
    id: "payment",
    label: "סליקה אידמפוטנטית",
    subLabel: "שלב 3 - חיוב כספי",
    description: "אישור תשלום אידמפוטנטי ב-Payment Gateway, שמירת טרנזקציה ושידור PaymentCapturedEvent",
    latencyMs: 38,
    icon: <CreditCard className="w-4 h-4" />,
    topic: "payment-events",
    eventClass: "PaymentCapturedEvent",
  },
  {
    id: "shipping",
    label: "שילוח ולוגיסטיקה (Step 5)",
    subLabel: "שלב 4 - זימון משלוח",
    description: "הקצאת מספר מעקב רשמי IL-EXP, קביעת חברת שילוח, ושידור ShipmentScheduledEvent",
    latencyMs: 8,
    icon: <Truck className="w-4 h-4" />,
    topic: "shipping-events",
    eventClass: "ShipmentScheduledEvent",
  },
  {
    id: "completion",
    label: "סיום והפצת התראות",
    subLabel: "שלב 5 - השלמת SAGA",
    description: "השלמת תזמור מבוזר מלא, זיכוי נקודות VIP Cashback ושידור חי ב-SSE לדפדפן",
    latencyMs: 2,
    icon: <ShieldCheck className="w-4 h-4" />,
    topic: "notification-events",
    eventClass: "NotificationSentEvent",
  },
];

export const SagaTracker: React.FC<SagaTrackerProps> = ({
  status,
  orderId,
  shipmentId,
  trackingNumber,
  className = "",
}) => {
  const [inspectedStep, setInspectedStep] = useState<SagaStep | null>(null);
  const isCancelled = status === "CANCELLED" || status.includes("FAILED");

  // Determine status for 5 steps (0 to 4)
  const getStepStatus = (index: number) => {
    if (isCancelled) {
      if (index === 0) return "completed";
      if (index === 1) return status === "STOCK_FAILED" ? "error" : "completed";
      if (index === 2) return status === "PAYMENT_FAILED" ? "error" : "completed";
      if (index === 3) return status === "SHIPMENT_FAILED" ? "error" : "cancelled";
      return "cancelled";
    }

    switch (status) {
      case "COMPLETED":
      case "DELIVERED":
      case "IN_TRANSIT":
      case "CONFIRMED":
        return "completed";
      case "SHIPMENT_SCHEDULED":
        return index <= 3 ? "completed" : "active";
      case "PAYMENT_CAPTURED":
        return index <= 2 ? "completed" : index === 3 ? "active" : "pending";
      case "STOCK_RESERVED":
        return index <= 1 ? "completed" : index === 2 ? "active" : "pending";
      case "PENDING":
      default:
        return index === 0 ? "completed" : index === 1 ? "active" : "pending";
    }
  };

  const getStepPayload = (step: SagaStep) => {
    return {
      eventId: "evt_" + Math.random().toString(36).substring(2, 10),
      orderId: orderId || "e7a5c891-628a-4c22-b5b8-d21a14fba012",
      topic: step.topic,
      eventType: step.eventClass,
      latencyMs: step.latencyMs,
      trackingNumber: trackingNumber || "IL-EXP-948271",
      carrier: "Israel Post Express",
      status: "APPROVED_AND_COMMITTED",
      virtualThreads: true,
      timestamp: new Date().toISOString(),
    };
  };

  return (
    <div
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-subtle dark:shadow-none transition-colors duration-300 ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-brand-500 animate-pulse shadow-sm shadow-brand-500/50" />
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <span>תזמור מבוזר 5 שלבים (Distributed SAGA Orchestration)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                Step 5 Extended
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              לחץ על כל שלב להצגת ה-JSON Payload של הודעת ה-Kafka המתאימה
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {trackingNumber && (
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              מעקב: {trackingNumber}
            </span>
          )}
          {orderId && (
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              #{orderId.substring(0, 8)}
            </span>
          )}
        </div>
      </div>

      {/* 5-Column Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 relative">
        {STEPS.map((step, idx) => {
          const stepState = getStepStatus(idx);
          const isInspected = inspectedStep?.id === step.id;

          return (
            <div
              key={step.id}
              onClick={() => setInspectedStep(isInspected ? null : step)}
              className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300 cursor-pointer text-right group ${
                stepState === "completed"
                  ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100 hover:shadow-md"
                  : stepState === "active"
                  ? "bg-brand-50/80 dark:bg-brand-950/40 border-brand-400 dark:border-brand-600 text-brand-950 dark:text-brand-100 shadow-lg shadow-brand-500/10 ring-2 ring-brand-500/30"
                  : stepState === "error" || stepState === "cancelled"
                  ? "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-100"
                  : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${
                      stepState === "completed"
                        ? "bg-emerald-600 text-white"
                        : stepState === "active"
                        ? "bg-brand-600 text-white animate-pulse"
                        : stepState === "error"
                        ? "bg-rose-600 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {stepState === "completed" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : stepState === "active" ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : stepState === "error" ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      step.icon
                    )}
                  </div>

                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60">
                    {step.latencyMs}ms
                  </span>
                </div>

                <div className="font-bold text-xs mt-1 leading-snug">{step.label}</div>
                <div className="text-[11px] opacity-75 font-medium mt-0.5">{step.subLabel}</div>
                <p className="text-[11px] opacity-70 mt-2 leading-relaxed line-clamp-2">
                  {step.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px] font-mono">
                <span className="opacity-70">{step.topic}</span>
                <span className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-bold group-hover:underline">
                  <Code className="w-3 h-3" />
                  <span>Payload</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kafka Event JSON Payload Inspector */}
      {inspectedStep && (
        <div className="mt-5 p-4 rounded-2xl bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-400" />
              <span className="font-bold text-brand-300">
                Kafka Event: {inspectedStep.eventClass} (Topic: {inspectedStep.topic})
              </span>
            </div>
            <button
              onClick={() => setInspectedStep(null)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 overflow-x-auto text-[11px] leading-relaxed">
            {JSON.stringify(getStepPayload(inspectedStep), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
