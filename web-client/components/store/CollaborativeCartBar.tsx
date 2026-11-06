"use client";

import React, { useState } from "react";
import { Users, Share2, Copy, Check, Radio, LogOut, Activity, Sparkles, ChevronDown } from "lucide-react";
import { SharedCartParticipant, SharedCartActivity } from "@/lib/shared-cart-store";

interface CollaborativeCartBarProps {
  roomId: string;
  participants: SharedCartParticipant[];
  activities: SharedCartActivity[];
  currentUserId?: string;
  onLeave: () => void;
}

export function CollaborativeCartBar({
  roomId,
  participants,
  activities,
  currentUserId,
  onLeave,
}: CollaborativeCartBarProps) {
  const [copied, setCopied] = useState(false);
  const [showActivities, setShowActivities] = useState(false);

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/cart?shared=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const latestActivity = activities && activities.length > 0 ? activities[0] : null;

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-emerald-950/30 p-4 shadow-lg backdrop-blur-md">
      {/* Glow highlight */}
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Status & Active Users */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>סל קניות שיתופי חי</span>
          </div>

          <div className="flex items-center -space-x-2 space-x-reverse">
            {participants.map((p, idx) => {
              const isMe = p.id === currentUserId;
              return (
                <div
                  key={p.id || idx}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 text-xs font-extrabold text-white shadow ${
                    p.avatarColor || "bg-emerald-600"
                  }`}
                  title={`${p.name}${isMe ? " (אתה)" : ""}`}
                >
                  {p.name ? p.name.charAt(0).toUpperCase() : "U"}
                  {isMe && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-1 ring-slate-900" />
                  )}
                </div>
              );
            })}
          </div>

          <span className="text-xs text-slate-300 font-medium">
            {participants.length} {participants.length === 1 ? "קונה מחובר" : "קונים מחוברים כרגע"}
          </span>

          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            חדר: {roomId}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          {latestActivity && (
            <button
              onClick={() => setShowActivities(!showActivities)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition"
              title="הצג היסטוריית פעולות"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="max-w-[150px] truncate text-[11px]">{latestActivity.text}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-900/30"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>הקישור הועתק!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>שתף עגלה</span>
              </>
            )}
          </button>

          <button
            onClick={onLeave}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 text-xs text-slate-400 transition"
            title="עזוב סל שיתופי וחזור לסל מקומי"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>עזוב סל</span>
          </button>
        </div>
      </div>

      {/* Live Activity Dropdown */}
      {showActivities && activities && activities.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800/80">
          <p className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            פעולות אחרונות בעגלה המשותפת:
          </p>
          <div className="space-y-1.5 max-h-32 overflow-y-auto text-xs pr-1">
            {activities.slice(0, 5).map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between text-slate-300 bg-slate-900/40 px-2 py-1 rounded"
              >
                <span>{act.text}</span>
                <span className="text-[10px] text-slate-500">
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
