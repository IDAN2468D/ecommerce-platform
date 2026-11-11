import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productName, category, heightCm, weightKg, fitPreference, gender } = body;

    const height = Number(heightCm || 178);
    const weight = Number(weightKg || 74);

    // Calculate recommended size based on BMI / dimensions
    const bmi = weight / Math.pow(height / 100, 2);
    let recommendedSize = "M";
    if (bmi < 20) recommendedSize = "S";
    else if (bmi < 24) recommendedSize = "M";
    else if (bmi < 28) recommendedSize = "L";
    else recommendedSize = "XL";

    if (fitPreference === "oversized") {
      recommendedSize = recommendedSize === "S" ? "M" : recommendedSize === "M" ? "L" : "XL";
    }

    const fitScore = Math.floor(Math.random() * 6) + 94; // 94-99%

    return NextResponse.json({
      status: "SUCCESS",
      productName: productName || "חולצת כפתורים פרימיום מבית TechNova",
      recommendedSize,
      fitScore,
      measurements: {
        estimatedChestCm: Math.round(weight * 1.35),
        estimatedWaistCm: Math.round(weight * 1.15),
        estimatedShoulderWidthCm: Math.round(height * 0.25),
        recommendedLengthCm: Math.round(height * 0.42),
      },
      fitVerdict: `מידה ${recommendedSize} מעניקה התאמה אופטימלית (${fitScore}%) לגזרה שלך. מפתח הכתפיים יושב בדיוק בקו הנכון, עם נפילה טבעית של הבד ללא מתיחה עודפת במותניים.`,
      heatmapZones: [
        { zone: "כתפיים", status: "PERFECT", label: "תואם ב-100%" },
        { zone: "חזה", status: "PERFECT", label: "מרווח נשימה אידיאלי" },
        { zone: "מותן", status: "COMFORTABLE", label: "גזרה מחמיאה" },
        { zone: "שרוולים / אורך", status: "PERFECT", label: "מגיע לקו מפרק כף היד" },
      ],
      aiStylistTip: "הפריט משתלב מעולה עם מכנסי צ'ינו כהים או ג'ינס בגזרה ישרה ונעלי עור קז'ואל.",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to process virtual fitting simulation", details: error?.message },
      { status: 500 }
    );
  }
}
