import React from "react";
import { CheckCircle2, Clock, AlertCircle, RefreshCw, Box, CreditCard, ShoppingBag, ShieldCheck } from "lucide-react";

export type SagaState = "PENDING" | "STOCK_RESERVED" | "PAYMENT_CAPTURED" | "COMPLETED" | "CANCELLED" | "STOCK_FAILED" | "PAYMENT_FAILED";

interface SagaStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface SagaTrackerProps {
  status: string;
  orderId?: string;
  className?: string;
}

const STEPS: SagaStep[] = [
  {
    id: "created",
    label: "הזמנה נוצרה",
    description: "נשלח אירוע OrderCreated ל-Kafka",
    icon: <ShoppingBag className="w-4 h-4" />,
  },
  {
    id: "inventory",
    label: "שריון מלאי פסימי",
    description: "בדיקת זמינות ונעילת מלאי במחסן",
    icon: <Box className="w-4 h-4" />,
  },
  {
    id: "payment",
    label: "סליקה אידמפוטנטית",
    description: "אישור וחיוב כספי ב-Payment Gateway",
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    id: "completion",
    label: "השלמת תזמור SAGA",
    description: "סטטוס הזמנה סופי והפצת התראות",
    icon: <ShieldCheck className="w-4 h-4" />,
  },
];

export const SagaTracker: React.FC<SagaTrackerProps> = ({ status, orderId, className = "" }) => {
  const isCancelled = status === "CANCELLED" || status.includes("FAILED");

  // Determine current active step index (0 to 3)
  const getStepStatus = (index: number) => {
    if (isCancelled) {
      if (index === 0) return "completed";
      if (index === 1) return status === "STOCK_FAILED" ? "error" : "completed";
      if (index === 2) return status === "PAYMENT_FAILED" ? "error" : "cancelled";
      return "cancelled";
    }

    switch (status) {
      case "COMPLETED":
        return "completed";
      case "PAYMENT_CAPTURED":
        return index <= 2 ? "completed" : "pending";
      case "STOCK_RESERVED":
        return index <= 1 ? "completed" : index === 2 ? "active" : "pending";
      case "PENDING":
      default:
        return index === 0 ? "completed" : index === 1 ? "active" : "pending";
    }
  };

  return (
    <div className={`p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle ${className}`}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
          <h4 className="font-bold text-slate-900 text-sm">
            ציר זמן תזמור מבוזר (SAGA Choreography)
          </h4>
        </div>
        {orderId && (
          <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            #{orderId.substring(0, 8)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {STEPS.map((step, idx) => {
          const stepState = getStepStatus(idx);

          return (
            <div
              key={step.id}
              className={`relative flex flex-col p-4 rounded-xl border transition-all duration-300 ${
                stepState === "completed"
                  ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                  : stepState === "active"
                  ? "bg-brand-50/70 border-brand-300 text-brand-950 shadow-md shadow-brand-500/10"
                  : stepState === "error" || stepState === "cancelled"
                  ? "bg-rose-50/60 border-rose-200 text-rose-950"
                  : "bg-slate-50/60 border-slate-200/60 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    stepState === "completed"
                      ? "bg-emerald-600 text-white"
                      : stepState === "active"
                      ? "bg-brand-600 text-white animate-pulse"
                      : stepState === "error" || stepState === "cancelled"
                      ? "bg-rose-600 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {stepState === "completed" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : stepState === "active" ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : stepState === "error" || stepState === "cancelled" ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider opacity-75">
                  שלב {idx + 1}
                </span>
              </div>

              <h5 className="font-bold text-sm mb-1">{step.label}</h5>
              <p className="text-xs opacity-80 leading-relaxed">{step.description}</p>
            </div>
          );
        })}
      </div>

      {isCancelled && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>הופעל מנגנון פיצוי (Compensating Transaction):</strong> האירועים בוטלו, שריון המלאי שוחרר והכסף הוחזר ללקוח.
          </span>
        </div>
      )}
    </div>
  );
};
