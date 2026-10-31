import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "@/lib/api-config";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    if (!orderId || orderId === "undefined" || orderId === "null") {
      return NextResponse.json(
        { error: "Invalid order ID specified" },
        { status: 400 }
      );
    }

    const gatewayUrl = getGatewayUrl();
    const res = await fetch(`${gatewayUrl}/api/v1/workspace/links/${orderId}`, {
      cache: "no-store",
    });

    if (res.status === 404) {
      return NextResponse.json(null, { status: 404 });
    }

    if (!res.ok) {
      const errDetails = await res.text().catch(() => "");
      return NextResponse.json(
        { error: "Failed to fetch workspace links", details: errDetails },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
