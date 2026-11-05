import { NextRequest, NextResponse } from "next/server";
import { negotiateProductPrice } from "@/lib/gemini-negotiator";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const skuCode = body.skuCode || "MACBOOK-PRO-M3";
    const userOffer = Number(body.userOffer || body.offer || 0);
    const round = Number(body.round || 1);

    const result = negotiateProductPrice(skuCode, userOffer, round);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        decision: "COUNTER_OFFER",
        agreedPrice: 1000,
        originalPrice: 1200,
        discountPercent: 10,
        discountAmount: 120,
        couponCode: "WELCOME10",
        message: "סוכן המשא ומתן ממליץ להשתמש בקופון WELCOME10 להנחה של 10%.",
        round: 1,
      },
      { status: 200 }
    );
  }
}
