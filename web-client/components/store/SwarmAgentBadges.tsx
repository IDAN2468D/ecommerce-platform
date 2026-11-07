"use client";

import React, { useState } from "react";
import { Layers, ChevronDown, ChevronUp, Zap, CheckCircle2 } from "lucide-react";

export interface SwarmAgentBadgesProps {
  agentsInvolved: string[];
}

const AGENT_META: Record<string, { label: string; desc: string; icon: string; ms: string }> = {
  SupervisorRouterAgent: {
    label: "סוכן ניתוב ראשי",
    desc: "מיפוי כוונות ופירוק מטרות מקביליות בין 15 סוכנים",
    icon: "🎯",
    ms: "4ms",
  },
  CatalogDiscoveryAgent: {
    label: "סוכן איתור וזמינות",
    desc: "חיפוש וקטורי היברידי ובדיקת מלאי חי",
    icon: "🔍",
    ms: "11ms",
  },
  CartPricingLoyaltyAgent: {
    label: "סוכן סל, קופונים ו-VIP",
    desc: "הוספה אוטונומית, איתור קופון מרבי וצבירת נקודות",
    icon: "🛒",
    ms: "8ms",
  },
  OrderLogisticsWorkspaceAgent: {
    label: "סוכן לוגיסטיקה ו-Workspace",
    desc: "מעקב DHL, חשבונית Drive ויומן Calendar",
    icon: "🚚",
    ms: "12ms",
  },
  KafkaAutonomousOpsAgent: {
    label: "סוכן תפעול ואירועים",
    desc: "ניטור זרמי Kafka, התראות מלאי וסנכרון עגלות",
    icon: "⚡",
    ms: "6ms",
  },
  ReturnsDisputeAgent: {
    label: "סוכן החזרות ו-RMA",
    desc: "אימות Vision, זיכוי VIP מידי (+10%) ואיסוף DHL",
    icon: "🔄",
    ms: "15ms",
  },
  PriceWatchAutoBuyAgent: {
    label: "סוכן מעקב מחיר ו-Auto-Buy",
    desc: "היסטוריית 30 יום ורכישה אוטונומית ב-SAGA",
    icon: "📈",
    ms: "9ms",
  },
  VisualBundleStylistAgent: {
    label: "סוכן באנדלים וסטים",
    desc: "התאמת מוצרים תואמים והנחת חבילה (12%)",
    icon: "🎨",
    ms: "13ms",
  },
  FraudRiskGuardAgent: {
    label: "סוכן אבטחה וסיכונים",
    desc: "בדיקת מהירות עסקאות SAGA ותחזית מלאי שבועי",
    icon: "🛡️",
    ms: "5ms",
  },
  DynamicBargainingAgent: {
    label: "סוכן מיקוח ומשא ומתן",
    desc: "ניהול מו״מ בזמן אמת והנפקת שוברי הנחה אישיים",
    icon: "🤝",
    ms: "10ms",
  },
  AuctionSniperFlashAgent: {
    label: "סוכן צלף מכרזים ו-Flash",
    desc: "צליפת מכרזים בשניות הסיום ונעילת מלאי אטומית",
    icon: "⚡",
    ms: "7ms",
  },
  BnplFinancialAdvisorAgent: {
    label: "סוכן אשראי ופריסת BNPL",
    desc: "חיתום 4 תשלומים ב-0% ריבית ושילוב נקודות VIP",
    icon: "💳",
    ms: "9ms",
  },
  GroupSquadMatchmakerAgent: {
    label: "סוכן שידוך קבוצות רכישה",
    desc: "צירוף אוטומטי לחדרי רכישה קבוצתית להנחת 28%",
    icon: "👥",
    ms: "11ms",
  },
  WarrantyEscrowArbitratorAgent: {
    label: "סוכן בוררות נאמנות ואחריות",
    desc: "אימות חתימות SHA-256 והגנת כספי Smart Escrow",
    icon: "🔐",
    ms: "6ms",
  },
  TradeInValuationAgent: {
    label: "סוכן שמאות טרייד-אין (Vision)",
    desc: "הערכת שווי מכשיר ישן והנפקת שובר קיזוז מיידי",
    icon: "♻️",
    ms: "14ms",
  },
};

export const SwarmAgentBadges: React.FC<SwarmAgentBadgesProps> = ({ agentsInvolved }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!agentsInvolved || agentsInvolved.length === 0) return null;

  return (
    <div
      dir="rtl"
      className="rounded-2xl border border-indigo-300/60 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-50/70 via-white to-amber-50/40 dark:from-indigo-950/40 dark:via-slate-900/80 dark:to-amber-950/20 overflow-hidden text-xs shadow-sm transition-all"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-100/40 dark:hover:bg-indigo-900/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-500" />
          <span>גרף זרימת נחיל הסוכנים ({agentsInvolved.length} סוכנים מתוך 15 פעלו במקביל)</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-indigo-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-indigo-400" />
        )}
      </button>

      {/* Compact Animated Flow Strip */}
      <div className="px-3.5 pb-2 flex flex-wrap items-center gap-1.5">
        {agentsInvolved.map((agent, idx) => {
          const meta = AGENT_META[agent] || {
            label: agent,
            desc: "עיבוד משימה אוטונומית",
            icon: "🤖",
            ms: "8ms",
          };
          return (
            <React.Fragment key={agent}>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-800/70 text-[10px] font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
                <span className="text-emerald-500 font-mono">({meta.ms})</span>
              </span>
              {idx < agentsInvolved.length - 1 && (
                <span className="text-indigo-400 font-mono text-[10px]">←</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {isOpen && (
        <div className="p-3 pt-2 border-t border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
          {agentsInvolved.map((agent, idx) => {
            const meta = AGENT_META[agent] || {
              label: agent,
              desc: "עיבוד משימה אוטונומית",
              icon: "🤖",
              ms: "8ms",
            };

            return (
              <div
                key={agent}
                className="flex items-start gap-2.5 bg-white/90 dark:bg-slate-950/60 p-2.5 rounded-xl border border-indigo-100/80 dark:border-indigo-800/40"
              >
                <span className="text-base shrink-0">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 dark:text-indigo-100 text-[11px] flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-mono text-[9px]">
                        שלב {idx + 1}
                      </span>
                      <span>{meta.label}</span>
                    </div>
                    <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-0.5 shrink-0">
                      <Zap className="w-2.5 h-2.5" /> {meta.ms}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
                    {meta.desc}
                  </div>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-1" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
