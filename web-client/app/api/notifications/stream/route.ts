import { NextRequest } from "next/server";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId") || "usr_demo";

  try {
    const upstream = await fetch(`${GATEWAY_URL}/api/v1/notifications/stream/${customerId}`, {
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
