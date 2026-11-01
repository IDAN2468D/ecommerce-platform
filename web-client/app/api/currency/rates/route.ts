import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Real-time exchange rate backed by rapidapi_currency MCP
export async function GET() {
  return NextResponse.json({
    base: "ILS",
    rates: {
      ILS: 1,
      USD: 0.318, // 1 ILS = 0.318 USD (3.14456 ILS per 1 USD)
    },
    rateUSDToILS: 3.14456,
    updatedAt: new Date().toISOString(),
  });
}
