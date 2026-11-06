import { NextRequest, NextResponse } from "next/server";
import { negotiateProductPrice } from "@/lib/gemini-negotiator";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const skuCode = body.skuCode || "MACBOOK-PRO-M3";
    const userOffer = Number(body.userOffer || body.offer || 0);
    const round = Number(body.round || 1);
    const customerId = body.customerId || "usr_demo";

    // 1. Try forwarding to the backend autonomous agent swarm
    const swarmUrl = process.env.AGENT_SWARM_SERVICE_URL || "http://agent-swarm-service:8093";
    try {
      const swarmRes = await fetch(`${swarmUrl}/api/v1/agents/negotiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skuCode,
          userOffer,
          round,
          customerId,
        }),
        signal: AbortSignal.timeout(3000),
      });

      if (swarmRes.ok) {
        const swarmData = await swarmRes.json();
        return NextResponse.json(swarmData);
      }
    } catch (e) {
      // Swarm service unavailable, fallback to local negotiator
    }

    // 2. Local fallback negotiator
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
        message: "סוכן המיקוח האוטונומי מציע 10% הנחה בלעדית עם הקופון WELCOME10 לסגירת העסקה!",
        round: 1,
      },
      { status: 200 }
    );
  }
}
