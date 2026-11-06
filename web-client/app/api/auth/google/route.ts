import { NextRequest, NextResponse } from "next/server";
import { generateServiceJwt } from "../../../../lib/auth";
import { getGatewayUrl } from "../../../../lib/api-config";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = (body.email || "idankzm@gmail.com").trim().toLowerCase();
    const fullName = (body.fullName || "Idan Kazam").trim();
    const avatarUrl = body.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";
    const googleId = body.googleId || `goog_${crypto.createHash("md5").update(email).digest("hex").slice(0, 12)}`;

    // User ID format compatible with microservices (UUID)
    const userId = body.userId || crypto.randomUUID();

    // Generate valid HMAC-SHA256 JWT
    const token = generateServiceJwt(userId);

    const userProfile = {
      id: userId,
      userId: userId,
      email: email,
      fullName: fullName,
      role: "VIP_PLATINUM",
      provider: "google",
      googleId: googleId,
      avatarUrl: avatarUrl,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    // Optionally notify or register in backend auth-service via Gateway
    try {
      const gatewayUrl = getGatewayUrl();
      await fetch(`${gatewayUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: `GoogleAuth_${googleId}!`,
          fullName: fullName,
        }),
      }).catch(() => {});
    } catch {}

    return NextResponse.json({
      token,
      tokenType: "Bearer",
      expiresIn: 86400,
      user: userProfile,
    });
  } catch (error: any) {
    console.error("Google auth route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process Google sign-in" },
      { status: 500 }
    );
  }
}
