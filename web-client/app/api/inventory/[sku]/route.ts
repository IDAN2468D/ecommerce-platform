import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from "@/lib/api-config";
import { FALLBACK_PRODUCTS } from "@/lib/fallback-catalog";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { sku: string } }
) {
  const sku = params.sku;
  const gatewayUrl = getGatewayUrl();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${gatewayUrl}/api/v1/inventory/${sku}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.warn(`Gateway unreachable for SKU ${sku}, falling back to static catalog`);
  }

  const found = FALLBACK_PRODUCTS.find(
    (p) => p.skuCode.toLowerCase() === sku.toLowerCase()
  );

  if (found) {
    return NextResponse.json({
      skuCode: found.skuCode,
      productName: found.productName,
      unitPrice: found.unitPrice,
      description: found.description,
      category: found.category,
      imageUrl: found.imageUrl,
      availableQuantity: found.availableQuantity,
      reservedQuantity: found.reservedQuantity,
    });
  }

  return NextResponse.json({ error: "Item not found" }, { status: 404 });
}
