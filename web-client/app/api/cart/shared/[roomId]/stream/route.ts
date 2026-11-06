import { NextRequest } from "next/server";
import {
  getOrCreateRoom,
  addParticipant,
  removeParticipant,
  subscribeToRoom,
} from "@/lib/shared-cart-store";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const roomId = params.roomId;
  const participantId = request.nextUrl.searchParams.get("userId") || `user_${Math.random().toString(36).substring(2, 9)}`;
  const participantName = request.nextUrl.searchParams.get("userName") || "משתתף חדש";

  const room = getOrCreateRoom(roomId, participantName);
  addParticipant(roomId, participantId, participantName);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial snapshot
      const initialData = JSON.stringify({
        type: "INIT",
        payload: { room, participantId },
      });
      controller.enqueue(encoder.encode(`event: message\ndata: ${initialData}\n\n`));

      // 2. Subscribe to room changes
      const unsubscribe = subscribeToRoom(roomId, (event) => {
        try {
          const data = JSON.stringify(event);
          controller.enqueue(encoder.encode(`event: message\ndata: ${data}\n\n`));
        } catch (err) {
          console.warn("Failed to push SSE message:", err);
        }
      });

      // 3. Heartbeat keeping connection open
      const intervalId = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(intervalId);
        }
      }, 15000);

      // 4. Cleanup on abort
      request.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        unsubscribe();
        removeParticipant(roomId, participantId);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Encoding": "none",
    },
  });
}
