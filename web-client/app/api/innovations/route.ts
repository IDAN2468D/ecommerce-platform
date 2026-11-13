import { NextRequest, NextResponse } from "next/server";

const GATEWAY_URL = process.env.GATEWAY_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

const INITIAL_DATA = {
  rentals: [
    {
      id: "rnt_1",
      contractNumber: "RNT-OWN-8841A",
      customerId: "cust_vip_idan",
      skuCode: "COMP-MACBOOK-M3",
      productName: "Apple MacBook Pro 16 M3 Max 36GB",
      durationDays: 14,
      retailPriceILS: 13999,
      rentalFeeILS: 881.94,
      refundableDepositILS: 2799.8,
      rentToOwnCreditILS: 749.65,
      remainingBuyoutPriceILS: 13249.35,
      planType: "RENT_TO_OWN_85_CREDIT",
      status: "ACTIVE_LEASE",
    },
  ],
  customs: [
    {
      id: "cst_1",
      declarationNumber: "CN23-IL-7721B",
      originCountry: "USA - Delaware Hub",
      hsCode: "8518.30.00",
      productName: "Sony WH-1000XM5 + Dual Accessories Pack",
      itemCount: 2,
      subtotalILS: 480,
      estimatedValueUSD: 129.73,
      vatExemptUnder75USD: false,
      vatAmountILS: 86.4,
      customsDutyAmountILS: 0,
      totalLandedCostILS: 566.4,
      smartSplitRecommended: true,
      potentialSplitSavingsILS: 86.4,
    },
  ],
  configurator: [
    {
      id: "rig_1",
      buildCode: "RIG-AI-9920X",
      customerId: "cust_vip_idan",
      rigProfileType: "AI_WORKSTATION_AND_PODCAST_STUDIO",
      selectedSkus: ["COMP-MACBOOK-M3", "MON-LG-OLED42", "AUDIO-SONY-XM5", "ACC-KEYCHRON-Q1"],
      componentCount: 4,
      compatibilityScorePct: 100,
      estimatedWattage: 460,
      zeroBottleneckVerified: true,
      baseComponentsTotalILS: 21450,
      assemblyDiscountPct: 14,
      finalBuildPriceILS: 18447,
    },
  ],
  fulfillment: [
    {
      id: "lck_1",
      reservationCode: "LCK-247-5519E",
      customerId: "cust_vip_idan",
      skuCode: "AUDIO-SONY-XM5",
      productName: "Sony WH-1000XM5 Wireless ANC",
      hubCity: "EILAT_FREE_ZONE",
      lockerStationName: "Ice Mall Eilat 24/7 Smart Locker Hub (0% VAT)",
      compartmentNumber: "BOX-B24",
      otpUnlockPin: "482910",
      eilatVatFreeZone: true,
      retailPriceILS: 1690,
      eilatTaxSavingsILS: 257.8,
      finalPickupPriceILS: 1432.2,
      readyInMinutes: 45,
    },
  ],
  installations: [
    {
      id: "inst_1",
      bookingCode: "TECH-PRO-3310T",
      customerId: "cust_vip_idan",
      skuCode: "MON-LG-OLED42",
      productName: "LG C3 42 OLED Pro Studio Display",
      installationType: "WALL_MOUNT_AND_COLOR_CALIBRATION",
      city: "Tel Aviv",
      assignedTechnicianName: "Noam Levi (Certified Pro AV & Smart Rig Specialist)",
      scheduledWindow: "מחר 14:00-16:00 (מסונכרן +45 דק' לאחר מסירת השליח)",
      syncedWithDeliverySaga: true,
      baseServiceFeeILS: 390,
      vipDiscountILS: 97.5,
      finalInstallationFeeILS: 292.5,
    },
  ],
  sustainability: [
    {
      id: "esg_1",
      certificateNumber: "ESG-CO2-6104G",
      customerId: "cust_vip_idan",
      skuCode: "COMP-MACBOOK-M3",
      productName: "Apple MacBook Pro 16 M3 Max (100% Recycled Aluminum)",
      weightKg: 2.15,
      ecoConsolidatedDelivery: true,
      standardEmissionsKgCo2e: 5.16,
      netEmissionsKgCo2e: 2.84,
      savedEmissionsKgCo2e: 2.32,
      ecoScoreGrade: "A+ (EV Zero-Emission Route)",
      awardedVipEcoPoints: 180,
    },
  ],
  wallet: [
    {
      id: "wlt_1",
      voucherCode: "WLT-FX-8092W",
      senderCustomerId: "cust_vip_idan",
      recipientEmail: "vip.wallet@company.co.il",
      occasionTitle: "VIP Unified RMA + Trade-In + Gift Balance",
      amountILS: 1000,
      topUpBonusILS: 80,
      totalAvailableILS: 1080,
      equivalentUSD: 291.89,
      equivalentEUR: 270,
      status: "ACTIVE_MULTI_CURRENCY_BALANCE",
    },
  ],
  creators: [
    {
      id: "cr_1",
      campaignCode: "LIVE-CR-4412L",
      creatorHandle: "@IdanTechStudio",
      streamTitle: "סקירה חיה: אוזניות האולפן והביטול רעשים הטובות ל-2026",
      pinnedSkuCode: "AUDIO-SONY-XM5",
      pinnedProductName: "Sony WH-1000XM5 Wireless ANC",
      creatorPromoCode: "IDANTELIVE15",
      buyerDiscountPct: 15,
      creatorCommissionPct: 10,
      retailPriceILS: 1690,
      liveDropPriceILS: 1436.5,
      estimatedCreatorPayoutPerSaleILS: 143.65,
      liveViewersCount: 420,
    },
  ],
};

export async function GET() {
  return NextResponse.json(INITIAL_DATA);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { service, payload } = body;

  const endpointMap: Record<string, string> = {
    rentals: "/api/v1/rentals",
    customs: "/api/v1/customs/calculate",
    configurator: "/api/v1/configurator/build",
    fulfillment: "/api/v1/fulfillment/reserve-locker",
    installations: "/api/v1/installations/book",
    sustainability: "/api/v1/sustainability/assess",
    wallet: "/api/v1/wallet/giftcard",
    creators: "/api/v1/creators/campaigns",
  };

  const targetPath = endpointMap[service];
  if (targetPath) {
    try {
      const res = await fetch(`${GATEWAY_URL}${targetPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch {}
  }

  return NextResponse.json({
    status: "EXECUTED_WITH_SWARM_FALLBACK",
    service,
    timestamp: new Date().toISOString(),
    ...payload,
  });
}
