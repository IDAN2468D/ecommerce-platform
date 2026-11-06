import { NextRequest, NextResponse } from "next/server";
import { getOrCreateRoom, getRoom, updateRoomCart, addParticipant, SharedCartItem } from "../../../../../lib/shared-cart-store";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const roomId = params.roomId;
  if (!roomId) {
    return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
  }

  const room = getOrCreateRoom(roomId, "משתמש");
  return NextResponse.json({
    success: true,
    room,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const roomId = params.roomId;
  if (!roomId) {
    return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const items: SharedCartItem[] = Array.isArray(body.items) ? body.items : [];
    const actorName = (body.actorName || "משתתף").trim();
    const action = body.action || "עדכן/ה את פריטי הסל";
    const participantId = body.participantId;

    if (participantId) {
      addParticipant(roomId, participantId, actorName);
    }

    const updatedRoom = updateRoomCart(roomId, items, actorName, action);

    return NextResponse.json({
      success: true,
      room: updatedRoom,
    });
  } catch (error: any) {
    console.error("Failed to update shared cart:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update shared cart" },
      { status: 500 }
    );
  }
}
