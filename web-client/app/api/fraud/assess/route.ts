import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl, buildTraceHeaders } from "@/lib/api-config";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export interface AssessRequestBody {
  orderId?: string;
  customerId?: string;
  totalAmount?: number;
  city?: string;
  couponCode?: string;
  ipAddress?: string;
  velocity?: number;
}

export async function POST(req: NextRequest) {
  const gatewayUrl = getGatewayUrl();
  const traceHeaders = buildTraceHeaders(req.headers);

  let body: AssessRequestBody = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const orderId = body.orderId || crypto.randomUUID();
  const customerId = body.customerId || "cust_simulated_user";
  const totalAmount = Number(body.totalAmount) || 1250;
  const city = body.city || "תל אביב-יפו";
  const couponCode = body.couponCode || "";
  const ipAddress = body.ipAddress || "84.108.201.14";
  const velocity = Number(body.velocity) || 1;

  const upstreamPayload = {
    orderId,
    customerId,
    totalAmount,
    city,
    couponCode: couponCode || undefined,
  };

  const targetUrls = [
    `${gatewayUrl}/api/v1/fraud/assess`,
    "http://localhost:8096/api/v1/fraud/assess",
    "http://fraud-risk-service:8096/api/v1/fraud/assess",
  ];

  for (const url of targetUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...traceHeaders,
        },
        body: JSON.stringify(upstreamPayload),
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
      // Continue to next endpoint or fallback to simulated evaluator
    }
  }

  // Fallback to high-fidelity simulated Pre-Capture AI Risk evaluation
  let score = 5;
  const rules: string[] = [];
  const signals: string[] = [];

  signals.push("JWT_SIGNATURE_VERIFIED");
  signals.push(`SHIPPING_BILLING_CITY_MATCH (${city})`);

  // Amount heuristics
  if (totalAmount > 25000) {
    score += 35;
    rules.push("HIGH_TICKET_VALUE_ALERT (> ₪25,000)");
  } else if (totalAmount > 10000) {
    score += 15;
    rules.push("ELEVATED_TRANSACTION_VALUE (> ₪10,000)");
  } else {
    signals.push(`TRANSACTION_VALUE_NORMAL (₪${totalAmount.toLocaleString()})`);
  }

  // Velocity heuristics
  if (velocity > 5) {
    score += 45;
    rules.push(`RAPID_ORDER_BURST_VELOCITY (${velocity} orders / 1hr)`);
  } else if (velocity > 2) {
    score += 20;
    rules.push(`ELEVATED_VELOCITY (${velocity} orders / 1hr)`);
  } else {
    signals.push(`VELOCITY_1H_OK (${velocity} order / hr)`);
  }

  // IP / Proxy anomalies
  const lowerIp = ipAddress.toLowerCase();
  if (
    lowerIp.includes("tor") ||
    lowerIp.includes("vpn") ||
    lowerIp.includes("proxy") ||
    lowerIp.startsWith("185.220.") ||
    lowerIp.startsWith("194.26.")
  ) {
    score += 35;
    rules.push(`ANOMALOUS_IP (${ipAddress} - TOR_EXIT_NODE / DATACENTER_PROXY)`);
  } else {
    signals.push(`IP_REPUTATION_CLEAN (${ipAddress})`);
  }

  // Coupon enumeration
  if (couponCode.toUpperCase().startsWith("BRUTE_") || couponCode.length > 20) {
    score += 25;
    rules.push("COUPON_ENUMERATION_PATTERN_DETECTED");
  } else if (couponCode) {
    signals.push(`COUPON_VALIDATED (${couponCode})`);
  } else {
    signals.push("COUPON_ABUSE_CHECK_PASSED");
  }

  // Score clamping & decision logic
  const finalScore = Math.min(100, Math.max(1, score));
  const riskLevel =
    finalScore >= 70
      ? "HIGH_RISK_BLOCKED"
      : finalScore >= 40
      ? "MEDIUM_RISK"
      : "LOW_RISK";
  const decision =
    finalScore >= 70 ? "BLOCK" : finalScore >= 40 ? "HOLD_REVIEW" : "APPROVE";

  const assessmentId = `fa_${crypto.randomBytes(5).toString("hex")}`;

  const assessmentResult = {
    assessmentId,
    orderId,
    customerId,
    totalAmount,
    riskScore: finalScore,
    riskLevel,
    decision,
    signalsChecked: signals,
    triggeredRules: rules,
    inventoryDepletionWarning:
      finalScore > 65
        ? {
            skuCode: "INVENTORY-HIGH-DEMAND-ITEM",
            remainingUnits: 3,
            predictedDaysUntilDepletion: 1.1,
          }
        : null,
    evaluatedAt: new Date().toISOString(),
  };

  return NextResponse.json({
    source: "simulated_evaluator",
    upstreamUrl: null,
    assessment: assessmentResult,
  });
}
