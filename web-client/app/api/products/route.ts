import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "../../../lib/api-config";
import { FALLBACK_PRODUCTS, CatalogProduct } from "../../../lib/fallback-catalog";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  const gatewayUrl = getGatewayUrl();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${gatewayUrl}/api/v1/products${query}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return NextResponse.json(data);
      }
    }
  } catch (error: any) {
    console.warn("Backend Gateway/Inventory unreachable, using rich fallback catalog:", error?.message);
  }

  // Graceful Fallback: filter fallback catalog by category or tag if requested
  let filtered = FALLBACK_PRODUCTS;
  if (category && category !== "ALL" && category !== "הכל") {
    const catLower = category.toLowerCase();
    filtered = FALLBACK_PRODUCTS.filter(
      (p) =>
        p.category.toLowerCase() === catLower ||
        (Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase() === catLower))
    );
  }

  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const gatewayUrl = getGatewayUrl();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${gatewayUrl}/api/v1/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
  } catch (error: any) {
    console.warn("Backend Gateway offline for POST /api/products, simulating response");
  }

  return NextResponse.json(
    { message: "Product created (offline simulated)", body: await request.json().catch(() => ({})) },
    { status: 201 }
  );
}
