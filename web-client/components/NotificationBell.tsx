"use client";

import React, { useState } from "react";
import { Bell, CheckCheck, Clock, X } from "lucide-react";
import { SseNotification } from "../lib/useNotificationStream";

interface NotificationBellProps {
  notifications: SseNotification[];
  unreadCount: number;
  connected: boolean;
  onMarkAllAsRead: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  unreadCount,
  connected,
  onMarkAllAsRead,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            onMarkAllAsRead();
          }
        }}
        className="relative p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-slate-700 bg-white shadow-sm flex items-center justify-center"
        title={connected ? "מחובר לשידור התראות חי (SSE)" : "מנסה להתחבר לשידור חי..."}
      >
        <Bell className="w-4 h-4" />

        {/* Live SSE pulse status dot */}
        <span
          className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${
            connected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
          }`}
        />

        {/* Unread badge count */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-fade-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 sm:right-auto sm:left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200/90 shadow-2xl z-50 overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">התראות מערכת חיות (SSE)</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    connected ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {connected ? "מחובר" : "מתחבר..."}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Bell className="w-8 h-8 mx-auto opacity-30" />
                  <p className="text-xs">טרם התקבלו התראות. בצע הזמנה כדי לראות אירועים בזמן אמת!</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-3.5 hover:bg-slate-50 transition space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-slate-800">{notif.title}</h5>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.timestamp).toLocaleTimeString("he-IL", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>סמן הכל כנקרא</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
