import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl, buildTraceHeaders } from "@/lib/api-config";

export const dynamic = "force-dynamic";

export interface MarketplaceVendor {
  id: string;
  vendorCode: string;
  businessName: string;
  slug: string;
  contactEmail: string;
  description: string;
  logoUrl: string;
  bannerUrl?: string;
  rating: number;
  reviewCount: number;
  commissionRatePct: number;
  walletBalanceILS: number;
  totalGrossSalesILS: number;
  totalOrdersFulfilled: number;
  supportedCategories: string[];
  status?: string;
}

const FALLBACK_VENDORS: MarketplaceVendor[] = [
  {
    id: "vnd_sony",
    vendorCode: "VND-SONY-IL",
    businessName: "Sony Official Store Israel",
    slug: "sony-official",
    contactEmail: "store@sony-israel.co.il",
    description: "יבואן רשמי של מוצרי אודיו, אוזניות, ומצלמות מבית Sony עם אחריות יבואן מלאה לשנתיים",
    logoUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
    rating: 4.95,
    reviewCount: 342,
    commissionRatePct: 10.0,
    walletBalanceILS: 14250.0,
    totalGrossSalesILS: 142500.0,
    totalOrdersFulfilled: 95,
    supportedCategories: ["AUDIO", "ELECTRONICS"],
    status: "ACTIVE"
  },
  {
    id: "vnd_apple",
    vendorCode: "VND-APPLE-IL",
    businessName: "iStore Premium Reseller",
    slug: "istore-premium",
    contactEmail: "sales@istore-il.com",
    description: "משווק מורשה פרימיום למחשבי מקבוק, אייפד ואביזרי Apple מקוריים",
    logoUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&w=1200&q=80",
    rating: 4.9,
    reviewCount: 512,
    commissionRatePct: 8.0,
    walletBalanceILS: 28400.0,
    totalGrossSalesILS: 312000.0,
    totalOrdersFulfilled: 68,
    supportedCategories: ["COMPUTERS", "GADGETS"],
    status: "ACTIVE"
  },
  {
    id: "vnd_coffee",
    vendorCode: "VND-COFFEE-IL",
    businessName: "Boutique Roasters TLV",
    slug: "boutique-roasters",
    contactEmail: "hello@roasters-tlv.com",
    description: "קליית בוטיק מקומית של פולי קפה ספיישלטי מכל העולם באספקה חודשית טרייה",
    logoUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    rating: 4.85,
    reviewCount: 189,
    commissionRatePct: 12.0,
    walletBalanceILS: 4800.0,
    totalGrossSalesILS: 40000.0,
    totalOrdersFulfilled: 210,
    supportedCategories: ["COFFEE", "SUBSCRIPTIONS"],
    status: "ACTIVE"
  },
  {
    id: "vnd_dyson",
    vendorCode: "VND-DYSON-IL",
    businessName: "Dyson Home & Lifestyle",
    slug: "dyson-lifestyle",
    contactEmail: "care@dyson-israel.co.il",
    description: "טכנולוגיית שאיבה, טיפוח שיער וטיהור אוויר מתקדמת עם שירות VIP בפריסה ארצית",
    logoUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=400&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
    rating: 4.92,
    reviewCount: 228,
    commissionRatePct: 9.0,
    walletBalanceILS: 19800.0,
    totalGrossSalesILS: 220000.0,
    totalOrdersFulfilled: 114,
    supportedCategories: ["HOME_APPLIANCES", "LIFESTYLE"],
    status: "ACTIVE"
  }
];

export async function GET(request: NextRequest) {
  const gatewayUrl = getGatewayUrl();
  const traceHeaders = buildTraceHeaders(request.headers);

  // 1. Try API Gateway route (/api/v1/marketplace/vendors)
  try {
    const res = await fetch(`${gatewayUrl}/api/v1/marketplace/vendors`, {
      headers: { ...traceHeaders, "Accept": "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return NextResponse.json(data);
      }
    }
  } catch (err: any) {
    // Continue to direct service port
  }

  // 2. Try direct microservice port 8099
  const directUrl = process.env.MARKETPLACE_SERVICE_URL || "http://localhost:8099";
  try {
    const res = await fetch(`${directUrl}/api/v1/marketplace/vendors`, {
      headers: { ...traceHeaders, "Accept": "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return NextResponse.json(data);
      }
    }
  } catch (err: any) {
    // Fall back to robust fallback list
  }

  return NextResponse.json(FALLBACK_VENDORS);
}

export async function POST(request: NextRequest) {
  const gatewayUrl = getGatewayUrl();
  const directUrl = process.env.MARKETPLACE_SERVICE_URL || "http://localhost:8099";
  const traceHeaders = buildTraceHeaders(request.headers);
  const body = await request.json().catch(() => ({}));

  for (const baseUrl of [gatewayUrl, directUrl]) {
    try {
      const res = await fetch(`${baseUrl}/api/v1/marketplace/vendors`, {
        method: "POST",
        headers: {
          ...traceHeaders,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        return NextResponse.json(await res.json(), { status: res.status });
      }
    } catch {
      // Try next or fallback
    }
  }

  // Offline mock fallback
  const mockVendor: MarketplaceVendor = {
    id: `vnd_${Date.now()}`,
    vendorCode: body.vendorCode || `VND-NEW-${Date.now().toString().slice(-4)}`,
    businessName: body.businessName || "חנות מורשית חדשה",
    slug: body.slug || "new-vendor",
    contactEmail: body.contactEmail || "vendor@marketplace.local",
    description: body.description || "חנות מורשית בפלטפורמת Multi-Vendor",
    logoUrl: body.logoUrl || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=400&q=80",
    rating: 5.0,
    reviewCount: 1,
    commissionRatePct: body.commissionRatePct || 10.0,
    walletBalanceILS: 0,
    totalGrossSalesILS: 0,
    totalOrdersFulfilled: 0,
    supportedCategories: body.supportedCategories || ["GENERAL"],
    status: "ACTIVE"
  };

  return NextResponse.json(mockVendor, { status: 201 });
}
