import { NextRequest, NextResponse } from "next/server";
import { generateServiceJwt } from "@/lib/auth";
import { getGatewayUrl } from "@/lib/api-config";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const token = generateServiceJwt("usr_demo");
    const gatewayUrl = getGatewayUrl();

    const res = await fetch(`${gatewayUrl}/api/v1/orders/${orderId}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
