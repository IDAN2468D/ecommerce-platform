import crypto from "crypto";

export function getGatewayUrl(): string {
  return (
    process.env.GATEWAY_URL ||
    process.env.NEXT_PUBLIC_GATEWAY_URL ||
    "http://localhost:8080"
  );
}

/**
 * Generates W3C TraceContext (traceparent) and X-Trace-Id headers
 * for end-to-end Distributed Tracing from Next.js web-client -> API Gateway -> Microservices -> Kafka -> SSE.
 */
export function buildTraceHeaders(incomingHeaders?: Headers): Record<string, string> {
  const existingTraceId = incomingHeaders?.get("x-trace-id");
  const traceId = existingTraceId && existingTraceId.length === 32
    ? existingTraceId
    : crypto.randomBytes(16).toString("hex");
  const spanId = crypto.randomBytes(8).toString("hex");
  const traceparent = incomingHeaders?.get("traceparent") || `00-${traceId}-${spanId}-01`;

  return {
    "X-Trace-Id": traceId,
    traceparent,
  };
}

export async function safeParseJson(res: Response): Promise<{ data: any; status: number; ok: boolean }> {
  const text = await res.text();
  if (!text || text.trim() === "") {
    return {
      data: res.ok ? {} : { error: `Server returned status ${res.status} (${res.statusText || "Empty response"})` },
      status: res.status,
      ok: res.ok,
    };
  }
  try {
    const data = JSON.parse(text);
    return { data, status: res.status, ok: res.ok };
  } catch {
    return { data: { error: text }, status: res.status, ok: res.ok };
  }
}
