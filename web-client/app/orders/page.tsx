"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Package, FileText, RefreshCw, ExternalLink, Clock, Calendar, Cloud, CheckCircle2, XCircle, Receipt, Sparkles } from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";
import { OrderTracker } from "../../components/store/OrderTracker";
import { DigitalReceiptModal, DigitalReceiptData } from "../../components/store/DigitalReceiptModal";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

export default function OrdersPage() {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState<Record<string, any>>({});
  const [workspaceLinks, setWorkspaceLinks] = useState<Record<string, any>>({});
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedReceiptData, setSelectedReceiptData] = useState<DigitalReceiptData | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let customerId = "usr_demo";
      try {
        const u = JSON.parse(localStorage.getItem("auth_user") || "null");
        if (u?.userId) customerId = u.userId;
      } catch {}

      const res = await fetch("/api/orders", { headers: { "X-Customer-Id": customerId } });
      if (res.ok) {
        const data = await res.json();
        const list = data.map((o: any) => ({ ...o, id: o.id || o.orderId }));
        setOrders(list);

        list.forEach((ord: any) => {
          if (ord.id) {
            fetch(`/api/shipping/${ord.id}`).then((r) => (r.ok ? r.json() : null)).then((s) => s?.trackingNumber && setShipments((prev) => ({ ...prev, [ord.id]: s }))).catch(() => {});
            fetch(`/api/workspace/${ord.id}`).then((r) => (r.ok ? r.json() : null)).then((w) => w && setWorkspaceLinks((prev) => ({ ...prev, [ord.id]: w }))).catch(() => {});
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm(`האם לבטל את הזמנה #${orderId}?`)) return;
    setCancellingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
      if (res.ok) fetchOrders();
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-16" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Package className="w-7 h-7 text-amber-500" />
            <span>היסטוריית הזמנות ומעקב משלוחים</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            מעקב חי אחר חבילות, קבלות דיגיטליות, חשבוניות מס PDF וסנכרון ל-Google Workspace
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={fetchOrders} variant="outline" size="sm" icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}>
            רענן
          </Button>
          <Link href="/">
            <Button variant="primary" size="sm" className="bg-amber-500 text-slate-950 font-bold">
              לקטלוג המוצרים
            </Button>
          </Link>
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-3" />
          <p className="text-sm font-medium">טוען את היסטוריית ההזמנות שלך...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <div className="text-5xl">📦</div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">טרם בוצעו הזמנות</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            בצע הזמנה ראשונה דרך עגלת הקניות ותיהנה ממשלוח אקספרס חינם, קבלה דיגיטלית ו-5% Cashback VIP.
          </p>
          <Link href="/">
            <Button variant="primary" className="bg-amber-500 text-slate-950 font-bold">למעבר לקטלוג</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isConfirmed = order.status === "CONFIRMED";
            const isCancelled = order.status === "CANCELLED";
            const shipment = shipments[order.id];
            const workspace = workspaceLinks[order.id];

            return (
              <div key={order.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-base text-slate-900 dark:text-slate-100">#{order.id.substring(0, 8)}</span>
                      <Badge variant={isConfirmed ? "success" : isCancelled ? "destructive" : "warning"} dot>
                        {isConfirmed ? "מאושרת ונארזת" : isCancelled ? "בוטלה" : "בטיפול"}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(order.createdAt).toLocaleString("he-IL")}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      onClick={() =>
                        setSelectedReceiptData({
                          orderId: order.id,
                          items: order.items || [],
                          subtotal: order.subtotal || order.totalAmount,
                          finalTotal: order.totalAmount,
                          couponCode: order.couponCode,
                          createdAt: order.createdAt,
                        })
                      }
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      icon={<Receipt className="w-3.5 h-3.5" />}
                    >
                      קבלה דיגיטלית
                    </Button>

                    <a
                      href={`/api/orders/${order.id}/invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>חשבונית PDF</span>
                    </a>

                    {isConfirmed && (
                      <Button
                        onClick={() => handleCancelOrder(order.id)}
                        loading={cancellingId === order.id}
                        variant="danger"
                        size="sm"
                        icon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        בטל הזמנה
                      </Button>
                    )}
                  </div>
                </div>

                {/* 4-Step Visual Delivery Stepper */}
                <OrderTracker
                  status={order.status}
                  shipmentStatus={shipment?.status}
                  trackingNumber={shipment?.trackingNumber}
                  carrier={shipment?.carrier}
                  estimatedDeliveryDate={shipment?.estimatedDeliveryDate}
                />

                {/* Smart Cloud Integration Strip */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        שירותי ענן ללקוח: שמירת חשבונית ב-Google Drive ותזכורת מסירה ב-Google Calendar
                      </span>
                      <p className="text-[11px] text-slate-400">גיבוי אוטומטי של מסמכי הרכישה בחשבונך האישי</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {workspace?.driveFileId && !workspace.driveFileId.startsWith("drive-") && (
                      <a
                        href={`https://drive.google.com/file/d/${workspace.driveFileId}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <Cloud className="w-3.5 h-3.5" />
                        <span>צפה ב-Drive</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <a
                      href="https://calendar.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Google Calendar</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Thermal Receipt Modal */}
      <DigitalReceiptModal
        data={selectedReceiptData}
        isOpen={Boolean(selectedReceiptData)}
        onClose={() => setSelectedReceiptData(null)}
      />
    </div>
  );
}
