import { NextRequest, NextResponse } from "next/server";

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const FALLBACK_GIFTS = [
  {
    id: "gift_ps5_pro_bday",
    campaignCode: "GIFT-PS5-PRO-BDAY",
    recipientName: "עומר לוי",
    occasionTitle: "מתנת יום הולדת 30 מהחבר'ה",
    skuCode: "GAME-PS5-PRO-30",
    productName: "PlayStation 5 Pro + 2 DualSense Controllers",
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
    targetAmountILS: 3800,
    raisedAmountILS: 3100,
    status: "COLLECTING",
    contributions: [
      {
        contributorName: "עידן ק.",
        amountILS: 800,
        greetingMessage: "מזל טוב אח יקר! שתהנה מכל רגע 🎮",
        timestamp: new Date().toISOString(),
      },
      {
        contributorName: "נועה וגיא",
        amountILS: 1200,
        greetingMessage: "יום הולדת 30 שמח! מחכים לטורניר פיפ״א",
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    id: "gift_breville_wedding",
    campaignCode: "GIFT-BREVILLE-WEDDING",
    recipientName: "מאיה ויונתן",
    occasionTitle: "מתנת חתונה מצוות הפיתוח",
    skuCode: "COFFEE-BREVILLE-PRO",
    productName: "Breville Barista Touch Impress Espresso Machine",
    imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80",
    targetAmountILS: 4200,
    raisedAmountILS: 3650,
    status: "COLLECTING",
    contributions: [
      {
        contributorName: "צוות Backend & AI",
        amountILS: 2200,
        greetingMessage: "מזל טוב לזוג המדהים! לחיי בקרים עם קפה מושלם ☕",
        timestamp: new Date().toISOString(),
      },
    ],
  },
];

export async function GET() {
  try {
    const res = await fetch(`${GATEWAY_URL}/api/v1/gifting`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {}
  return NextResponse.json(FALLBACK_GIFTS);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { campaignId, contributorName, amountILS, greetingMessage } = body;
  try {
    const res = await fetch(`${GATEWAY_URL}/api/v1/gifting/${campaignId}/contribute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contributorName, amountILS, greetingMessage }),
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {}

  return NextResponse.json({
    status: "CONTRIBUTED",
    campaignId,
    contributorName,
    amountILS,
    greetingMessage,
  });
}
