import { NextRequest, NextResponse } from "next/server";
import { generateServiceJwt } from "@/lib/auth";
import { getGatewayUrl } from "@/lib/api-config";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : generateServiceJwt("usr_demo");

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "10";
    const gatewayUrl = getGatewayUrl();

    const res = await fetch(`${gatewayUrl}/api/v1/orders?page=${page}&size=${size}&sort=createdAt,desc`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : generateServiceJwt(body.customerId || "usr_demo");

    const idempotencyKey = crypto.randomUUID();
    const gatewayUrl = getGatewayUrl();

    const res = await fetch(`${gatewayUrl}/api/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
