import { NextRequest } from "next/server";
import { getGatewayUrl } from "../../../../lib/api-config";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId") || "usr_demo";
  const gatewayUrl = getGatewayUrl();

  try {
    const upstream = await fetch(`${gatewayUrl}/api/v1/notifications/stream/${customerId}`, {
      headers: {
        Accept: "text/event-stream",
      },
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      return new Response("Failed to establish SSE stream", { status: 502 });
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
