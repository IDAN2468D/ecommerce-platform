import { NextRequest, NextResponse } from "next/server";

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const FALLBACK_QUOTES = [
  {
    id: "rfq_cyberark_tlv",
    quoteNumber: "RFQ-B2B-9041A",
    companyName: "CyberArk R&D Center TLV",
    skuCode: "COMP-MACBOOK-M3",
    productName: "Apple MacBook Pro 16 M3 Max 36GB",
    quantity: 15,
    unitRetailPriceILS: 13999,
    volumeDiscountPct: 15,
    netUnitPriceILS: 11899.15,
    totalNetAmountILS: 178487.25,
    paymentTerms: "NET_30_CORPORATE_CREDIT",
    status: "ISSUED_APPROVED",
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const res = await fetch(`${GATEWAY_URL}/api/v1/b2b-quotes`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {}
  return NextResponse.json(FALLBACK_QUOTES);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const res = await fetch(`${GATEWAY_URL}/api/v1/b2b-quotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {}

  const qty = Number(body.quantity || 10);
  const retail = Number(body.unitRetailPriceILS || 1499);
  const disc = qty >= 50 ? 30 : qty >= 25 ? 22 : qty >= 10 ? 15 : 10;
  const netUnit = Math.round(retail * ((100 - disc) / 100) * 100) / 100;

  return NextResponse.json({
    id: "rfq_" + Date.now(),
    quoteNumber: "RFQ-B2B-" + Math.random().toString(36).substring(2, 7).toUpperCase(),
    companyName: body.companyName || "Enterprise Client IL",
    skuCode: body.skuCode || "AUDIO-SONY-XM5",
    productName: body.productName || "Sony WH-1000XM5 Corporate Bundle",
    quantity: qty,
    unitRetailPriceILS: retail,
    volumeDiscountPct: disc,
    netUnitPriceILS: netUnit,
    totalNetAmountILS: Math.round(netUnit * qty * 100) / 100,
    paymentTerms: "NET_30_CORPORATE_CREDIT",
    status: "ISSUED_APPROVED",
    createdAt: new Date().toISOString(),
  });
}
