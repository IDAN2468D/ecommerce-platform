import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "../../../lib/api-config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const customerId = request.headers.get("x-customer-id") || "usr_demo";
    const gatewayUrl = getGatewayUrl();
    const res = await fetch(`${gatewayUrl}/api/v1/wishlist`, {
      cache: "no-store",
      headers: {
        "X-Customer-Id": customerId,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
