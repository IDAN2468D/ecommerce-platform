import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const DIRECT_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || "http://localhost:8097";

export interface AnalyticsSummaryResponse {
  grossMerchandiseValueIls: number;
  netRevenueIls: number;
  ordersCount: number;
  averageOrderValueIls: number;
  conversionRatePercentage: number;
  fraudBlockRatePercentage: number;
  rmaVipRetentionRatePercentage: number;
  abandonedCartsRecovered: number;
  lastRefreshed: string;
}

const FALLBACK_SUMMARY: AnalyticsSummaryResponse = {
  grossMerchandiseValueIls: 489500.0,
  netRevenueIls: 442100.0,
  ordersCount: 284,
  averageOrderValueIls: 1723.59,
  conversionRatePercentage: 4.85,
  fraudBlockRatePercentage: 1.2,
  rmaVipRetentionRatePercentage: 84.5,
  abandonedCartsRecovered: 38,
  lastRefreshed: new Date().toISOString(),
};

export async function GET() {
  // 1. Try API Gateway (port 8080)
  try {
    const res = await fetch(`${GATEWAY_URL}/api/v1/analytics/summary`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Gateway unreachable, fall through to direct service
  }

  // 2. Try Direct Merchant Analytics Service (port 8097)
  try {
    const directRes = await fetch(`${DIRECT_SERVICE_URL}/api/v1/analytics/summary`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
      headers: { Accept: "application/json" },
    });
    if (directRes.ok) {
      const data = await directRes.json();
      return NextResponse.json(data);
    }
  } catch {
    // Direct service unreachable, fall through to fallback mock
  }

  // 3. Fallback mock telemetry
  return NextResponse.json({
    ...FALLBACK_SUMMARY,
    lastRefreshed: new Date().toISOString(),
  });
}
