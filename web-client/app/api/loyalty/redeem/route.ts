import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "@/lib/api-config";

export async function POST(request: NextRequest) {
  try {
    const customerId = request.headers.get("x-customer-id") || "usr_demo";
    const body = await request.json();
    const gatewayUrl = getGatewayUrl();

    const res = await fetch(`${gatewayUrl}/api/v1/loyalty/redeem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Customer-Id": customerId,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
