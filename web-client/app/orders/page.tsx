"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, RefreshCw, XCircle, CheckCircle2, Clock, ArrowRight, AlertTriangle, ShieldCheck } from "lucide-react";
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
  customerId: string;
  status: "CONFIRMED" | "CANCELLED" | "PENDING";
  totalAmount: number;
  currency: string;
  paymentTransactionId: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

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
        setOrders(data.content || []);
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
    if (!confirm("האם אתה בטוח שברצונך לבטל הזמנה זו? הדבר יפעיל טרנזקציית פיצוי של SAGA לשחרור המלאי וזיכוי התשלום.")) {
      return;
    }

    setCancellingId(orderId);
    setNotification(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });

      if (res.ok) {
        setNotification(`הזמנה ${orderId.substring(0, 8)} בוטלה בהצלחה. המלאי שוחרר והסליקה זוכתה!`);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ניהול עסקאות מבוזרות</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">מעקב הזמנות ומצב SAGA</h1>
          <p className="text-sm text-slate-500 mt-1">
            היסטוריית הזמנות הלקוח (Order Service בפורט 8081) ותיעוד טרנזקציות פיצוי ב-Kafka בזמן אמת
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
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3 shadow-subtle animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-3" />
          <p className="text-sm font-medium">טוען הזמנות דרך ה-API Gateway...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-subtle">
          <div className="text-5xl">📦</div>
          <h3 className="text-xl font-bold text-slate-800">טרם בוצעו הזמנות</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            בצע הזמנה ראשונה דרך עגלת הקניות כדי לראות את תזמור ה-SAGA והאירועים המופצים ב-Kafka.
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

            return (
              <Card
                key={order.id}
                className="overflow-hidden border border-slate-200 hover:border-slate-300 transition-all space-y-5 p-6"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-base text-slate-900">
                        #{order.id}
                      </span>
                      <Badge
                        variant={isConfirmed ? "success" : isCancelled ? "destructive" : "warning"}
                        dot
                      >
                        {isConfirmed ? "הושלמה בהצלחה" : isCancelled ? "בוטלה ופוצתה" : "בתהליך"}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(order.createdAt).toLocaleString("he-IL")}</span>
                      <span>•</span>
                      <span>
                        עסקה:{" "}
                        <span className="font-mono text-slate-700 font-medium">
                          {order.paymentTransactionId || "N/A"}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 block font-medium">סך לתשלום:</span>
                      <span className="text-xl font-black text-slate-900">
                        ₪{order.totalAmount.toLocaleString()} {order.currency}
                      </span>
                    </div>

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

                {/* SAGA Visual Pipeline */}
                <SagaTracker status={sagaStatus} orderId={order.id} />

                {/* Items in Order */}
                <div className="space-y-2 pt-1">
                  <h5 className="text-xs font-bold text-slate-600">פירוט פריטים בעסקה:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <span className="font-mono font-semibold text-slate-800">{item.skuCode}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">כמות: {item.quantity}</span>
                          <span className="font-bold text-slate-900">₪{item.unitPrice.toLocaleString()}</span>
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
