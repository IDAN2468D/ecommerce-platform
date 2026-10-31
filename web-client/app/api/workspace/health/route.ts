import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "@/lib/api-config";

export async function GET(request: NextRequest) {
  try {
    const gatewayUrl = getGatewayUrl();
    const res = await fetch(`${gatewayUrl}/api/v1/workspace/health`, {
      cache: "no-store",
    });

    if (!res.ok) {
      const errDetails = await res.text().catch(() => "");
      return NextResponse.json(
        { error: "Workspace health check failed", details: errDetails },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { service: "workspace-integration-service", status: "DOWN", mcpServerConnected: false, error: error.message },
      { status: 500 }
    );
  }
}
