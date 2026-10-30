import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "@/lib/api-config";

export async function GET(
  request: NextRequest,
  { params }: { params: { sku: string } }
) {
  try {
    const gatewayUrl = getGatewayUrl();
    const res = await fetch(`${gatewayUrl}/api/v1/reviews/product/${params.sku}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sku: string } }
) {
  try {
    const body = await request.json();
    const customerId = request.headers.get("x-customer-id") || "usr_demo";
    const customerName = request.headers.get("x-customer-name") || "רוכש מאומת";
    const gatewayUrl = getGatewayUrl();

    const res = await fetch(`${gatewayUrl}/api/v1/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Customer-Id": customerId,
        "X-Customer-Name": customerName,
      },
      body: JSON.stringify({ ...body, skuCode: params.sku }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
