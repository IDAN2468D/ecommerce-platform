import { NextRequest, NextResponse } from "next/server";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

export async function GET(
  request: NextRequest,
  { params }: { params: { sku: string } }
) {
  try {
    const sku = params.sku;
    const res = await fetch(`${GATEWAY_URL}/api/v1/inventory/${sku}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Item not found" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
