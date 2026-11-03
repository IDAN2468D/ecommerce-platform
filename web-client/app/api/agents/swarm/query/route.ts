import { NextRequest, NextResponse } from "next/server";
import { getAgentSwarmUrl, getGatewayUrl } from "@/lib/api-config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customerId = request.headers.get("x-customer-id") || body.customerId || "usr_demo";
    const swarmUrl = getAgentSwarmUrl();
    const gatewayUrl = getGatewayUrl();

    // Priority order:
    // 1. Direct swarm service URL (e.g. http://agent-swarm-service:8093 or http://localhost:8093)
    // 2. Gateway route (http://api-gateway:8080/api/v1/agents/swarm/query)
    // 3. Fallbacks
    const targetUrls = [
      `${swarmUrl}/api/v1/agents/swarm/query`,
      "http://agent-swarm-service:8093/api/v1/agents/swarm/query",
      `${gatewayUrl}/api/v1/agents/swarm/query`,
      "http://localhost:8093/api/v1/agents/swarm/query",
    ];

    let lastError = null;

    for (const url of targetUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);

        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "X-Customer-Id": customerId,
          },
          body: JSON.stringify(body),
          cache: "no-store",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        } else {
          lastError = `Status ${res.status} from ${url}`;
        }
      } catch (err: any) {
        lastError = err.message || String(err);
      }
    }

    return NextResponse.json(
      { error: lastError || "Failed to query Multi-Agent Swarm service across all endpoints" },
      { status: 502 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error communicating with Multi-Agent Swarm" },
      { status: 500 }
    );
  }
}
