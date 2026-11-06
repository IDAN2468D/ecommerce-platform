import { NextRequest } from "next/server";
import { getGatewayUrl } from "../../../../../lib/api-config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const gatewayUrl = getGatewayUrl();

    const targetUrls = [
      `${gatewayUrl}/api/v1/agents/swarm/stream?${queryString}`,
      `http://agent-swarm-service:8093/api/v1/agents/swarm/stream?${queryString}`,
      `http://localhost:8093/api/v1/agents/swarm/stream?${queryString}`,
    ];

    let lastError = null;

    for (const url of targetUrls) {
      try {
        const res = await fetch(url, {
          headers: {
            Accept: "text/event-stream",
          },
          cache: "no-store",
        });

        if (res.ok && res.body) {
          return new Response(res.body, {
            headers: {
              "Content-Type": "text/event-stream; charset=utf-8",
              "Cache-Control": "no-cache, no-transform",
              Connection: "keep-alive",
            },
          });
        } else {
          lastError = `Status ${res.status} from ${url}`;
        }
      } catch (err: any) {
        lastError = err.message || String(err);
      }
    }

    return new Response(lastError || "Failed to initialize Swarm event stream across all endpoints", {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    return new Response(error.message || "Internal server error connecting to Swarm stream", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
