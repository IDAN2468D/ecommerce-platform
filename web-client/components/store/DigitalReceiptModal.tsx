"use client";

import React, { useRef } from "react";
import { X, Printer, Download, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";
import { Button } from "../ui/Button";

export interface DigitalReceiptData {
  orderId: string;
  items: Array<{
    skuCode: string;
    name?: string;
    productName?: string;
    unitPrice: number;
    quantity: number;
  }>;
  subtotal: number;
  discountAmount?: number;
  finalTotal: number;
  couponCode?: string | null;
  createdAt?: string;
  cashbackEarned?: number;
}

export interface DigitalReceiptModalProps {
  data: DigitalReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  data,
  isOpen,
  onClose,
}) => {
  const { formatPrice } = useCurrency();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data) return null;

  const dateStr = data.createdAt
    ? new Date(data.createdAt).toLocaleString("he-IL")
    : new Date().toLocaleString("he-IL");

  const vat = Math.round(data.finalTotal * 0.18);
  const beforeVat = data.finalTotal - vat;
  const cashback = data.cashbackEarned ?? Math.round(data.finalTotal * 0.05);

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const handleDownloadPdf = () => {
    window.open(`/api/orders/${data.orderId}/invoice`, "_blank");
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      dir="rtl"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4"
      >
        {/* Header Printer Slot */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center text-amber-400">
                <Printer className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-100">קבלה דיגיטלית חכמה</h3>
              <span className="text-[10px] text-slate-400 font-mono">Store 2026 Thermal Receipt</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal Paper Container */}
        <div
          ref={receiptRef}
          className="receipt-paper-edge bg-[#FAF8F5] text-slate-900 p-6 rounded-t-2xl font-mono text-xs space-y-4 shadow-xl select-none"
        >
          {/* Store Logo & Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400">
            <div className="text-base font-black tracking-tight text-slate-950">STORE 2026 • PREMIUM TECH</div>
            <div className="text-[11px] text-slate-600">רחוב רוטשילד 45, תל אביב-יפו • ע.מ 516849201</div>
            <div className="text-[10px] text-slate-500 pt-1">אסמכתא אלקטרונית רשמית לפי תקן רשות המיסים</div>
          </div>

          {/* Metadata Row */}
          <div className="space-y-1 text-[11px] text-slate-700 pb-2 border-b border-dashed border-slate-300">
            <div className="flex justify-between">
              <span>מספר הזמנה:</span>
              <strong className="font-bold text-slate-900">#{data.orderId.substring(0, 8)}</strong>
            </div>
            <div className="flex justify-between">
              <span>תאריך ושעה:</span>
              <span>{dateStr}</span>
            </div>
            <div className="flex justify-between">
              <span>אמצעי תשלום:</span>
              <span>כרטיס אשראי (אושר)</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2 py-1">
            <div className="flex justify-between font-bold text-slate-900 text-[11px] pb-1 border-b border-slate-300">
              <span>תיאור הפריט</span>
              <span>סה״כ</span>
            </div>
            {data.items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <span className="truncate max-w-[200px]">
                  {it.quantity}x {it.productName || it.name || it.skuCode}
                </span>
                <span>{formatPrice(it.unitPrice * it.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-2 border-t border-dashed border-slate-400 space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span>סכום ביניים:</span>
              <span>{formatPrice(data.subtotal)}</span>
            </div>
            {data.discountAmount && data.discountAmount > 0 ? (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>הנחת קופון ({data.couponCode || "מבצע"}):</span>
                <span>-{formatPrice(data.discountAmount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-slate-600">
              <span>מתוכו מע״מ (18%):</span>
              <span>{formatPrice(vat)}</span>
            </div>
            <div className="flex justify-between font-black text-sm text-slate-950 pt-2 border-t border-slate-400">
              <span>סה״כ שולם:</span>
              <span className="text-base">{formatPrice(data.finalTotal)}</span>
            </div>
          </div>

          {/* Cashback Banner */}
          <div className="p-2.5 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-950 text-center text-[11px] font-bold">
            🎉 נצברו {formatPrice(cashback)} ב-Cashback VIP בחשבונך!
          </div>

          {/* Vector Barcode */}
          <div className="text-center pt-2 pb-4">
            <div className="tracking-[6px] text-xs font-black text-slate-800">||| | |||| | ||| || ||| |</div>
            <div className="text-[9px] text-slate-500 pt-0.5 font-mono">{data.orderId}</div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            onClick={handleDownloadPdf}
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            icon={<Download className="w-3.5 h-3.5" />}
          >
            הורד PDF
          </Button>
          <Button
            onClick={handlePrint}
            variant="primary"
            size="sm"
            className="flex-1 text-xs bg-amber-500 text-slate-950 font-bold"
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            הדפס קבלה
          </Button>
        </div>
      </div>
    </div>
  );
};
