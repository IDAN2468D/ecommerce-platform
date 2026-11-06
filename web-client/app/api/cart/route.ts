import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "../../../lib/api-config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const customerId = request.headers.get("x-customer-id") || "usr_demo";
    const gatewayUrl = getGatewayUrl();
    const res = await fetch(`${gatewayUrl}/api/v1/cart`, {
      cache: "no-store",
      headers: {
        "X-Customer-Id": customerId,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch cart" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const customerId = request.headers.get("x-customer-id") || "usr_demo";
    const body = await request.json();
    const gatewayUrl = getGatewayUrl();

    const res = await fetch(`${gatewayUrl}/api/v1/cart/items`, {
      method: "PUT",
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

export async function DELETE(request: NextRequest) {
  try {
    const customerId = request.headers.get("x-customer-id") || "usr_demo";
    const gatewayUrl = getGatewayUrl();
    const res = await fetch(`${gatewayUrl}/api/v1/cart`, {
      method: "DELETE",
      headers: {
        "X-Customer-Id": customerId,
      },
    });

    return new NextResponse(null, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
