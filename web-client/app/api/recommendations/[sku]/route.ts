import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "@/lib/api-config";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { sku: string } }
) {
  try {
    const gatewayUrl = getGatewayUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${gatewayUrl}/api/v1/recommendations/${params.sku}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error: any) {
    // Graceful fallback
  }

  return NextResponse.json([]);
}
