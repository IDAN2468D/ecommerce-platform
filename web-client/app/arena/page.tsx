"use client";

import React, { useEffect, useState } from "react";
import {
  Flame,
  Gavel,
  Users,
  Sparkles,
  Clock,
  CheckCircle2,
  Share2,
  ShoppingBag,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useCurrency } from "../../context/CurrencyContext";
import { RoomVisualizerModal } from "../../components/store/RoomVisualizerModal";

interface FlashCampaign {
  id: string;
  campaignCode: string;
  skuCode: string;
  productName: string;
  imageUrl: string;
  campaignType: "FLASH_DROP" | "LIVE_AUCTION";
  retailPrice: number;
  flashOrStartingPrice: number;
  currentHighestBid: number;
  minBidIncrement: number;
  highestBidderId?: string;
  highestBidderName?: string;
  totalStock: number;
  remainingStock: number;
  totalBidsCount: number;
  status: string;
  endsAt: string;
}

interface GroupBuySquad {
  id: string;
  squadCode: string;
  skuCode: string;
  productName: string;
  imageUrl: string;
  regularPrice: number;
  squadPrice: number;
  discountPercent: number;
  targetParticipants: number;
  currentParticipants: number;
  status: string;
  referralCode: string;
  affiliateRewardPoints: number;
  expiresAt: string;
  participantNames: string[];
}

