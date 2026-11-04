"use client";

import React, { useState } from "react";
import { Layers, ChevronDown, ChevronUp, Bot, Sparkles } from "lucide-react";

export interface SwarmAgentBadgesProps {
  agentsInvolved: string[];
}

const AGENT_META: Record<string, { label: string; desc: string; icon: string }> = {
  SupervisorRouterAgent: {
    label: "סוכן ניתוב ראשי",
    desc: "מיפוי כוונות ופירוק מטרות מקביליות",
    icon: "🎯",
  },
  CatalogDiscoveryAgent: {
    label: "סוכן איתור וזמינות",
    desc: "חיפוש וקטורי היברידי ובדיקת מלאי חי",
    icon: "🔍",
  },
  CartPricingLoyaltyAgent: {
    label: "סוכן סל, קופונים ו-VIP",
    desc: "הוספה אוטונומית, איתור קופון מרבי וצבירת נקודות",
    icon: "🛒",
  },
  OrderLogisticsWorkspaceAgent: {
    label: "סוכן לוגיסטיקה ו-Workspace",
    desc: "מעקב DHL, חשבונית Drive ויומן Calendar",
    icon: "🚚",
  },
  KafkaAutonomousOpsAgent: {
    label: "סוכן תפעול ואירועים",
    desc: "ניטור זרמי Kafka, התראות מלאי וסנכרון עגלות",
    icon: "⚡",
  },
  ReturnsDisputeAgent: {
    label: "סוכן החזרות ו-RMA",
    desc: "אימות Vision, זיכוי VIP מידי (+10%) ואיסוף DHL",
    icon: "🔄",
  },
  PriceWatchAutoBuyAgent: {
    label: "סוכן מעקב מחיר ו-Auto-Buy",
    desc: "היסטוריית 30 יום ורכישה אוטונומית ב-SAGA",
    icon: "📈",
  },
  VisualBundleStylistAgent: {
    label: "סוכן באנדלים וסטים",
    desc: "התאמת מוצרים תואמים והנחת חבילה (12%)",
    icon: "🎨",
  },
  FraudRiskGuardAgent: {
    label: "סוכן אבטחה וסיכונים",
    desc: "בדיקת מהירות עסקאות SAGA ותחזית מלאי שבועי",
    icon: "🛡️",
  },
};

export const SwarmAgentBadges: React.FC<SwarmAgentBadgesProps> = ({ agentsInvolved }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!agentsInvolved || agentsInvolved.length === 0) return null;

  return (
    <div
      dir="rtl"
      className="rounded-2xl border border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 overflow-hidden text-xs transform-gpu transition-all"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-100/40 dark:hover:bg-indigo-900/30 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span>תיאום סוכנים אוטונומי ({agentsInvolved.length} סוכנים פעלו במקביל)</span>
        </div>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />}
      </button>

      {isOpen && (
        <div className="p-3 pt-1 border-t border-indigo-100 dark:border-indigo-900/30 space-y-1.5">
          {agentsInvolved.map((agent) => {
            const meta = AGENT_META[agent] || {
              label: agent,
              desc: "עיבוד משימה אוטונומית",
              icon: "🤖",
            };

            return (
              <div
                key={agent}
                className="flex items-start gap-2 bg-white/80 dark:bg-indigo-900/30 p-2 rounded-xl border border-indigo-100/60 dark:border-indigo-800/40"
              >
                <span className="text-sm">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 dark:text-indigo-100 text-[11px] flex items-center gap-1">
                    <span>{meta.label}</span>
                    <span className="text-[9px] text-indigo-500 font-mono">({agent})</span>
                  </div>
                  <div className="text-[10px] text-gray-700 dark:text-gray-300 truncate">{meta.desc}</div>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mt-1" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
