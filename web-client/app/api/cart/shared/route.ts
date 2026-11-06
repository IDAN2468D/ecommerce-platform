import { NextRequest, NextResponse } from "next/server";
import { getOrCreateRoom, updateRoomCart, SharedCartItem } from "../../../../lib/shared-cart-store";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const hostName = (body.hostName || "עידן (מנהל העגלה)").trim();
    const initialItems: SharedCartItem[] = Array.isArray(body.items) ? body.items : [];

    const roomId = `room-${crypto.randomBytes(4).toString("hex")}`;
    const room = getOrCreateRoom(roomId, hostName);

    if (initialItems.length > 0) {
      updateRoomCart(roomId, initialItems, hostName, `ייבא ${initialItems.length} פריטים לעגלה המשותפת`);
    }

    const origin = request.nextUrl.origin || "http://localhost:3000";
    const shareUrl = `${origin}/cart?shared=${roomId}`;

    return NextResponse.json({
      success: true,
      roomId,
      shareUrl,
      room,
    });
  } catch (error: any) {
    console.error("Failed to create shared cart room:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create shared cart room" },
      { status: 500 }
    );
  }
}
