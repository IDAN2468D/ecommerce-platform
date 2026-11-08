import { NextRequest } from "next/server";
import { getGatewayUrl } from "../../../../../lib/api-config";
import { askGeminiAssistant } from "../../../../../lib/gemini-assistant";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const query = searchParams.get("query") || "עזרה";
    const conversationId = searchParams.get("conversationId") || "conv_stream";
    const gatewayUrl = getGatewayUrl();

    const targetUrls = [
      `${gatewayUrl}/api/v1/agents/swarm/stream?${queryString}`,
      `http://agent-swarm-service:8093/api/v1/agents/swarm/stream?${queryString}`,
      `http://localhost:8093/api/v1/agents/swarm/stream?${queryString}`,
    ];

    for (const url of targetUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(url, {
          headers: {
            Accept: "text/event-stream",
          },
          cache: "no-store",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok && res.body) {
          return new Response(res.body, {
            headers: {
              "Content-Type": "text/event-stream; charset=utf-8",
              "Cache-Control": "no-cache, no-transform",
              Connection: "keep-alive",
            },
          });
        }
      } catch {
        // Fallback to embedded SSE generator
      }
    }

    const aiResponse = await askGeminiAssistant(query, [], conversationId);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        const agents = aiResponse.agentsInvolved || [
          "SupervisorRouterAgent",
          "CatalogDiscoveryAgent",
          "A2AConsensusCriticAgent",
        ];
        agents.forEach((agent, index) => {
          const stagePayload = JSON.stringify({
            stage: index + 1,
            agent,
            status: "COMPLETED",
            title: `הפעלת ${agent} (Swarm v8.0)`,
          });
          controller.enqueue(encoder.encode(`event: stage\ndata: ${stagePayload}\n\n`));
        });

        controller.enqueue(
          encoder.encode(`event: final_response\ndata: ${JSON.stringify(aiResponse)}\n\n`)
        );
        controller.enqueue(
          encoder.encode(`event: done\ndata: ${JSON.stringify({ status: "STREAM_COMPLETE" })}\n\n`)
        );
        controller.close();
      },
    });

    return new Response(stream, {
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
