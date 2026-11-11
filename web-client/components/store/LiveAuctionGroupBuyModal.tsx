"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Gavel,
  Users,
  Timer,
  Zap,
  Flame,
  X,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Copy,
  ArrowUpRight,
  Target,
  Clock,
  Coins,
  ChevronRight,
  Award,
} from "lucide-react";
import { Button } from "../ui/Button";
import { useCurrency } from "../../context/CurrencyContext";

export interface LiveAuctionCampaign {
  id: string;
  campaignCode: string;
  skuCode: string;
  productName: string;
  imageUrl: string;
  campaignType: "LIVE_AUCTION" | "FLASH_DROP";
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
  bidHistory?: Array<{
    bidId: string;
    customerId: string;
    customerName: string;
    amount: number;
    timestamp: string;
  }>;
}

export interface GroupBuySquad {
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

interface LiveAuctionGroupBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "auction" | "group_buy";
  initialCampaign?: LiveAuctionCampaign;
  initialSquad?: GroupBuySquad;
  onBidPlaced?: (campaignId: string, bidAmount: number) => void;
  onSquadJoined?: (squadId: string) => void;
}

const DEFAULT_AUCTION: LiveAuctionCampaign = {
  id: "auc_macbook_m3_max",
  campaignCode: "AUC-MACBOOK-M3-MAX",
  skuCode: "COMP-MACBOOK-M3",
  productName: "Apple MacBook Pro 16 M3 Max 64GB Collector's Bundle",
  imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
  campaignType: "LIVE_AUCTION",
  retailPrice: 14990,
  flashOrStartingPrice: 9500,
  currentHighestBid: 10450,
  minBidIncrement: 150,
  highestBidderId: "usr_vip_88",
  highestBidderName: "דניאל כ. (VIP)",
  totalStock: 1,
  remainingStock: 1,
  totalBidsCount: 12,
  status: "ACTIVE",
  endsAt: new Date(Date.now() + 2 * 3600 * 1000 + 45 * 60 * 1000).toISOString(),
  bidHistory: [
    {
      bidId: "BID-901",
      customerId: "usr_vip_88",
      customerName: "דניאל כ. (VIP)",
      amount: 10450,
      timestamp: new Date(Date.now() - 45 * 1000).toISOString(),
    },
    {
      bidId: "BID-900",
      customerId: "usr_vip_12",
      customerName: "רועי א.",
      amount: 10300,
      timestamp: new Date(Date.now() - 140 * 1000).toISOString(),
    },
    {
      bidId: "BID-899",
      customerId: "usr_vip_44",
      customerName: "מיכל ש.",
      amount: 10150,
      timestamp: new Date(Date.now() - 320 * 1000).toISOString(),
    },
    {
      bidId: "BID-898",
      customerId: "usr_vip_09",
      customerName: "יונתן ר.",
      amount: 9850,
      timestamp: new Date(Date.now() - 650 * 1000).toISOString(),
    },
  ],
};

const DEFAULT_SQUAD: GroupBuySquad = {
  id: "squad_dyson_v15",
  squadCode: "SQUAD-DYSON-V15",
  skuCode: "HOME-DYSON-V15",
  productName: "Dyson V15 Detect Absolute Laser Vacuum Bundle",
  imageUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80",
  regularPrice: 3190,
  squadPrice: 2290,
  discountPercent: 28,
  targetParticipants: 10,
  currentParticipants: 8,
  status: "OPEN",
  referralCode: "REF-NEXUS-DYSON-VIP",
  affiliateRewardPoints: 120,
  expiresAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
  participantNames: ["עידן ק.", "נועה ל.", "יונתן מ.", "מאיה ש.", "אלון ב.", "שירה ד.", "גיא ר.", "תמר כ."],
};

