import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productName, roomType, lightingStyle, dimensionsNotes } = body;

  const score = 94;
  return NextResponse.json({
    compatibilityScore: score,
    productName: productName || "Sony WH-1000XM5 / Apple Studio Setup",
    roomType: roomType || "חדר עבודה מודרני / Gaming Setup",
    lightingAnalysis:
      lightingStyle === "warm"
        ? "תאורה חמה (2700K-3000K) מדגישה את גימור המט והמתכת של המוצר ויוצרת ניגודיות יוקרתית."
        : "תאורת יום/סטודיו (4500K-5500K) מעניקה מראה נקי, מינימליסטי וחד המתאים לסביבת פרודוקטיביות.",
    spatialFitVerdict: `המוצר משתלב בצורה אופטימלית בחלל (${
      dimensionsNotes || "מרווח אוורור תקני של 15 ס״מ מסביב"
    }). מומלץ למקם בגובה העיניים או במרכז שולחן העבודה לנגישות ארגונומית מלאה.`,
    recommendedAccessories: [
      { sku: "ACC-STAND-ALUM", name: "מעמד אלומיניום אנודייז יוקרתי", synergyDiscount: "15%" },
      { sku: "ACC-LIGHT-BAR", name: "פס תאורת LED חכם מסונכרן", synergyDiscount: "12%" },
    ],
  });
}
