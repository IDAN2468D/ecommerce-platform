import { NextRequest, NextResponse } from "next/server";
import { getAgentSwarmUrl, getGatewayUrl } from "../../../../../lib/api-config";
import { askGeminiAssistant } from "../../../../../lib/gemini-assistant";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customerId =
      request.headers.get("x-customer-id") || body.customerId || "usr_demo";
    const query = body.query || body.message || body.prompt || "";
    const history = body.history || [];
    const conversationId = body.conversationId || "conv_client_session";

    const swarmUrl = getAgentSwarmUrl();
    const gatewayUrl = getGatewayUrl();

    const targetUrls = [
      `${swarmUrl}/api/v1/agents/swarm/query`,
      "http://agent-swarm-service:8093/api/v1/agents/swarm/query",
      `${gatewayUrl}/api/v1/agents/swarm/query`,
      "http://localhost:8093/api/v1/agents/swarm/query",
    ];

    for (const url of targetUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

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
        }
      } catch {
        // Continue to next endpoint or embedded Swarm v8.0 engine
      }
    }

    const aiResponse = await askGeminiAssistant(query, history, conversationId);
    return NextResponse.json(aiResponse);
  } catch (error: any) {
    console.error("Agent Swarm Query Error:", error);
    const aiResponse = await askGeminiAssistant("עזרה", [], "conv_client_session");
    return NextResponse.json(aiResponse);
  }
}
