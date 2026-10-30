import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "@/lib/api-config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const gatewayUrl = getGatewayUrl();

    const res = await fetch(`${gatewayUrl}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json; charset=utf-8",
      },
    });

    const contentType = res.headers.get("content-type") || "";
    let data: any = {};
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { error: text || `HTTP ${res.status}` };
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || data.error || "Failed to fetch user profile" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: error.message || "שגיאת תקשורת עם שרת ה-Gateway" },
      { status: 500 }
    );
  }
}
