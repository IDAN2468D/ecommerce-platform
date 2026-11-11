import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const DIRECT_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || "http://localhost:8097";

export interface SkuDepletionForecastDto {
  skuCode: string;
  title: string;
  currentStock: number;
  dailyBurnRate: number;
  predictedDaysUntilDepletion: number;
  restockUrgency: "CRITICAL" | "URGENT" | "WARNING" | "SAFE" | "HEALTHY";
  calculatedAt: string;
}

const FALLBACK_FORECASTS: SkuDepletionForecastDto[] = [
  {
    skuCode: "LAPTOP-MACBOOK-PRO-16",
    title: "Apple MacBook Pro 16\" M3 Max 36GB 1TB SSD",
    currentStock: 4,
    dailyBurnRate: 1.6,
    predictedDaysUntilDepletion: 2.5,
    restockUrgency: "CRITICAL",
    calculatedAt: new Date().toISOString(),
  },
  {
    skuCode: "WATCH-ULTRA-2",
    title: "Apple Watch Ultra 2 GPS + Cellular 49mm Titanium",
    currentStock: 8,
    dailyBurnRate: 2.1,
    predictedDaysUntilDepletion: 3.8,
    restockUrgency: "CRITICAL",
    calculatedAt: new Date().toISOString(),
  },
  {
    skuCode: "AUDIO-SONY-XM5",
    title: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
    currentStock: 18,
    dailyBurnRate: 3.2,
    predictedDaysUntilDepletion: 5.6,
    restockUrgency: "URGENT",
    calculatedAt: new Date().toISOString(),
  },
  {
    skuCode: "DISP-STUDIO-5K",
    title: "Apple Studio Display 27\" 5K Retina Nano-Texture",
    currentStock: 11,
    dailyBurnRate: 1.8,
    predictedDaysUntilDepletion: 6.1,
    restockUrgency: "URGENT",
    calculatedAt: new Date().toISOString(),
  },
  {
    skuCode: "IPHONE-16-PRO-256",
    title: "Apple iPhone 16 Pro 256GB Desert Titanium",
    currentStock: 45,
    dailyBurnRate: 4.0,
    predictedDaysUntilDepletion: 11.25,
    restockUrgency: "SAFE",
    calculatedAt: new Date().toISOString(),
  },
  {
    skuCode: "TAB-IPAD-PRO-13",
    title: "Apple iPad Pro 13\" M4 OLED 256GB Space Black",
    currentStock: 34,
    dailyBurnRate: 2.4,
    predictedDaysUntilDepletion: 14.1,
    restockUrgency: "SAFE",
    calculatedAt: new Date().toISOString(),
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const onlyCritical = searchParams.get("onlyCritical") === "true";
  const queryString = onlyCritical ? "?onlyCritical=true" : "";

  // 1. Try API Gateway (port 8080)
  try {
    const res = await fetch(`${GATEWAY_URL}/api/v1/analytics/inventory-forecast${queryString}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Gateway down
  }

  // 2. Try Direct Merchant Analytics Service (port 8097)
  try {
    const directRes = await fetch(`${DIRECT_SERVICE_URL}/api/v1/analytics/inventory-forecast${queryString}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
      headers: { Accept: "application/json" },
    });
    if (directRes.ok) {
      const data = await directRes.json();
      return NextResponse.json(data);
    }
  } catch {
    // Service down
  }

  // 3. Fallback mock forecast data
  let results = FALLBACK_FORECASTS;
  if (onlyCritical) {
    results = results.filter((f) => f.restockUrgency === "CRITICAL");
  }

  return NextResponse.json(results);
}
