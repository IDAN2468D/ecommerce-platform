import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "@/lib/api-config";

export async function POST(
  request: NextRequest,
  { params }: { params: { sku: string } }
) {
  try {
    const customerId = request.headers.get("x-customer-id") || "usr_demo";
    let body = {};
    try {
      body = await request.json();
    } catch {
      // body optional
    }

    const gatewayUrl = getGatewayUrl();
    const res = await fetch(`${gatewayUrl}/api/v1/wishlist/${params.sku}`, {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { sku: string } }
) {
  try {
    const customerId = request.headers.get("x-customer-id") || "usr_demo";
    const gatewayUrl = getGatewayUrl();
    const res = await fetch(`${gatewayUrl}/api/v1/wishlist/${params.sku}`, {
      method: "DELETE",
      headers: {
        "X-Customer-Id": customerId,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
