import { NextRequest, NextResponse } from "next/server";

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const FALLBACK_SQUADS = [
  {
    id: "squad_dyson_v15",
    squadCode: "SQUAD-DYSON-V15",
    skuCode: "HOME-DYSON-V15",
    productName: "Dyson V15 Detect Absolute Laser Vacuum",
    imageUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80",
    regularPrice: 3190,
    squadPrice: 2290,
    discountPercent: 28,
    targetParticipants: 10,
    currentParticipants: 8,
    status: "OPEN",
    referralCode: "REF-NEXUS-DYSON",
    affiliateRewardPoints: 120,
    expiresAt: new Date(Date.now() + 14 * 3600 * 1000).toISOString(),
    participantNames: ["עידן ק.", "נועה ל.", "יונתן מ.", "מאיה ש.", "אלון ב.", "שירה ד.", "גיא ר.", "תמר כ."],
  },
  {
    id: "squad_breville_barista",
    squadCode: "SQUAD-BREVILLE-BARISTA",
    skuCode: "COFFEE-BREVILLE-PRO",
    productName: "Breville Barista Touch Impress Espresso Machine",
    imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80",
    regularPrice: 4490,
    squadPrice: 3290,
    discountPercent: 27,
    targetParticipants: 6,
    currentParticipants: 5,
    status: "OPEN",
    referralCode: "REF-NEXUS-COFFEE",
    affiliateRewardPoints: 165,
    expiresAt: new Date(Date.now() + 9 * 3600 * 1000).toISOString(),
    participantNames: ["איתי ג.", "רוני פ.", "עומר ח.", "ליאור ס.", "דנה א."],
  },
  {
    id: "squad_lg_oled_c4",
    squadCode: "SQUAD-LG-OLED-C4",
    skuCode: "TV-LG-OLED65",
    productName: "LG OLED evo C4 65-inch 4K Smart Gaming TV",
    imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80",
    regularPrice: 7990,
    squadPrice: 5890,
    discountPercent: 26,
    targetParticipants: 8,
    currentParticipants: 8,
    status: "UNLOCKED",
    referralCode: "REF-NEXUS-OLED",
    affiliateRewardPoints: 295,
    expiresAt: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    participantNames: ["ניר ק.", "מיכל ז.", "אביב ת.", "שני ו.", "ברק ה.", "הדס מ.", "יובל נ.", "קורל צ."],
  },
];

export async function GET() {
  try {
    const res = await fetch(`${GATEWAY_URL}/api/v1/group-buy`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch {
    // Fallback
  }
  return NextResponse.json(FALLBACK_SQUADS);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { squadId, customerId, customerName, referredByCode } = body;

  try {
    const res = await fetch(`${GATEWAY_URL}/api/v1/group-buy/${squadId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, customerName, referredByCode }),
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch {
    // Resilient fallback
  }

  return NextResponse.json({
    status: "JOINED",
    squadId,
    customerId,
    customerName: customerName || "עידן קזם",
    timestamp: new Date().toISOString(),
  });
}
