import { NextRequest, NextResponse } from "next/server";

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const FALLBACK_CERTIFICATES = [
  {
    id: "cert_sony_xm5",
    certificateNumber: "WRN-IL-2026-8841",
    customerId: "usr_demo",
    orderId: "ORD-9082",
    skuCode: "AUDIO-SONY-XM5",
    productName: "Sony WH-1000XM5 Wireless Noise Cancelling",
    serialNumber: "SN-SONY-99482104",
    vendorName: "Sony Official Store Israel",
    purchaseAmount: 1490,
    escrowAmountHeld: 1341,
    escrowStatus: "HELD_IN_ESCROW",
    warrantyStatus: "ACTIVE",
    sha256Signature: "9b4f8c2a1e7d5063b9e821c440a7f612d83e9041c7b2a5f1e08924d6c3a1f782",
    coverageMonths: 24,
    issuedAt: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 727 * 86400 * 1000).toISOString(),
  },
  {
    id: "cert_macbook_m3",
    certificateNumber: "WRN-IL-2026-7719",
    customerId: "usr_demo",
    orderId: "ORD-8410",
    skuCode: "COMP-MACBOOK-M3",
    productName: "Apple MacBook Pro 14 M3 Pro",
    serialNumber: "SN-APL-M3PRO-77219",
    vendorName: "iStore Premium Reseller",
    purchaseAmount: 8990,
    escrowAmountHeld: 0,
    escrowStatus: "RELEASED_TO_VENDOR",
    warrantyStatus: "ACTIVE",
    sha256Signature: "4e1c7a9f3b82d6051a89f24c73e1b05892d4a6c1f8e3072b5a94c18d6e2f03a9",
    coverageMonths: 36,
    issuedAt: new Date(Date.now() - 32 * 86400 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 1063 * 86400 * 1000).toISOString(),
  },
];

export async function GET(req: NextRequest) {
  const customerId = req.headers.get("X-Customer-Id") || "usr_demo";
  try {
    const res = await fetch(`${GATEWAY_URL}/api/v1/warranties/customer/${customerId}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch {
    // Fallback
  }
  return NextResponse.json(FALLBACK_CERTIFICATES);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { certificateId, action, issueDescription } = body;

  try {
    if (action === "RELEASE_ESCROW") {
      const res = await fetch(`${GATEWAY_URL}/api/v1/warranties/${certificateId}/release-escrow`, {
        method: "POST",
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) return NextResponse.json(await res.json());
    } else if (action === "CLAIM") {
      const res = await fetch(`${GATEWAY_URL}/api/v1/warranties/${certificateId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueDescription }),
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) return NextResponse.json(await res.json());
    }
  } catch {
    // Fallback
  }

  return NextResponse.json({
    status: "OK",
    certificateId,
    action,
    issueDescription,
    updatedAt: new Date().toISOString(),
  });
}
