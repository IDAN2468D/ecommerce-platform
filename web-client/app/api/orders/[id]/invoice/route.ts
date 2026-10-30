import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "@/lib/api-config";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    if (!orderId || orderId === "undefined" || orderId === "null") {
      return NextResponse.json(
        { error: "Invalid order ID specified" },
        { status: 400 }
      );
    }

    const gatewayUrl = getGatewayUrl();
    const res = await fetch(`${gatewayUrl}/api/v1/orders/${orderId}/invoice`, {
      cache: "no-store",
    });

    if (!res.ok) {
      const errDetails = await res.text().catch(() => "");
      return NextResponse.json(
        { error: "Failed to fetch invoice PDF", details: errDetails },
        { status: res.status }
      );
    }

    const pdfBuffer = await res.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${orderId}.pdf"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
