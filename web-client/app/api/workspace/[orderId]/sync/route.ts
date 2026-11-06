import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "../../../../../lib/api-config";

export async function POST(
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

    const body = await request.json().catch(() => ({}));
    const customerId = body.customerId || "usr_demo";
    const gatewayUrl = getGatewayUrl();

    const res = await fetch(`${gatewayUrl}/api/v1/workspace/sync/${orderId}?customerId=${customerId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errDetails = await res.text().catch(() => "");
      return NextResponse.json(
        { error: "Failed to sync order to Google Workspace", details: errDetails },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
