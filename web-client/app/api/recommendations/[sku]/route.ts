import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "@/lib/api-config";

export async function GET(
  request: NextRequest,
  { params }: { params: { sku: string } }
) {
  try {
    const gatewayUrl = getGatewayUrl();
    const res = await fetch(`${gatewayUrl}/api/v1/recommendations/${params.sku}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch recommendations" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
