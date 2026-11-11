import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl, buildTraceHeaders } from "@/lib/api-config";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;
  const gatewayUrl = getGatewayUrl();
  const traceHeaders = buildTraceHeaders(req.headers);

  const targetUrls = [
    `${gatewayUrl}/api/v1/fraud/order/${orderId}`,
    `http://localhost:8096/api/v1/fraud/order/${orderId}`,
    `http://fraud-risk-service:8096/api/v1/fraud/order/${orderId}`,
  ];

  for (const url of targetUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...traceHeaders,
        },
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          source: "live_service",
          upstreamUrl: url,
          assessment: data,
        });
      }
    } catch {
      // Continue to next endpoint or mock
    }
  }

  // Fallback mock assessment for this order
  const isSuspicious = orderId.includes("fraud") || orderId.endsWith("99") || orderId.startsWith("block");
  const isReview = orderId.includes("hold") || orderId.endsWith("77");

  const riskScore = isSuspicious ? 88 : isReview ? 56 : 12;
  const riskLevel = isSuspicious
    ? "HIGH_RISK_BLOCKED"
    : isReview
    ? "MEDIUM_RISK"
    : "LOW_RISK";
  const decision = isSuspicious ? "BLOCK" : isReview ? "HOLD_REVIEW" : "APPROVE";

  const triggeredRules = isSuspicious
    ? [
        "HIGH_VELOCITY (>8 orders / 10min)",
        "ANOMALOUS_IP (TOR_EXIT_NODE)",
        "SUSPICIOUS_AMOUNT (> ₪25,000)",
      ]
    : isReview
    ? [
        "ELEVATED_TRANSACTION_VALUE (> ₪10,000)",
        "NEW_SHIPPING_ADDRESS_UNVERIFIED",
      ]
    : [];

  const signalsChecked = [
    "JWT_SIGNATURE_VERIFIED",
    "SHIPPING_BILLING_CITY_MATCH (תל אביב-יפו)",
    "DEVICE_FINGERPRINT_HASH_VALID",
    ...(isSuspicious ? [] : ["CLEAN_CARD_HISTORY", "VELOCITY_1H_OK"]),
  ];

  return NextResponse.json({
    source: "mock_fallback",
    upstreamUrl: null,
    assessment: {
      assessmentId: `fa_${orderId.replace(/-/g, "").substring(0, 10)}`,
      orderId,
      customerId: `cust_${orderId.substring(0, 6)}`,
      riskScore,
      riskLevel,
      decision,
      signalsChecked,
      triggeredRules,
      inventoryDepletionWarning: isSuspicious
        ? {
            skuCode: "FLAGGED-HOT-ITEM",
            remainingUnits: 1,
            predictedDaysUntilDepletion: 0.5,
          }
        : null,
      evaluatedAt: new Date().toISOString(),
    },
  });
}
