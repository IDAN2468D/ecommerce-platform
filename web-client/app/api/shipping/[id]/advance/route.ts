import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "@/lib/api-config";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    const gatewayUrl = getGatewayUrl();
    const res = await fetch(`${gatewayUrl}/api/v1/shipping/${params.id}/advance-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
