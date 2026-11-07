import { NextRequest, NextResponse } from "next/server";

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const FALLBACK_CAMPAIGNS = [
  {
    id: "flash_sony_xm5_gold",
    campaignCode: "FLASH-SONY-XM5-GOLD",
    skuCode: "AUDIO-SONY-XM5",
    productName: "Sony WH-1000XM5 Limited Midnight Gold Edition",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    campaignType: "FLASH_DROP",
    retailPrice: 1690,
    flashOrStartingPrice: 1099,
    currentHighestBid: 1099,
    minBidIncrement: 0,
    totalStock: 25,
    remainingStock: 7,
    totalBidsCount: 18,
    status: "ACTIVE",
    endsAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    bidHistory: [],
  },
  {
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
    highestBidderName: "דניאל כ.",
    totalStock: 1,
    remainingStock: 1,
    totalBidsCount: 9,
    status: "ACTIVE",
    endsAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    bidHistory: [
      {
        bidId: "BID-901",
        customerId: "usr_vip_88",
        customerName: "דניאל כ.",
        amount: 10450,
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "auc_ps5_pro_30th",
    campaignCode: "AUC-PS5-PRO-30TH",
    skuCode: "GAME-PS5-PRO-30",
    productName: "PlayStation 5 Pro 30th Anniversary Limited Bundle",
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
    campaignType: "LIVE_AUCTION",
    retailPrice: 4890,
    flashOrStartingPrice: 3100,
    currentHighestBid: 3550,
    minBidIncrement: 100,
    highestBidderId: "usr_vip_19",
    highestBidderName: "רועי א.",
    totalStock: 1,
    remainingStock: 1,
    totalBidsCount: 6,
    status: "ACTIVE",
    endsAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    bidHistory: [],
  },
];

export async function GET() {
  try {
    const res = await fetch(`${GATEWAY_URL}/api/v1/flash-sales`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch {
    // Fallback to in-memory seed
  }
  return NextResponse.json(FALLBACK_CAMPAIGNS);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { campaignId, action, customerId, customerName, bidAmount, quantity } = body;

  try {
    const endpoint =
      action === "BID"
        ? `${GATEWAY_URL}/api/v1/flash-sales/${campaignId}/bid`
        : `${GATEWAY_URL}/api/v1/flash-sales/${campaignId}/claim`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, customerName, bidAmount, quantity: quantity || 1 }),
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch {
    // Resilient local simulation when offline
  }

  return NextResponse.json({
    status: "SUCCESS",
    campaignId,
    action,
    customerId,
    customerName: customerName || "עידן קזם",
    bidAmount,
    timestamp: new Date().toISOString(),
  });
}