export const LiveAuctionGroupBuyModal: React.FC<LiveAuctionGroupBuyModalProps> = ({
  isOpen,
  onClose,
  defaultMode = "auction",
  initialCampaign,
  initialSquad,
  onBidPlaced,
  onSquadJoined,
}) => {
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<"auction" | "group_buy">(defaultMode);

  // Auction State
  const [campaign, setCampaign] = useState<LiveAuctionCampaign>(initialCampaign || DEFAULT_AUCTION);
  const [customBidAmount, setCustomBidAmount] = useState<number>(0);
  const [bidSnipeEnabled, setBidSnipeEnabled] = useState<boolean>(false);
  const [snipeCeiling, setSnipeCeiling] = useState<number>(11500);
  const [biddingLoading, setBiddingLoading] = useState<boolean>(false);
  const [timeLeftStr, setTimeLeftStr] = useState<string>("00:00:00");
  const [isSnipeArmed, setIsSnipeArmed] = useState<boolean>(false);

  // Group Buy State
  const [squad, setSquad] = useState<GroupBuySquad>(initialSquad || DEFAULT_SQUAD);
  const [hasJoinedSquad, setHasJoinedSquad] = useState<boolean>(false);
  const [joiningLoading, setJoiningLoading] = useState<boolean>(false);
  const [copiedReferral, setCopiedReferral] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (initialCampaign) setCampaign(initialCampaign);
    if (initialSquad) setSquad(initialSquad);
    setActiveTab(defaultMode);
  }, [initialCampaign, initialSquad, defaultMode]);

  // Set default custom bid to next valid increment
  useEffect(() => {
    const minInc = campaign.minBidIncrement || 100;
    setCustomBidAmount(campaign.currentHighestBid + minInc);
    if (snipeCeiling <= campaign.currentHighestBid) {
      setSnipeCeiling(campaign.currentHighestBid + minInc * 4);
    }
  }, [campaign.currentHighestBid, campaign.minBidIncrement]);

  // Real-time ticking countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const targetTime = new Date(activeTab === "auction" ? campaign.endsAt : squad.expiresAt).getTime();
      const diff = Math.max(0, targetTime - Date.now());

      if (diff === 0) {
        setTimeLeftStr("00:00:00");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (n: number) => n.toString().padStart(2, "0");
      setTimeLeftStr(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);

      // Auto-Snipe trigger simulator when 5 seconds remaining
      if (bidSnipeEnabled && diff <= 5000 && !isSnipeArmed) {
        setIsSnipeArmed(true);
        triggerAutoSnipeBid();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, activeTab, campaign.endsAt, squad.expiresAt, bidSnipeEnabled, isSnipeArmed]);

  const triggerAutoSnipeBid = () => {
    const snipeBid = campaign.currentHighestBid + campaign.minBidIncrement;
    if (snipeBid <= snipeCeiling) {
      executePlaceBid(snipeBid, "רובוט צלף (Auto-Snipe AI)");
      setNotice(`רובוט הצלף הגיש בהצלחה הצעה אוטונומית של ${formatPrice(snipeBid)} בשניות האחרונות!`);
    }
  };

  const handleQuickIncrement = (increment: number) => {
    setCustomBidAmount((prev) => prev + increment);
  };

  const handleManualBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customBidAmount <= campaign.currentHighestBid) {
      alert(`ההצעה חייבת להיות לפחות ${formatPrice(campaign.currentHighestBid + campaign.minBidIncrement)}`);
      return;
    }
    await executePlaceBid(customBidAmount, "עידן קזם (VIP)");
  };

  const executePlaceBid = async (amount: number, bidderName: string) => {
    setBiddingLoading(true);
    try {
      // POST to flash sales API
      await fetch("/api/flash-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign.id,
          action: "BID",
          customerId: "usr_vip_current",
          customerName: bidderName,
          bidAmount: amount,
        }),
      });

      const newBidEntry = {
        bidId: `BID-${Date.now().toString().slice(-4)}`,
        customerId: "usr_vip_current",
        customerName: bidderName,
        amount,
        timestamp: new Date().toISOString(),
      };

      setCampaign((prev) => ({
        ...prev,
        currentHighestBid: amount,
        highestBidderName: bidderName,
        totalBidsCount: prev.totalBidsCount + 1,
        bidHistory: [newBidEntry, ...(prev.bidHistory || [])],
      }));

      onBidPlaced?.(campaign.id, amount);
      setNotice(`הצעת מחיר בסך ${formatPrice(amount)} התקבלה ונרשמה בהצלחה! הנך המוביל במכרז.`);
      setTimeout(() => setNotice(null), 5000);
    } catch (err) {
      console.error("Bid failed:", err);
    } finally {
      setBiddingLoading(false);
    }
  };

  const handleJoinGroupBuy = async () => {
    if (hasJoinedSquad) return;
    setJoiningLoading(true);
    try {
      await fetch("/api/group-buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          squadId: squad.id,
          customerId: "usr_vip_current",
          customerName: "עידן קזם",
        }),
      });

      setSquad((prev) => {
        const nextCount = prev.currentParticipants + 1;
        return {
          ...prev,
          currentParticipants: nextCount,
          status: nextCount >= prev.targetParticipants ? "UNLOCKED" : prev.status,
          participantNames: [...(prev.participantNames || []), "עידן קזם (אתה)"],
        };
      });

      setHasJoinedSquad(true);
      onSquadJoined?.(squad.id);
      setNotice(`הצטרפת בהצלחה לקבוצת הרכישה! שריינת את המוצר במחיר ${formatPrice(squad.squadPrice)}.`);
      setTimeout(() => setNotice(null), 5000);
    } catch (err) {
      console.error("Group buy join failed:", err);
    } finally {
      setJoiningLoading(false);
    }
  };

  const copyReferralLink = () => {
    const url = `${window.location.origin}/arena?ref=${squad.referralCode}`;
    navigator.clipboard.writeText(url);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  if (!isOpen) return null;

  // Group-Buy Progress calculations
  const squadProgressPct = Math.min(100, Math.round((squad.currentParticipants / squad.targetParticipants) * 100));
  const remainingMembersNeeded = Math.max(0, squad.targetParticipants - squad.currentParticipants);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-fade-in" dir="rtl">
      <div className="w-full max-w-4xl rounded-3xl bg-slate-900 border border-amber-500/40 text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-amber-950/40 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              {activeTab === "auction" ? <Gavel className="w-5 h-5" /> : <Users className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">
                  {activeTab === "auction" ? "זירת מכרז חי בזמן אמת (Live Auction)" : "חדר רכישה קבוצתית (Group-Buy Squad)"}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold animate-pulse">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                סנכרון הצעות אטומי ב-Redis & SSE Outbox • זמני תגובה תת-שנייתיים
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Toggle */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab("auction")}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                  activeTab === "auction"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Gavel className="w-3.5 h-3.5" />
                <span>מכרז חי</span>
              </button>
              <button
                onClick={() => setActiveTab("group_buy")}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                  activeTab === "group_buy"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>רכישה קבוצתית</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {notice && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 p-3 px-6 text-xs sm:text-sm text-emerald-300 font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* TAB 1: LIVE AUCTION */}
          {activeTab === "auction" && (
            <div className="space-y-6">
              {/* Top Banner: Product & Countdown */}
              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={campaign.imageUrl}
                    alt={campaign.productName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-800 shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                      {campaign.campaignCode} • מק״ט: {campaign.skuCode}
                    </span>
                    <h4 className="font-black text-base sm:text-lg text-white line-clamp-2">
                      {campaign.productName}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>מחיר שוק רשמי:</span>
                      <span className="line-through font-mono">{formatPrice(campaign.retailPrice)}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        התחלתי: {formatPrice(campaign.flashOrStartingPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Countdown Timer Badge */}
                <div className="flex flex-col items-center justify-center p-4 px-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/40 w-full sm:w-auto text-center">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold mb-1">
                    <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>זמן שנותר לסיום המכרז</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-white">
                    {timeLeftStr}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">
                    סה״כ {campaign.totalBidsCount} הצעות הוגשו
                  </span>
                </div>
              </div>

              {/* Auction Grid: Bidding Controls on Right (RTL: right is first), Live Feed on Left */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Right: Active Bidding & Auto-Snipe (7 cols) */}
                <div className="md:col-span-7 space-y-5">
                  {/* Current Lead Card */}
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>הצעה מובילה נוכחית:</span>
                      </span>
                      <span className="text-slate-300 font-medium">
                        מוביל: <strong className="text-white">{campaign.highestBidderName || "אין הצעות עדיין"}</strong>
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div className="text-3xl sm:text-4xl font-mono font-black text-amber-400">
                        {formatPrice(campaign.currentHighestBid)}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        קפיצה מינימלית: +{formatPrice(campaign.minBidIncrement)}
                      </div>
                    </div>
                  </div>

                  {/* Manual Bid Placement Form */}
                  <form onSubmit={handleManualBidSubmit} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-200 text-xs">
                        סכום ההצעה שלך (₪):
                      </label>
                      <div className="flex gap-1.5">
                        {[50, 150, 300].map((step) => (
                          <button
                            key={step}
                            type="button"
                            onClick={() => handleQuickIncrement(step)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 font-mono text-[11px] font-bold text-amber-300 border border-slate-700 transition"
                          >
                            +{step}₪
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={campaign.currentHighestBid + campaign.minBidIncrement}
                        step={50}
                        value={customBidAmount}
                        onChange={(e) => setCustomBidAmount(Number(e.target.value))}
                        className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-black text-base focus:border-amber-500 focus:outline-none"
                      />
                      <Button
                        type="submit"
                        loading={biddingLoading}
                        className="px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
                      >
                        <Gavel className="w-4 h-4 text-slate-950" />
                        <span>הגש הצעה</span>
                      </Button>
                    </div>
                  </form>

                  {/* AUTO-BID SNIPE TOGGLE CARD */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    bidSnipeEnabled
                      ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10"
                      : "bg-slate-950/60 border-slate-800"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          bidSnipeEnabled ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"
                        }`}>
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-black text-sm text-white flex items-center gap-2">
                            <span>מצב צלף אוטומטי (Auto-Bid Snipe)</span>
                            {bidSnipeEnabled && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-mono font-black">
                                חמוש
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            הגשת הצעה מינימלית אוטומטית ב-5 השניות האחרונות של המכרז
                          </p>
                        </div>
                      </div>

                      {/* Custom Switch Toggle */}
                      <button
                        type="button"
                        onClick={() => setBidSnipeEnabled(!bidSnipeEnabled)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${
                          bidSnipeEnabled ? "bg-amber-500" : "bg-slate-800"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            bidSnipeEnabled ? "-translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {bidSnipeEnabled && (
                      <div className="mt-4 pt-3 border-t border-amber-500/20 space-y-2 animate-fade-in text-xs">
                        <div className="flex items-center justify-between">
                          <label className="text-slate-300 font-bold">
                            תקרת מחיר מקסימלית לרובוט הצלף (₪):
                          </label>
                          <span className="font-mono font-black text-amber-400">{formatPrice(snipeCeiling)}</span>
                        </div>
                        <input
                          type="range"
                          min={campaign.currentHighestBid + campaign.minBidIncrement}
                          max={campaign.retailPrice}
                          step={100}
                          value={snipeCeiling}
                          onChange={(e) => setSnipeCeiling(Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                        <p className="text-[11px] text-slate-400">
                          רובוט הצלף לעולם לא יציע מעבר לתקרה זו. אם מחיר המכרז יעבור אותה, ההפעלה תבוטל בבטחה.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Left: Real-time Live Bid Feed (5 cols) */}
                <div className="md:col-span-5 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h4 className="font-black text-xs sm:text-sm text-white flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span>פיד הצעות מחיר חי (Live Bid Stream)</span>
                    </h4>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>

                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {campaign.bidHistory && campaign.bidHistory.length > 0 ? (
                      campaign.bidHistory.map((bid, idx) => {
                        const isLeader = idx === 0;
                        return (
                          <div
                            key={bid.bidId || idx}
                            className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                              isLeader
                                ? "bg-amber-500/15 border-amber-500/40 text-amber-200"
                                : "bg-slate-900 border-slate-800/80 text-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                isLeader ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-800 text-slate-400"
                              }`}>
                                {bid.customerName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-xs text-white flex items-center gap-1.5">
                                  <span>{bid.customerName}</span>
                                  {isLeader && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black font-mono">
                                      מוביל 👑
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {new Date(bid.timestamp).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono font-black text-sm text-white">
                                {formatPrice(bid.amount)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-slate-500 text-xs">
                        אין הצעות מחיר עדיין. היה הראשון להציע!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GROUP-BUY SQUAD */}
          {activeTab === "group_buy" && (
            <div className="space-y-6">
              {/* Squad Header Card */}
              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={squad.imageUrl}
                    alt={squad.productName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-800 shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">
                      {squad.squadCode} • קבוצת רכישה פעילה
                    </span>
                    <h4 className="font-black text-base sm:text-lg text-white">
                      {squad.productName}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>מחיר רגיל:</span>
                      <span className="line-through font-mono">{formatPrice(squad.regularPrice)}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        מחיר קבוצתי: {formatPrice(squad.squadPrice)} (-{squad.discountPercent}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 px-6 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-center w-full sm:w-auto">
                  <span className="text-[11px] text-indigo-300 font-bold block mb-1">
                    זמן שנותר לסגירת החדר:
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-black text-white">
                    {timeLeftStr}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                    +{squad.affiliateRewardPoints} נקודות שותפים למצטרף
                  </span>
                </div>
              </div>

              {/* GROUP-BUY DISCOUNT PROGRESS BAR */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 to-indigo-950/60 border border-indigo-500/30 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                      <span>מד התקדמות הנחת הקבוצה (`Tiered Discount Progress`)</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {remainingMembersNeeded > 0
                        ? `עוד ${remainingMembersNeeded} רוכשים להפעלת שחרור העסקה במחיר המינימלי!`
                        : "הקבוצה הושלמה במלואה! מחיר ההנחה המרבי שוחרר לכל המשתתפים."}
                    </p>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-xl sm:text-2xl font-black text-amber-400">
                      {squad.currentParticipants}
                    </span>
                    <span className="text-slate-400 text-sm"> / {squad.targetParticipants} רוכשים</span>
                  </div>
                </div>

                {/* Visual Segmented Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full h-4 rounded-full bg-slate-900 border border-slate-800 overflow-hidden p-0.5 relative">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-500 relative"
                      style={{ width: `${squadProgressPct}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>

                  {/* Tier Milestones Chips */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    {[
                      { step: "3 רוכשים", disc: "10% הנחה", reached: squad.currentParticipants >= 3 },
                      { step: "6 רוכשים", disc: "20% הנחה", reached: squad.currentParticipants >= 6 },
                      { step: `${squad.targetParticipants} רוכשים (יעד)`, disc: `${squad.discountPercent}% מקסימום`, reached: squad.currentParticipants >= squad.targetParticipants },
                    ].map((tier, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-[11px] transition ${
                          tier.reached
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold"
                            : "bg-slate-900 border-slate-800 text-slate-500"
                        }`}
                      >
                        <div>{tier.step}</div>
                        <div className="font-mono font-black mt-0.5">{tier.disc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Participant Avatars Strip */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <span className="text-xs text-slate-400 block">חברי הקבוצה שהצטרפו עד כה:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {squad.participantNames.map((name, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>{name}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons: Join Squad & Referral Link */}
                <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    onClick={handleJoinGroupBuy}
                    disabled={hasJoinedSquad || squad.status === "UNLOCKED"}
                    loading={joiningLoading}
                    className="w-full sm:flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {hasJoinedSquad ? "כבר הצטרפת לקבוצה זו ✓" : `הצטרף עכשיו ב-${formatPrice(squad.squadPrice)}`}
                    </span>
                  </Button>

                  <button
                    onClick={copyReferralLink}
                    type="button"
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-indigo-400" />
                    <span>{copiedReferral ? "קישור שותפים הועתק! ✓" : "שתף קישור שותפים להנחה"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>תשלום מאובטח PCI-DSS • תזמור הזמנות Kafka SAGA</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
          >
            סגור חלון
          </button>
        </div>
      </div>
    </div>
  );
};
