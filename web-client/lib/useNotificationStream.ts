"use client";

import { useEffect, useState, useCallback } from "react";

export interface SseNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  couponCode?: string;
  timestamp: number;
  read: boolean;
}

export function useNotificationStream(customerId: string = "usr_demo") {
  const [notifications, setNotifications] = useState<SseNotification[]>([]);
  const [activeToast, setActiveToast] = useState<SseNotification | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let eventSource: EventSource | null = null;
    let retryTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        eventSource = new EventSource(`/api/notifications/stream?customerId=${customerId}`);

        eventSource.onopen = () => {
          setConnected(true);
        };

        const handleIncoming = (type: string, dataStr: string) => {
          try {
            const data = JSON.parse(dataStr);
            const notif: SseNotification = {
              id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              type,
              title: data.title || "עדכון מערכת",
              message: data.message || JSON.stringify(data),
              couponCode: data.couponCode || undefined,
              timestamp: data.timestamp || Date.now(),
              read: false,
            };

            setNotifications((prev) => [notif, ...prev].slice(0, 30));
            setActiveToast(notif);
          } catch (e) {
            console.error("Failed to parse SSE data", e);
          }
        };

        eventSource.addEventListener("ORDER_CREATED", (e: MessageEvent) => {
          handleIncoming("ORDER_CREATED", e.data);
        });

        eventSource.addEventListener("STOCK_RESERVED", (e: MessageEvent) => {
          handleIncoming("STOCK_RESERVED", e.data);
        });

        eventSource.addEventListener("PAYMENT_CAPTURED", (e: MessageEvent) => {
          handleIncoming("PAYMENT_CAPTURED", e.data);
        });

        eventSource.addEventListener("PAYMENT_REFUNDED", (e: MessageEvent) => {
          handleIncoming("PAYMENT_REFUNDED", e.data);
        });

        eventSource.addEventListener("ORDER_CANCELLED", (e: MessageEvent) => {
          handleIncoming("ORDER_CANCELLED", e.data);
        });

        eventSource.addEventListener("ABANDONED_CART_COUPON", (e: MessageEvent) => {
          handleIncoming("ABANDONED_CART_COUPON", e.data);
        });

        eventSource.addEventListener("SHIPMENT_SCHEDULED", (e: MessageEvent) => {
          handleIncoming("SHIPMENT_SCHEDULED", e.data);
        });

        eventSource.addEventListener("ORDER_DISPATCHED", (e: MessageEvent) => {
          handleIncoming("ORDER_DISPATCHED", e.data);
        });

        eventSource.onerror = () => {
          setConnected(false);
          if (eventSource) {
            eventSource.close();
          }
          retryTimeout = setTimeout(connect, 5000);
        };
      } catch (err) {
        setConnected(false);
        retryTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearTimeout(retryTimeout);
    };
  }, [customerId]);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    activeToast,
    connected,
    unreadCount,
    dismissToast,
    markAllAsRead,
  };
}
