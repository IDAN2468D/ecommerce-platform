import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "@/lib/api-config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const gatewayUrl = getGatewayUrl();

    // Call Python Multi-Agent Swarm Service via API Gateway
    const res = await fetch(`${gatewayUrl}/api/v1/agents/swarm/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...(request.headers.get("x-customer-id")
          ? { "X-Customer-Id": request.headers.get("x-customer-id")! }
          : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: errorText || "Failed to query Multi-Agent Swarm service" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error communicating with Multi-Agent Swarm" },
      { status: 500 }
    );
  }
}