export default function ArenaPage() {
  const { formatPrice } = useCurrency();
  const [campaigns, setCampaigns] = useState<FlashCampaign[]>([]);
  const [squads, setSquads] = useState<GroupBuySquad[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [visualizerOpen, setVisualizerOpen] = useState(false);
  const [visualizerProduct, setVisualizerProduct] = useState<string | undefined>(undefined);

  const loadArenaData = async () => {
    setLoading(true);
    try {
      const [campRes, squadRes] = await Promise.all([fetch("/api/flash-sales"), fetch("/api/group-buy")]);
      if (campRes.ok) setCampaigns(await campRes.json());
      if (squadRes.ok) setSquads(await squadRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArenaData();
  }, []);

  const showBanner = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleClaimFlashDrop = async (c: FlashCampaign) => {
    if (c.remainingStock <= 0) return;
    await fetch("/api/flash-sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId: c.id,
        action: "CLAIM",
        customerId: "usr_demo",
        quantity: 1,
      }),
    });

    setCampaigns((prev) =>
      prev.map((item) =>
        item.id === c.id
          ? {
              ...item,
              remainingStock: Math.max(0, item.remainingStock - 1),
              totalBidsCount: item.totalBidsCount + 1,
              status: item.remainingStock - 1 <= 0 ? "SOLD_OUT" : "ACTIVE",
            }
          : item
      )
    );
    showBanner(`שוריינה יחידה מ-${c.productName} במחיר מכירת בזק (${formatPrice(c.flashOrStartingPrice)})!`);
  };

  const handlePlaceBid = async (c: FlashCampaign) => {
    const nextBid = c.currentHighestBid + (c.minBidIncrement || 100);
    await fetch("/api/flash-sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId: c.id,
        action: "BID",
        customerId: "usr_demo",
        customerName: "עידן קזם (VIP)",
        bidAmount: nextBid,
      }),
    });

    setCampaigns((prev) =>
      prev.map((item) =>
        item.id === c.id
          ? {
              ...item,
              currentHighestBid: nextBid,
              highestBidderName: "עידן קזם (VIP)",
              totalBidsCount: item.totalBidsCount + 1,
            }
          : item
      )
    );
    showBanner(`הצעת מחיר חדשה של ${formatPrice(nextBid)} נרשמה בהצלחה עבור ${c.productName}!`);
  };

  const handleJoinSquad = async (sq: GroupBuySquad) => {
    await fetch("/api/group-buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        squadId: sq.id,
        customerId: "usr_demo",
        customerName: "עידן קזם",
      }),
    });

    setSquads((prev) =>
      prev.map((item) => {
        if (item.id !== sq.id) return item;
        const nextCount = item.currentParticipants + 1;
        return {
          ...item,
          currentParticipants: nextCount,
          status: nextCount >= item.targetParticipants ? "UNLOCKED" : item.status,
          participantNames: [...(item.participantNames || []), "עידן קזם"],
        };
      })
    );
    showBanner(`הצטרפת לקבוצת הרכישה של ${sq.productName}! הרווחת ${sq.affiliateRewardPoints} נקודות שותפים.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16" dir="rtl">
      <RoomVisualizerModal
        isOpen={visualizerOpen}
        onClose={() => setVisualizerOpen(false)}
        defaultProductName={visualizerProduct}
      />

      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-amber-950/30 to-slate-950 border border-amber-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            <span>זירת מסחר חיה • Redis Atomic Locks & Kafka SSE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            זירת מכירות בזק, מכרזים חיים ורכישה קבוצתית
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            השקות מוגבלות בזמן (`Flash Drops`), מכרזי `VIP` בזמן אמת (`flash-sale-auction-service`), וחדרי רכישה קבוצתית עם תגמולי שותפים (`group-buy-referral-service`).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => {
              setVisualizerProduct("Apple MacBook Pro 16 M3 Max");
              setVisualizerOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>הדמיית מוצר בחדר (AI Visualizer)</span>
          </Button>
          <button
            onClick={loadArenaData}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-amber-400 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>סנכרון זירה</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* SECTION 1: Flash Drops & Live Auctions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Gavel className="w-5 h-5 text-amber-500" />
            <span>מכירות בזק (`Flash Drops`) ומכרזים חיים (`Live Auctions`)</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">פורט 8100 • נעילה אטומית</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campaigns.map((c) => {
            const isAuction = c.campaignType === "LIVE_AUCTION";
            const stockPercent = Math.round((c.remainingStock / Math.max(1, c.totalStock)) * 100);

            return (
              <div
                key={c.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 bg-slate-950">
                    <img src={c.imageUrl} alt={c.productName} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-black bg-slate-950/85 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                      {isAuction ? <Gavel className="w-3.5 h-3.5" /> : <Flame className="w-3.5 h-3.5" />}
                      <span>{isAuction ? "מכרז חי (LIVE AUCTION)" : "מכירת בזק (FLASH DROP)"}</span>
                    </div>
                    <button
                      onClick={() => {
                        setVisualizerProduct(c.productName);
                        setVisualizerOpen(true);
                      }}
                      className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>הדמיה בחדר</span>
                    </button>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{c.campaignCode}</span>
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Clock className="w-3.5 h-3.5" /> פעיל בזמן אמת
                      </span>
                    </div>

                    <h3 className="font-black text-base text-slate-900 dark:text-white leading-snug">
                      {c.productName}
                    </h3>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block">
                          {isAuction ? "הצעה מובילה כעת:" : "מחיר Flash Drop מיוחד:"}
                        </span>
                        <span className="text-xl font-black font-mono text-amber-500">
                          {formatPrice(isAuction ? c.currentHighestBid : c.flashOrStartingPrice)}
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="text-[11px] text-slate-400 block">מחיר מחירון:</span>
                        <span className="text-xs font-mono line-through text-slate-500">
                          {formatPrice(c.retailPrice)}
                        </span>
                      </div>
                    </div>

                    {isAuction ? (
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span>מציע מוביל: <strong className="text-emerald-400">{c.highestBidderName || "דניאל כ."}</strong></span>
                        <span>סה״כ הצעות: <strong className="font-mono">{c.totalBidsCount}</strong></span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400">מלאי שנותר במבצע:</span>
                          <strong className="font-mono text-rose-500">
                            {c.remainingStock} מתוך {c.totalStock} יח׳
                          </strong>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500"
                            style={{ width: `${stockPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0">
                  {isAuction ? (
                    <Button
                      onClick={() => handlePlaceBid(c)}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black py-3 rounded-2xl flex items-center justify-center gap-2"
                    >
                      <Gavel className="w-4 h-4" />
                      <span>
                        הגש הצעה של {formatPrice(c.currentHighestBid + (c.minBidIncrement || 100))}
                      </span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleClaimFlashDrop(c)}
                      disabled={c.remainingStock <= 0}
                      className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{c.remainingStock > 0 ? "תפוס יחידה ב-Flash Drop" : "אזל המלאי במבצע"}</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: Social Group Buying & Affiliate Squads */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            <span>חדרי רכישה קבוצתית ושיווק שותפים (`Social Group Buy Squads`)</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">פורט 8102 • פתיחת הנחה אוטומטית</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {squads.map((sq) => {
            const progress = Math.min(100, Math.round((sq.currentParticipants / sq.targetParticipants) * 100));
            const isUnlocked = sq.status === "UNLOCKED" || sq.currentParticipants >= sq.targetParticipants;

            return (
              <div
                key={sq.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-slate-950">
                    <img src={sq.imageUrl} alt={sq.productName} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500 text-slate-950">
                      חיסכון של {sq.discountPercent}% ברכישה קבוצתית
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-black text-base text-slate-900 dark:text-white">{sq.productName}</h3>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block">מחיר קבוצה:</span>
                        <span className="text-xl font-black font-mono text-emerald-500">
                          {formatPrice(sq.squadPrice)}
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="text-xs text-slate-400 block">מחיר רגיל:</span>
                        <span className="text-xs font-mono line-through text-slate-500">
                          {formatPrice(sq.regularPrice)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">משתתפים בקבוצה:</span>
                        <strong className="font-mono text-emerald-500">
                          {sq.currentParticipants} / {sq.targetParticipants} הצטרפו
                        </strong>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Share2 className="w-3.5 h-3.5 text-amber-400" /> קוד שותף: <strong className="font-mono text-slate-200">{sq.referralCode}</strong>
                      </span>
                      <span className="text-amber-500 font-bold">+{sq.affiliateRewardPoints} נק׳ VIP</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Button
                    onClick={() => handleJoinSquad(sq)}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-2xl flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>{isUnlocked ? "ההנחה נפתחה! הצטרף מיד במחיר קבוצה" : "הצטרף לקבוצת הרכישה עכשיו"}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
