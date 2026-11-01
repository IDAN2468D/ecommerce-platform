export function getGatewayUrl(): string {
  return (
    process.env.GATEWAY_URL ||
    process.env.NEXT_PUBLIC_GATEWAY_URL ||
    "http://localhost:8080"
  );
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

