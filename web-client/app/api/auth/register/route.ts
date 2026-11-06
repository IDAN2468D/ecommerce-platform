import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "../../../../lib/api-config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const gatewayUrl = getGatewayUrl();

    const res = await fetch(`${gatewayUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get("content-type") || "";
    let data: any = {};
    if (contentType.includes("json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text || `HTTP ${res.status}` };
      }
    }

    if (!res.ok) {
      const errorMessage =
        data.detail ||
        data.message ||
        (typeof data.error === "string" ? data.error : "שגיאה ברישום החשבון") ||
        `הרשמה נכשלה (סטטוס ${res.status})`;
      return NextResponse.json(
        { error: errorMessage },
        { status: res.status }
      );
    }

    const user = data.user || {};
    const responsePayload = {
      ...data,
      token: data.token,
      userId: user.id || data.userId || "",
      email: user.email || data.email || body.email || "",
      fullName: user.fullName || data.fullName || body.fullName || "",
      role: user.role || data.role || "CUSTOMER",
    };

    return NextResponse.json(responsePayload, { status: res.status });
  } catch (error: any) {
    console.error("Auth register error:", error);
    return NextResponse.json(
      { error: error.message || "שגיאת תקשורת עם שרת ה-Gateway" },
      { status: 500 }
    );
  }
}
