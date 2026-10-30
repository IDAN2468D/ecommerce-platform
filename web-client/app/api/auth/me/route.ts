import { NextRequest, NextResponse } from "next/server";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";

    const res = await fetch(`${GATEWAY_URL}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json; charset=utf-8",
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
