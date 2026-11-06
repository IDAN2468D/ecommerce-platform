import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "../../../../lib/api-config";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { sku: string } }
) {
  try {
    const gatewayUrl = getGatewayUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${gatewayUrl}/api/v1/reviews/product/${params.sku}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error: any) {
    // Graceful fallback
  }

  return NextResponse.json([]);
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${gatewayUrl}/api/v1/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Customer-Id": customerId,
        "X-Customer-Name": customerName,
      },
      body: JSON.stringify({ ...body, skuCode: params.sku }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
  } catch (error: any) {
    // Graceful fallback
  }

  return NextResponse.json({ message: "Review recorded (offline simulated)" }, { status: 201 });
}
