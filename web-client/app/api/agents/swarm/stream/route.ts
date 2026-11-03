import { NextRequest } from "next/server";
import { getGatewayUrl } from "@/lib/api-config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gatewayUrl = getGatewayUrl();
    const targetUrl = `${gatewayUrl}/api/v1/agents/swarm/stream?${searchParams.toString()}`;

    const res = await fetch(targetUrl, {
      headers: {
        Accept: "text/event-stream",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(err || "Failed to initialize Swarm event stream", {
        status: res.status,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    return new Response(res.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    return new Response(error.message || "Internal server error connecting to Swarm stream", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
