import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "@/lib/api-config";
import { askGeminiAssistant } from "@/lib/gemini-assistant";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body.query || body.message || body.prompt || "";
    const history = body.history || [];
    const gatewayUrl = getGatewayUrl();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${gatewayUrl}/api/v1/rag/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
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
      // Continue to direct Gemini fallback
    }

    // Direct Gemini AI Fallback using Render GEMINI_API_KEY
    const aiResponse = await askGeminiAssistant(query, history);
    return NextResponse.json(aiResponse);
  } catch (error: any) {
    console.error("RAG Query Error:", error);
    const aiResponse = await askGeminiAssistant("עזרה", []);
    return NextResponse.json(aiResponse);
  }
}
