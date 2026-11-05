import { NextRequest, NextResponse } from "next/server";
import { processVoiceShoppingQuery } from "@/lib/gemini-voice-shopper";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const transcript = body.transcript || body.query || "";
    const cart = body.cart || [];

    const result = processVoiceShoppingQuery(transcript, cart);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        actionType: "SHOW_DETAILS",
        spokenText: "אני כאן לעזור. תוכל לבקש ממני לחפש מוצרים, להוסיף לעגלה או לעבור לקופה.",
      },
      { status: 200 }
    );
  }
}
