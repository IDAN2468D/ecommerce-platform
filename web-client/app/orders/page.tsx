"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Truck,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { SagaTracker } from "../../components/SagaTracker";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";

interface OrderItem {
  id: string;
  skuCode: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  orderId?: string;
  customerId: string;
  status: "CONFIRMED" | "CANCELLED" | "PENDING";
  totalAmount: number;
  currency: string;
  paymentTransactionId: string;
  createdAt: string;
  items: OrderItem[];
  couponCode?: string;
  discountAmount?: number;
}

interface ShipmentInfo {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: "SCHEDULED" | "DISPATCHED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  estimatedDeliveryDate?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [shipments, setShipments] = useState<Record<string, ShipmentInfo>>({});
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [advancingShipmentId, setAdvancingShipmentId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      const savedToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (savedToken) {
        headers["Authorization"] = `Bearer ${savedToken}`;
      }
      const res = await fetch("/api/orders?page=0&size=20", { headers });
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.content || [];
        const orderList: Order[] = rawList.map((ord: any) => {
          const actualId = ord.id || ord.orderId || "";
          return {
            ...ord,
            id: actualId,
            orderId: actualId,
          };
        });
        setOrders(orderList);

        // Fetch shipping info for each confirmed order
        orderList.forEach((ord) => {
          if (ord.status === "CONFIRMED" && ord.id) {
            fetch(`/api/shipping/${ord.id}`)
              .then((r) => (r.ok ? r.json() : null))
              .then((shipment) => {
                if (shipment && shipment.trackingNumber) {
                  setShipments((prev) => ({ ...prev, [ord.id]: shipment }));
                }
              })
              .catch(() => {});
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("האם אתה בטוח שברצונך לבטל הזמנה זו? הדבר יפעיל טרנזקציית פיצוי של SAGA לשחרור המלאי, זיכוי התשלום וביטול המשלוח.")) {
      return;
    }

    setCancellingId(orderId);
    setNotification(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });

      if (res.ok) {
        setNotification(`הזמנה ${orderId.substring(0, 8)} בוטלה בהצלחה. המלאי שוחרר, הסליקה זוכתה והמשלוח בוטל!`);
        await fetchOrders();
      } else {
        const err = await res.json();
        alert(err.error || "ביטול ההזמנה נכשל");
      }
    } catch (e: any) {
      alert("שגיאת תקשורת: " + e.message);
    } finally {
      setCancellingId(null);
    }
  };

  const handleAdvanceShipment = async (shipmentId: string, orderId: string) => {
    setAdvancingShipmentId(shipmentId);
    try {
      const res = await fetch(`/api/shipping/${shipmentId}/advance`, {
        method: "POST",
      });
      if (res.ok) {
        const updated = await res.json();
        setShipments((prev) => ({ ...prev, [orderId]: updated }));
      }
    } catch (err: any) {
      console.error("Failed to advance shipment:", err);
    } finally {
      setAdvancingShipmentId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-semibold border border-brand-200 dark:border-brand-800 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ניהול עסקאות מבוזרות v2.0</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">מעקב הזמנות ומצב SAGA</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            תזמור SAGA ב-5 שלבים, הפקת חשבוניות מס רשמיות ב-PDF, ומעקב שילוח חי ב-Kafka KRaft
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchOrders}
            loading={loading}
            variant="outline"
            size="md"
            icon={<RefreshCw className="w-4 h-4" />}
          >
            רענן הזמנות
          </Button>
          <Link href="/">
            <Button variant="primary" size="md">
              קטלוג מוצרים
            </Button>
          </Link>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3 shadow-subtle animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-3" />
          <p className="text-sm font-medium">טוען הזמנות דרך ה-API Gateway...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4 shadow-subtle">
          <div className="text-5xl">📦</div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">טרם בוצעו הזמנות</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            בצע הזמנה ראשונה דרך עגלת הקניות כדי לראות את תזמור ה-SAGA המלא ב-5 שלבים, שילוח וחשבונית PDF.
          </p>
          <Link href="/">
            <Button variant="primary" size="lg">
              למעבר לקטלוג
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isConfirmed = order.status === "CONFIRMED";
            const isCancelled = order.status === "CANCELLED";
            const sagaStatus = isConfirmed ? "COMPLETED" : isCancelled ? "CANCELLED" : "PENDING";
            const shipment = shipments[order.id];

            return (
              <Card
                key={order.id}
                className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all space-y-5 p-6 shadow-subtle"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-base text-slate-900 dark:text-slate-100">
                        #{order.id}
                      </span>
                      <Badge
                        variant={isConfirmed ? "success" : isCancelled ? "destructive" : "warning"}
                        dot
                      >
                        {isConfirmed ? "הושלמה בהצלחה (SAGA שלב 5)" : isCancelled ? "בוטלה ופוצתה" : "בתהליך"}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(order.createdAt).toLocaleString("he-IL")}</span>
                      <span>•</span>
                      <span>
                        עסקה:{" "}
                        <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                          {order.paymentTransactionId || "N/A"}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 block font-medium">סך ששולם:</span>
                      <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                        ₪{order.totalAmount.toLocaleString()} {order.currency}
                      </span>
                    </div>

                    {/* Official Hebrew PDF Invoice Button */}
                    <a
                      href={`/api/orders/${order.id}/invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition border border-slate-200 dark:border-slate-700 shadow-sm"
                      title="הורד חשבונית מס וקבלה רשמית בפורמט PDF"
                    >
                      <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      <span>חשבונית PDF (עברית)</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>

                    {isConfirmed && (
                      <Button
                        onClick={() => handleCancelOrder(order.id)}
                        loading={cancellingId === order.id}
                        variant="danger"
                        size="sm"
                        icon={<XCircle className="w-4 h-4" />}
                      >
                        בטל הזמנה (SAGA)
                      </Button>
                    )}
                  </div>
                </div>

                {/* SAGA 5-Stage Visual Pipeline */}
                <SagaTracker status={sagaStatus} orderId={order.id} />

                {/* Real-time Shipping Delivery Card */}
                {shipment && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-blue-500/10 border border-blue-400/30 text-slate-800 dark:text-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            משלוח מתואם: {shipment.carrier}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                            {shipment.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          מספר מעקב בינלאומי: <strong>{shipment.trackingNumber}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdvanceShipment(shipment.id, order.id)}
                        disabled={advancingShipmentId === shipment.id || shipment.status === "DELIVERED"}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-sm transition disabled:opacity-50"
                      >
                        {advancingShipmentId === shipment.id ? "מעדכן..." : "קדם שלב שילוח (Live Demo)"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Items in Order */}
                <div className="space-y-2 pt-1">
                  <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400">פירוט פריטים בעסקה:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50/80 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{item.skuCode}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 dark:text-slate-400">כמות: {item.quantity}</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">₪{item.unitPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}