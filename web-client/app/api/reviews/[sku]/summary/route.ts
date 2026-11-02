import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "@/lib/api-config";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ sku: string }> | { sku: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const sku = resolvedParams.sku;
    const gatewayUrl = getGatewayUrl();

    const res = await fetch(
      `${gatewayUrl}/api/v1/reviews/${encodeURIComponent(sku)}/summary`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: errorText || "Failed to fetch AI review summary" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error fetching review summary" },
      { status: 500 }
    );
  }
}
