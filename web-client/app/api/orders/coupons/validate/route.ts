import { NextRequest, NextResponse } from "next/server";
import { generateServiceJwt } from "@/lib/auth";
import { getGatewayUrl, safeParseJson } from "@/lib/api-config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = generateServiceJwt("usr_demo");
    const gatewayUrl = getGatewayUrl();

    const res = await fetch(`${gatewayUrl}/api/v1/orders/coupons/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const { data, status } = await safeParseJson(res);
    return NextResponse.json(data, { status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
