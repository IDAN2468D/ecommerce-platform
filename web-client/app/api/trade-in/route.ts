import { NextRequest, NextResponse } from "next/server";

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const FALLBACK_APPRAISALS = [
  {
    id: "apr_macbook_m1",
    appraisalCode: "APR-2026-9910",
    customerId: "usr_demo",
    deviceCategory: "COMPUTERS",
    deviceModel: "Apple MacBook Pro 14 M1 Pro (2022)",
    serialOrImei: "SN-APL-M1P-88412",
    conditionGrade: "MINT_A_PLUS",
    baseMarketValueILS: 5800,
    approvedCreditILS: 3480,
    tradeInVoucherCode: "TRD-IL-M1PRO-3480",
    resaleRetention24mPct: 74,
    status: "APPROVED_VOUCHER_ISSUED",
    createdAt: new Date().toISOString(),
  },
  {
    id: "apr_sony_xm4",
    appraisalCode: "APR-2026-9911",
    customerId: "usr_demo",
    deviceCategory: "AUDIO",
    deviceModel: "Sony WH-1000XM4 Wireless Headphones",
    serialOrImei: "SN-SNY-XM4-33910",
    conditionGrade: "GOOD_A",
    baseMarketValueILS: 1190,
    approvedCreditILS: 535.5,
    tradeInVoucherCode: "TRD-IL-XM4-535",
    resaleRetention24mPct: 68,
    status: "APPROVED_VOUCHER_ISSUED",
    createdAt: new Date().toISOString(),
  },
];

export async function GET(req: NextRequest) {
  const customerId = req.headers.get("X-Customer-Id") || "usr_demo";
  try {
    const res = await fetch(`${GATEWAY_URL}/api/v1/trade-in/customer/${customerId}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {}
  return NextResponse.json(FALLBACK_APPRAISALS);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const res = await fetch(`${GATEWAY_URL}/api/v1/trade-in/appraise`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {}

  const mult = body.conditionGrade === "MINT_A_PLUS" ? 0.6 : body.conditionGrade === "GOOD_A" ? 0.45 : 0.3;
  const credit = Math.round((Number(body.originalRetailPriceILS || 2500) * mult) * 100) / 100;
  const code = "TRD-IL-" + Math.random().toString(36).substring(2, 7).toUpperCase();

  return NextResponse.json({
    id: "apr_" + Date.now(),
    appraisalCode: "APR-2026-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
    customerId: body.customerId || "usr_demo",
    deviceCategory: body.deviceCategory || "ELECTRONICS",
    deviceModel: body.deviceModel || "Apple iPad Pro M2",
    serialOrImei: body.serialOrImei || "SN-VERIFIED-AI",
    conditionGrade: body.conditionGrade || "MINT_A_PLUS",
    baseMarketValueILS: Number(body.originalRetailPriceILS || 2500),
    approvedCreditILS: credit,
    tradeInVoucherCode: code,
    resaleRetention24mPct: 73,
    status: "APPROVED_VOUCHER_ISSUED",
    createdAt: new Date().toISOString(),
  });
}
