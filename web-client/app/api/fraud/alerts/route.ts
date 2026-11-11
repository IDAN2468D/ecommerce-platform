import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl, buildTraceHeaders } from "@/lib/api-config";

export const dynamic = "force-dynamic";

export interface FraudAlertDto {
  assessmentId: string;
  orderId: string;
  customerId: string;
  customerName?: string;
  riskScore: number;
  riskLevel: "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK_BLOCKED";
  decision: "APPROVE" | "HOLD_REVIEW" | "BLOCK";
  signalsChecked: string[];
  triggeredRules: string[];
  totalAmount?: number;
  city?: string;
  ipAddress?: string;
  velocityScore?: number;
  inventoryDepletionWarning?: {
    skuCode: string;
    remainingUnits: number;
    predictedDaysUntilDepletion: number;
  } | null;
  evaluatedAt: string;
}

const MOCK_FRAUD_ALERTS: FraudAlertDto[] = [
  {
    assessmentId: "fa_9b3e1082aa",
    orderId: "6a9f3b14-4c8d-4e2b-a19e-953e1a84f331",
    customerId: "cust_bot_9182",
    customerName: "Anonymous Proxy / Botnet #84",
    riskScore: 92,
    riskLevel: "HIGH_RISK_BLOCKED",
    decision: "BLOCK",
    totalAmount: 38450.0,
    city: "Tor Exit Node (Frankfurt)",
    ipAddress: "185.220.101.42",
    velocityScore: 14,
    signalsChecked: [
      "JWT_SIGNATURE_VERIFIED",
      "IP_GEOLOCATION_MISMATCH (Frankfurt vs Tel Aviv)",
      "DEVICE_FINGERPRINT_ANOMALY (Headless Chrome)",
    ],
    triggeredRules: [
      "HIGH_VELOCITY (>12 requests / 5min)",
      "ANOMALOUS_IP (TOR_EXIT_NODE / DATACENTER)",
      "SUSPICIOUS_AMOUNT (> ₪25,000.00)",
      "COUPON_ENUMERATION_PATTERN_DETECTED",
    ],
    inventoryDepletionWarning: {
      skuCode: "LAPTOP-MACBOOK-PRO-16",
      remainingUnits: 2,
      predictedDaysUntilDepletion: 0.8,
    },
    evaluatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    assessmentId: "fa_47c2d119ef",
    orderId: "81e309bb-df34-45aa-b827-04c8f3e5b120",
    customerId: "cust_suspicious_771",
    customerName: "דניאל קליין (חריגת מהירות)",
    riskScore: 68,
    riskLevel: "MEDIUM_RISK",
    decision: "HOLD_REVIEW",
    totalAmount: 18900.0,
    city: "רמת גן",
    ipAddress: "77.137.45.19",
    velocityScore: 5,
    signalsChecked: [
      "JWT_SIGNATURE_VERIFIED",
      "SHIPPING_BILLING_CITY_MATCH (רמת גן)",
      "BIN_COUNTRY_MATCH (IL)",
    ],
    triggeredRules: [
      "RAPID_ORDER_BURST_VELOCITY (5 orders / 1hr)",
      "HIGH_TICKET_VALUE_ALERT (> ₪15,000)",
      "NEW_SHIPPING_ADDRESS_UNVERIFIED",
    ],
    inventoryDepletionWarning: null,
    evaluatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    assessmentId: "fa_1289fe403c",
    orderId: "e9321c70-13f8-4e4d-bf60-124976cde98a",
    customerId: "cust_vip_304",
    customerName: "מיכל אברהמי (VIP Gold)",
    riskScore: 8,
    riskLevel: "LOW_RISK",
    decision: "APPROVE",
    totalAmount: 3450.0,
    city: "תל אביב-יפו",
    ipAddress: "84.108.201.14",
    velocityScore: 1,
    signalsChecked: [
      "JWT_SIGNATURE_VERIFIED",
      "SHIPPING_BILLING_CITY_MATCH (תל אביב-יפו)",
      "TRANSACTION_VALUE_NORMAL (₪3,450.00)",
      "VELOCITY_1H_OK (1 order / hr)",
      "VIP_TRUSTED_BEHAVIOR_SCORE (99/100)",
      "COUPON_ABUSE_CHECK_PASSED",
    ],
    triggeredRules: [],
    inventoryDepletionWarning: null,
    evaluatedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
  },
  {
    assessmentId: "fa_883a992bc1",
    orderId: "331d904b-944a-43cf-87aa-4780214a1e90",
    customerId: "cust_card_tester_09",
    customerName: "Automated Card Tester Bot",
    riskScore: 86,
    riskLevel: "HIGH_RISK_BLOCKED",
    decision: "BLOCK",
    totalAmount: 120.0,
    city: "Unknown (VPN Tunnel)",
    ipAddress: "194.26.29.112",
    velocityScore: 19,
    signalsChecked: [
      "FAILED_CVV_MULTIPLE_ATTEMPTS",
      "CARD_ISSUER_COUNTRY_MISMATCH (CY vs IL)",
    ],
    triggeredRules: [
      "HIGH_VELOCITY (19 attempts / 3min)",
      "ANOMALOUS_IP (COMMERCIAL_VPN)",
      "RAPID_FIRE_CVV_ENUMERATION",
    ],
    inventoryDepletionWarning: null,
    evaluatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    assessmentId: "fa_5521ae98bb",
    orderId: "01f93e11-87c2-4911-aa94-98442211bb33",
    customerId: "cust_biz_8820",
    customerName: "הייטק פתרונות בע״מ (B2B)",
    riskScore: 15,
    riskLevel: "LOW_RISK",
    decision: "APPROVE",
    totalAmount: 24600.0,
    city: "הרצליה פיתוח",
    ipAddress: "147.235.10.88",
    velocityScore: 1,
    signalsChecked: [
      "JWT_SIGNATURE_VERIFIED",
      "B2B_VERIFIED_TAX_ID (515894120)",
      "STATIC_OFFICE_IP_MATCH",
      "PRE_APPROVED_NET30_CREDIT",
    ],
    triggeredRules: [],
    inventoryDepletionWarning: null,
    evaluatedAt: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
  },
  {
    assessmentId: "fa_309b11ca04",
    orderId: "77a83d44-3209-4ce4-89c5-341e44208a09",
    customerId: "cust_guest_119",
    customerName: "אורח - תשלום מהיר",
    riskScore: 54,
    riskLevel: "MEDIUM_RISK",
    decision: "HOLD_REVIEW",
    totalAmount: 7890.0,
    city: "ירושלים",
    ipAddress: "109.64.120.31",
    velocityScore: 3,
    signalsChecked: [
      "JWT_GUEST_EPHEMERAL_TOKEN",
      "SHIPPING_BILLING_CITY_MATCH (ירושלים)",
    ],
    triggeredRules: [
      "GUEST_CHECKOUT_FIRST_TIME_HIGH_VALUE",
      "UNUSUAL_HOUR_TRANSACTION (03:42 AM)",
    ],
    inventoryDepletionWarning: null,
    evaluatedAt: new Date(Date.now() - 52 * 60 * 1000).toISOString(),
  },
];

export async function GET(req: NextRequest) {
  const gatewayUrl = getGatewayUrl();
  const traceHeaders = buildTraceHeaders(req.headers);

  const targetUrls = [
    `${gatewayUrl}/api/v1/fraud/alerts/recent`,
    "http://localhost:8096/api/v1/fraud/alerts/recent",
    "http://fraud-risk-service:8096/api/v1/fraud/alerts/recent",
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
          alerts: Array.isArray(data) ? data : [data],
        });
      }
    } catch {
      // Continue to next endpoint or mock fallback
    }
  }

  // Fallback to high-fidelity mock alerts
  return NextResponse.json({
    source: "mock_fallback",
    upstreamUrl: null,
    alerts: MOCK_FRAUD_ALERTS,
  });
}
