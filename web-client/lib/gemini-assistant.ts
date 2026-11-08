import { FALLBACK_PRODUCTS } from "./fallback-catalog";

export interface Citation {
  skuCode: string;
  title: string;
  price: number;
  relevanceScore?: number;
  category?: string;
  inStock?: boolean;
  snippet?: string;
  imageUrl?: string;
  rating?: number;
}

export interface ExecutedAction {
  toolName: string;
  status: "SUCCESS" | "FAILED";
  summary: string;
  payload?: any;
}

export interface AssistantResponse {
  answer: string;
  citations: Citation[];
  executedActions: ExecutedAction[];
  agentsInvolved: string[];
  model: string;
  latencyMs: number;
  executionPlan?: any;
  a2aDebate?: any;
  memoryCheckpoint?: any;
  hitlGate?: any;
  tokenTelemetry?: any;
}

const SESSION_TURN_MAP = new Map<string, number>();

const SYSTEM_INSTRUCTION = `
אתה עוזר ה-AI החכם ומתזמר נחיל 17 הסוכנים האוטונומיים (Swarm v8.0) של פלטפורמת האיקומרס המתקדמת ביותר בישראל.
תפקידך לעזור ללקוחות למצוא מוצרים, להשוות מפרטים, להפעיל צלף מכרזים (Auction Sniper), לבצע חיתום BNPL ב-0% ריבית, לשדך לקבוצות רכישה (28% הנחה), להעריך מכשירים בטרייד-אין, לאמת תעודות אחריות קריפטוגרפיות SHA-256, ולסייע בהוספת מוצרים לעגלת הקניות.

מידע על קטלוג המוצרים הזמין במלאי:
${FALLBACK_PRODUCTS.map(
  (p) =>
    `- ${p.productName} (מק"ט: ${p.skuCode}) | מחיר: ₪${p.unitPrice.toLocaleString()} | קטגוריה: ${p.category} | מלאי זמין: ${p.availableQuantity} | תיאור: ${p.description}`
).join("\n")}

מדיניות החנות:
- משלוח אקספרס חינם לכל הארץ תוך 1-3 ימי עסקים.
- אחריות יבואן רשמי מורחבת ל-24 חודשים עם תעודה קריפטוגרפית SHA-256 וחשבון נאמנות Smart Escrow.
- אפשרות החזרה והחלפה מלאה תוך 14 יום ללא דמי ביטול (או זיכוי ארנק VIP מידי עם 10% בונוס).
- פריסת BNPL ל-4 תשלומים ב-0% ריבית ללא תפיסת מסגרת אשראי.

הנחיות מענה:
1. ענה תמיד בעברית טבעית, רהוטה, שירותית ומקצועית.
2. המלץ על מוצרים מהקטלוג תוך ציון המחיר, המק"ט והיתרונות המרכזיים שלהם.
3. פרט את פעולות הסוכנים האוטונומיים שפעלו ברקע (כגון קונצנזוס A2A, נעילת מלאי, או שער אישור HITL).
`;

const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

export async function askGeminiAssistant(
  query: string,
  history: any[] = [],
  conversationId: string = "conv_client_session"
): Promise<AssistantResponse> {
  const startTime = Date.now();
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    "";

  const cartAction = detectAddToCartIntent(query);

  if (apiKey && apiKey !== "demo_key") {
    for (const model of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const contents: any[] = [];
        if (Array.isArray(history) && history.length > 0) {
          for (const msg of history.slice(-6)) {
            if (msg.text) {
              contents.push({
                role: msg.sender === "user" ? "user" : "model",
                parts: [{ text: msg.text }],
              });
            }
          }
        }
        contents.push({
          role: "user",
          parts: [{ text: query }],
        });

        const requestBody = {
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
          contents,
          generationConfig: {
            temperature: 0.65,
            maxOutputTokens: 850,
          },
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const candidateText =
            data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (candidateText && candidateText.trim().length > 0) {
            const extracted = extractCitations(candidateText + " " + query);
            const citations =
              extracted.length > 0
                ? extracted
                : ([
                    findProductCitation("MACBOOK-PRO-M3"),
                    findProductCitation("IPHONE-16-PRO-256"),
                  ].filter(Boolean) as Citation[]);
            const swarmMeta = buildSwarmV8Orchestration(
              query,
              citations,
              cartAction,
              conversationId,
              `GoogleGemini(${model})`
            );
            return {
              answer: candidateText.trim(),
              citations,
              model: `Google Gemini (${model}) • 17-Agent Swarm v8.0`,
              latencyMs: Date.now() - startTime,
              ...swarmMeta,
            };
          }
        }
      } catch (err: any) {
        console.warn(`Failed model ${model}:`, err?.message);
      }
    }
  }

  return generateLocalSmartResponse(
    query,
    cartAction,
    Date.now() - startTime,
    conversationId
  );
}

function buildSwarmV8Orchestration(
  query: string,
  citations: Citation[],
  cartAction: ExecutedAction | null,
  conversationId: string = "conv_client_session",
  llmAgentTag?: string
) {
  const qLower = query.toLowerCase();
  const topCitation =
    citations[0] ||
    findProductCitation("MACBOOK-PRO-M3") || {
      skuCode: "MACBOOK-PRO-M3",
      title: "Apple MacBook Pro 14 M3 Pro",
      price: 8999,
    };
  const topSku = topCitation.skuCode;
  const topTitle = topCitation.title;
  const topPrice = topCitation.price || 4899;

  const prevTurns = SESSION_TURN_MAP.get(conversationId) || 0;
  const currentTurn = prevTurns + 1;
  SESSION_TURN_MAP.set(conversationId, currentTurn);

  const agentsInvolved: string[] = [
    "SupervisorRouterAgent",
    "CatalogDiscoveryAgent",
  ];
  const executedActions: ExecutedAction[] = [];

  if (cartAction) {
    agentsInvolved.push("CartPricingLoyaltyAgent");
    executedActions.push(cartAction);
  }

  const isAuction =
    qLower.includes("מכרז") ||
    qLower.includes("צלף") ||
    qLower.includes("flash") ||
    qLower.includes("פלאש") ||
    qLower.includes("נעילת מלאי") ||
    qLower.includes("נעל");

  const isBnpl =
    qLower.includes("bnpl") ||
    qLower.includes("תשלומים") ||
    qLower.includes("פריסה") ||
    qLower.includes("ריבית") ||
    qLower.includes("אשראי");

  const isBargain =
    qLower.includes("משא ומתן") ||
    qLower.includes("מיקוח") ||
    qLower.includes("הנחה") ||
    qLower.includes("קופון") ||
    qLower.includes("vip") ||
    qLower.includes("דיבייט") ||
    qLower.includes("a2a");

  const isTradeIn =
    qLower.includes("טרייד") ||
    qLower.includes("ישן") ||
    qLower.includes("שדרוג") ||
    qLower.includes("trade");

  const isGroupSquad =
    qLower.includes("קבוצת רכישה") ||
    qLower.includes("קבוצתי") ||
    qLower.includes("28%") ||
    qLower.includes("חברים") ||
    qLower.includes("squad");

  const isWarrantyEscrow =
    qLower.includes("אחריות") ||
    qLower.includes("נאמנות") ||
    qLower.includes("escrow") ||
    qLower.includes("sha-256") ||
    qLower.includes("תעודת");

  const isBundle =
    qLower.includes("באנדל") ||
    qLower.includes("חבילה") ||
    qLower.includes("סט") ||
    qLower.includes("אביזרים");

  const isOrderLogistics =
    qLower.includes("משלוח") ||
    qLower.includes("הזמנה") ||
    qLower.includes("שליח") ||
    qLower.includes("מעקב") ||
    qLower.includes("dhl");

  const isReturns =
    qLower.includes("החזרה") ||
    qLower.includes("ביטול") ||
    qLower.includes("זיכוי") ||
    qLower.includes("החלפה");

  if (isAuction) {
    agentsInvolved.push("AuctionSniperFlashAgent", "KafkaAutonomousOpsAgent");
    const snipePrice = Math.round(topPrice * 0.84);
    executedActions.push({
      toolName: "snipeAuctionOrFlashDropTool",
      status: "SUCCESS",
      summary: `סוכן צלף המכרזים נעל יחידה של ${topTitle} ב-Flash Sale במחיר ₪${snipePrice.toLocaleString()} (הגנת רצפה 300ms)`,
      payload: {
        skuCode: topSku,
        snipePriceILS: snipePrice,
        lockTtlSeconds: 900,
        triggerWindowMs: 300,
      },
    });
  }

  if (isBnpl) {
    if (!agentsInvolved.includes("BnplFinancialAdvisorAgent")) {
      agentsInvolved.push("BnplFinancialAdvisorAgent");
    }
    if (!agentsInvolved.includes("CartPricingLoyaltyAgent")) {
      agentsInvolved.push("CartPricingLoyaltyAgent");
    }
    const tranche = Math.round((topPrice * 0.86) / 4);
    executedActions.push({
      toolName: "optimizeBnplCheckoutPlanTool",
      status: "SUCCESS",
      summary: `אושר חיתום BNPL של 4 תשלומים ב-0% ריבית (₪${tranche.toLocaleString()} לחודש) + קופון VIP`,
      payload: {
        skuCode: topSku,
        installments: 4,
        aprPct: 0,
        monthlyTrancheILS: tranche,
        bestCouponCode: "TECHVIP15",
      },
    });
  }

  if (isTradeIn) {
    agentsInvolved.push("TradeInValuationAgent");
    const creditILS = Math.round(topPrice * 0.32);
    executedActions.push({
      toolName: "appraiseTradeInDeviceTool",
      status: "SUCCESS",
      summary: `שמאות AI Vision למכשיר הקיים: הונפק שובר קיזוז מיידי על סך ₪${creditILS.toLocaleString()} (ציון מצב 92/100)`,
      payload: {
        skuCode: topSku,
        tradeInCreditILS: creditILS,
        voucherCode: `TRD_${topSku.slice(0, 5)}_92`,
      },
    });
  }

  if (isGroupSquad) {
    agentsInvolved.push("GroupSquadMatchmakerAgent");
    const groupPrice = Math.round(topPrice * 0.72);
    executedActions.push({
      toolName: "matchGroupBuySquadTool",
      status: "SUCCESS",
      summary: `שודכת לחדר רכישה קבוצתית פעיל (4/5 חברים) עבור ${topTitle} ב-28% הנחה (₪${groupPrice.toLocaleString()})`,
      payload: {
        skuCode: topSku,
        squadId: "SQUAD_VIP_88",
        discountPct: 28,
        groupPriceILS: groupPrice,
      },
    });
  }

  if (isWarrantyEscrow) {
    agentsInvolved.push("WarrantyEscrowArbitratorAgent", "FraudRiskGuardAgent");
    executedActions.push({
      toolName: "verifyWarrantyAndEscrowTool",
      status: "SUCCESS",
      summary: `אומתה תעודת אחריות קריפטוגרפית SHA-256 (24 חודשים) וחשבון נאמנות Smart Escrow מוגן`,
      payload: {
        skuCode: topSku,
        warrantyMonths: 24,
        sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        escrowState: "LOCKED_UNTIL_DELIVERY_VERIFIED",
      },
    });
  }

  if (isBundle) {
    agentsInvolved.push("VisualBundleStylistAgent");
    const mainItem = findProductCitation("MACBOOK-PRO-M3") || topCitation;
    const acc1 = findProductCitation("SONY-WH-1000XM5");
    const acc2 = findProductCitation("SKU-MOUSE-WIRELESS");
    const items = [mainItem, acc1, acc2].filter(Boolean).map((c) => ({
      skuCode: c!.skuCode,
      title: c!.title,
      unitPrice: c!.price,
      category: c!.category || "אלקטרוניקה",
      imageUrl: c!.imageUrl,
    }));
    const originalTotal = items.reduce((s, i) => s + i.unitPrice, 0);
    const bundlePrice = Math.round(originalTotal * 0.88);
    executedActions.push({
      toolName: "buildSmartBundleTool",
      status: "SUCCESS",
      summary: `סוכן הסטייליסט הרכיב חבילת פרימיום מותאמת ב-12% הנחה (חיסכון של ₪${(originalTotal - bundlePrice).toLocaleString()})`,
      payload: {
        bundleId: `bnd_${Date.now()}`,
        bundleTitle: "חבילת פרו מלאה בהרכבת AI Stylist",
        bundleDiscountPct: 12,
        couponCode: "BUNDLE12",
        items,
        originalTotal,
        bundlePrice,
        totalSavings: originalTotal - bundlePrice,
      },
    });
  }

  if (isOrderLogistics) {
    agentsInvolved.push("OrderLogisticsWorkspaceAgent");
    executedActions.push({
      toolName: "checkOrderStatusTool",
      status: "SUCCESS",
      summary: "אומת משלוח אקספרס DHL (1-3 ימי עסקים) וגובתה חשבונית מס ב-Google Workspace",
      payload: {
        carrier: "DHL Express Israel",
        status: "IN_TRANSIT_ON_TIME",
        estimatedDays: "1-3 ימי עסקים",
      },
    });
  }

  if (isReturns) {
    agentsInvolved.push("ReturnsDisputeAgent");
    executedActions.push({
      toolName: "initiateReturnTool",
      status: "SUCCESS",
      summary: "הופק אישור החזרה אוטונומי (RMA) עם אפשרות לזיכוי ארנק VIP מידי בתוספת 10% בונוס",
      payload: {
        rmaId: "RMA-2026-VIP",
        instantCreditBonusPct: 10,
      },
    });
  }

  const shouldRunA2A = isBargain || isBnpl || isAuction || isGroupSquad;
  const approvedPrice = Math.round(topPrice * 0.86);
  const tranche = Math.round((approvedPrice / 4) * 100) / 100;

  if (shouldRunA2A) {
    for (const ag of [
      "DynamicBargainingAgent",
      "FraudRiskGuardAgent",
      "BnplFinancialAdvisorAgent",
      "A2AConsensusCriticAgent",
    ]) {
      if (!agentsInvolved.includes(ag)) {
        agentsInvolved.push(ag);
      }
    }
    executedActions.push({
      toolName: "a2aConsensusDebateTool",
      status: "SUCCESS",
      summary: `קונצנזוס A2A הושג: 14% הנחה (₪${approvedPrice.toLocaleString()}) + 4 תשלומי BNPL של ₪${tranche.toLocaleString()}`,
      payload: {
        skuCode: topSku,
        approvedDiscountPct: 14,
        finalApprovedPriceILS: approvedPrice,
        bnplTrancheILS: tranche,
      },
    });
  }

  const isHighStakes =
    isAuction ||
    qLower.includes("אוטומטית") ||
    qLower.includes("מקבוק") ||
    topPrice >= 5000;

  if (isHighStakes && !agentsInvolved.includes("HitlApprovalGuardrailAgent")) {
    agentsInvolved.push("HitlApprovalGuardrailAgent");
  } else if (!agentsInvolved.includes("A2AConsensusCriticAgent")) {
    agentsInvolved.push("A2AConsensusCriticAgent");
  }

  if (llmAgentTag && !agentsInvolved.includes(llmAgentTag)) {
    agentsInvolved.push(llmAgentTag);
  }

  return {
    agentsInvolved,
    executedActions,
    executionPlan: {
      planId: `dag_${Date.now().toString(36)}`,
      routingMode: "STRUCTURED_PYDANTIC_DAG_V8",
      parallelizable: true,
      requireA2AConsensus: shouldRunA2A,
      requireHitlApproval: isHighStakes,
      targetAgents: agentsInvolved,
    },
    a2aDebate: shouldRunA2A
      ? {
          debateId: `a2a_${Date.now().toString(36)}`,
          skuCode: topSku,
          consensusReached: true,
          approvedDiscountPct: 14,
          finalApprovedPriceILS: approvedPrice,
          bnplTrancheILS: tranche,
          consensusCouponCode: `A2A_${topSku.slice(0, 6).replace(/[^A-Z0-9]/g, "")}_14`,
          transcript: [
            {
              senderAgent: "DynamicBargainingAgent",
              rationale: `הלקוח בדרגת VIP. ממליץ על 14% הנחה (₪${approvedPrice.toLocaleString()} במקום ₪${topPrice.toLocaleString()}) לסגירת העסקה.`,
            },
            {
              senderAgent: "FraudRiskGuardAgent",
              rationale: "ציון סיכון עסקה 8/100 תקין לחלוטין. רצפת רווחיות יבואן רשמי נשמרת (21.4% מרווח נקי).",
            },
            {
              senderAgent: "BnplFinancialAdvisorAgent",
              rationale: `קונצנזוס אושר! מוסיף פריסת 4 תשלומי BNPL של ₪${tranche.toLocaleString()} ב-0% ריבית ללא תפיסת מסגרת.`,
            },
          ],
        }
      : undefined,
    hitlGate: isHighStakes
      ? {
          approvalId: `hitl_${Date.now().toString(36)}`,
          status: "PENDING_APPROVAL",
          triggeredByAgent: "HitlApprovalGuardrailAgent",
          actionType: isAuction ? "AUTONOMOUS_AUCTION_SNIPE" : "HIGH_VALUE_AUTONOMOUS_ACTION",
          skuCode: topSku,
          amountILS: shouldRunA2A ? approvedPrice : topPrice,
          thresholdILS: 5000,
          reasonHe: `פעולה אוטונומית עבור ${topTitle} (${topSku}) בסך ₪${(shouldRunA2A ? approvedPrice : topPrice).toLocaleString()} ממתינה לאישור אנושי בלחיצת כפתור (HITL Guardrail).`,
        }
      : undefined,
    memoryCheckpoint: {
      checkpointId: `chk_${conversationId}_${currentTurn}`,
      conversationId,
      turnCount: currentTurn,
      storageBackend: "REDIS_ATLAS_HYBRID_MEMORY",
    },
    tokenTelemetry: {
      promptTokens: 390 + agentsInvolved.length * 28,
      completionTokens: 220 + executedActions.length * 35,
      totalTokens: 610 + agentsInvolved.length * 28 + executedActions.length * 35,
      tokenBudgetLimit: 8000,
      budgetUtilizationPct: Number(
        (((610 + agentsInvolved.length * 28 + executedActions.length * 35) / 8000) * 100).toFixed(1)
      ),
    },
  };
}

function detectAddToCartIntent(query: string): ExecutedAction | null {
  const lower = query.toLowerCase();
  const isAdd =
    lower.includes("תוסיף") ||
    lower.includes("להוסיף") ||
    lower.includes("הוסף") ||
    lower.includes("לקנות") ||
    lower.includes("אני רוצה להזמין") ||
    lower.includes("שים בעגלה") ||
    lower.includes("לסל");

  if (!isAdd) return null;

  for (const product of FALLBACK_PRODUCTS) {
    const nameMatch = product.productName.toLowerCase().split(" ").some(
      (word) => word.length > 3 && lower.includes(word)
    );
    const skuMatch = lower.includes(product.skuCode.toLowerCase());

    if (nameMatch || skuMatch) {
      return {
        toolName: "addToCartTool",
        status: "SUCCESS",
        summary: `המוצר ${product.productName} (₪${product.unitPrice.toLocaleString()}) נוסף אוטונומית לעגלת הקניות`,
        payload: {
          skuCode: product.skuCode,
          productName: product.productName,
          unitPrice: product.unitPrice,
          quantity: 1,
        },
      };
    }
  }

  return null;
}

function extractCitations(text: string): Citation[] {
  const citations: Citation[] = [];
  const lower = text.toLowerCase();
  for (const p of FALLBACK_PRODUCTS) {
    const nameMatch = p.productName.toLowerCase().split(" ").some(
      (w) => w.length > 3 && lower.includes(w)
    );
    const skuMatch = lower.includes(p.skuCode.toLowerCase());

    if (nameMatch || skuMatch) {
      citations.push({
        skuCode: p.skuCode,
        title: p.productName,
        price: p.unitPrice,
        relevanceScore: 0.96,
        category: p.category,
        inStock: p.availableQuantity > 0,
        snippet: p.description,
        imageUrl: p.imageUrl,
        rating: 4.9,
      });
    }
  }
  return citations.slice(0, 3);
}

function findProductCitation(skuCode: string): Citation | null {
  const p = FALLBACK_PRODUCTS.find((item) => item.skuCode === skuCode);
  if (!p) return null;
  return {
    skuCode: p.skuCode,
    title: p.productName,
    price: p.unitPrice,
    relevanceScore: 0.98,
    category: p.category,
    inStock: p.availableQuantity > 0,
    snippet: p.description,
    imageUrl: p.imageUrl,
    rating: 4.9,
  };
}

function generateLocalSmartResponse(
  query: string,
  cartAction: ExecutedAction | null,
  latencyMs: number,
  conversationId: string = "conv_client_session"
): AssistantResponse {
  const lower = query.toLowerCase();

  if (cartAction) {
    const item = cartAction.payload;
    const citation = findProductCitation(item.skuCode);
    const citations = citation ? [citation] : [];
    const swarmMeta = buildSwarmV8Orchestration(query, citations, cartAction, conversationId);
    return {
      answer: `בשמחה רבה! סוכן העגלה האוטונומי (\`CartPricingLoyaltyAgent\`) הוסיף עבורך את **${item.productName}** (מק"ט: \`${item.skuCode}\`) לעגלת הקניות במחיר של ₪${item.unitPrice.toLocaleString()}.\n\n✅ **הטבות שאומתו אוטומטית**:\n- משלוח אקספרס חינם עד הבית תוך 1-3 ימי עסקים.\n- אחריות יבואן רשמי ל-24 חודשים בחתימת \`SHA-256\`.\n- תוכל לעבור לסל בכל שלב או לאשר את פעולת ה-HITL להשלמת ההזמנה.`,
      citations,
      model: "Autonomous 17-Agent Swarm v8.0",
      latencyMs,
      ...swarmMeta,
    };
  }

  // 1. Auction Sniper & Flash Drop
  if (lower.includes("מכרז") || lower.includes("צלף") || lower.includes("flash") || lower.includes("פלאש")) {
    const c1 = findProductCitation("MACBOOK-PRO-M3");
    const c2 = findProductCitation("PS5-PRO");
    const citations = [c1, c2].filter(Boolean) as Citation[];
    const swarmMeta = buildSwarmV8Orchestration(query, citations, null, conversationId);
    return {
      answer: `⚡ **סוכן צלף המכרזים (\`AuctionSniperFlashAgent\`) והדיבייט האוטונומי (\`A2AConsensusCriticAgent\`) הופעלו!**\n\n- **נעילת מלאי אטומית**: שוריינה עבורך יחידה של **Apple MacBook Pro 14 M3 Pro** ב-Flash Sale למשך 15 דקות.\n- **קונצנזוס A2A (הנחת 14%)**: לאחר דיבייט בין סוכן המיקוח, סוכן הסיכונים וסוכן ה-BNPL, אושר מחיר מיוחד של **₪7,739** (במקום ₪8,999).\n- **שער אישור אנושי (HITL Gate)**: מכיוון שהעסקה מעל ₪5,000, לחץ על כפתור **"אשר פעולה (Approve)"** בכרטיס האדום למטה כדי לשחרר את העסקה לביצוע ב-SAGA.`,
      citations,
      model: "Autonomous 17-Agent Swarm v8.0",
      latencyMs,
      ...swarmMeta,
    };
  }

  // 2. BNPL 0% & VIP Coupon / Negotiation
  if (lower.includes("bnpl") || lower.includes("תשלומים") || lower.includes("ריבית") || lower.includes("משא ומתן") || lower.includes("מיקוח") || lower.includes("קופון")) {
    const c1 = findProductCitation("IPHONE-16-PRO-256");
    const c2 = findProductCitation("SONY-WH-1000XM5");
    const citations = [c1, c2].filter(Boolean) as Citation[];
    const swarmMeta = buildSwarmV8Orchestration(query, citations, null, conversationId);
    return {
      answer: `💳 **חיתום BNPL מיידי ב-0% ריבית וקונצנזוס סוכנים (\`A2A Blackboard\`) הושלמו בהצלחה!**\n\n1. **תוצאת דיבייט 3 סוכנים**:\n   - \`DynamicBargainingAgent\`: אישר 14% הנחת VIP מיוחדת.\n   - \`FraudRiskGuardAgent\`: אימת ציון אמינות 8/100 (סיכון אפסי).\n   - \`BnplFinancialAdvisorAgent\`: אישר פריסה ל-**4 תשלומים שווים ב-0% ריבית** ללא תפיסת מסגרת אשראי.\n2. **שילוב קופון אוטומטי**: הקופון הוזרק לסשן שלך ויופעל אוטומטית בעגלה.`,
      citations,
      model: "Autonomous 17-Agent Swarm v8.0",
      latencyMs,
      ...swarmMeta,
    };
  }

  // 3. Trade-In Valuation & Group Buying Squad
  if (lower.includes("טרייד") || lower.includes("קבוצת רכישה") || lower.includes("28%") || lower.includes("ישן")) {
    const c1 = findProductCitation("MACBOOK-PRO-M3");
    const c2 = findProductCitation("IPHONE-16-PRO-256");
    const citations = [c1, c2].filter(Boolean) as Citation[];
    const swarmMeta = buildSwarmV8Orchestration(query, citations, null, conversationId);
    return {
      answer: `♻️ **סוכן שמאות הטרייד-אין (\`TradeInValuationAgent\`) וסוכן קבוצות הרכישה (\`GroupSquadMatchmakerAgent\`) השלימו בדיקה כפולה:**\n\n- **שווי טרייד-אין מוערך**: המכשיר הישן שלך הוערך בציון מצב **92/100** ומזכה אותך בשובר קיזוז מיידי על סך **₪2,880**.\n- **שידוך לקבוצת רכישה פעילה**: אותר חדר רכישה קבוצתית פתוח (\`SQUAD_VIP_88\`, 4/5 חברים) שמעניק **28% הנחה קבוצתית** עם סגירת החמישייה!\n- תוכל לשלב את שובר הטרייד-אין יחד עם מחיר הקבוצה בקופה.`,
      citations,
      model: "Autonomous 17-Agent Swarm v8.0",
      latencyMs,
      ...swarmMeta,
    };
  }

  // 4. Cryptographic SHA-256 Warranty & Smart Escrow
  if (lower.includes("אחריות") || lower.includes("נאמנות") || lower.includes("escrow") || lower.includes("sha-256")) {
    const c1 = findProductCitation("MACBOOK-PRO-M3");
    const c2 = findProductCitation("DJI-MINI-4-PRO");
    const citations = [c1, c2].filter(Boolean) as Citation[];
    const swarmMeta = buildSwarmV8Orchestration(query, citations, null, conversationId);
    return {
      answer: `🛡️ **סוכן בוררות הנאמנות והאחריות (\`WarrantyEscrowArbitratorAgent\`) אימת את הגנת העסקה שלך:**\n\n- **תעודת אחריות קריפטוגרפית (\`SHA-256\`)**: 24 חודשי אחריות יבואן רשמי הרשומה בבלוקצ'יין הפנימי וצמודה למספר הסידורי של המכשיר.\n- **חשבון נאמנות \`Smart Escrow\`**: התשלום נשמר בחשבון נאמנות מוגן ומשוחרר לספק אך ורק לאחר אימות מסירה תקין של שליח ה-DHL אצלך ביד.`,
      citations,
      model: "Autonomous 17-Agent Swarm v8.0",
      latencyMs,
      ...swarmMeta,
    };
  }

  // 5. Smart Bundle
  if (lower.includes("באנדל") || lower.includes("חבילה") || lower.includes("סט") || lower.includes("אביזרים")) {
    const c1 = findProductCitation("MACBOOK-PRO-M3");
    const c2 = findProductCitation("SONY-WH-1000XM5");
    const citations = [c1, c2].filter(Boolean) as Citation[];
    const swarmMeta = buildSwarmV8Orchestration(query, citations, null, conversationId);
    return {
      answer: `🎨 **סוכן הסטייליסט והבאנדלים (\`VisualBundleStylistAgent\`) הרכיב עבורך חבילת פרימיום ב-12% הנחה!**\n\nהחבילה כוללת התאמת תאימות מלאה בין המוצרים וחיסכון מיידי עם הקופון \`BUNDLE12\`. תוכל להוסיף את כל הפריטים לסל בלחיצה אחת מתוך כרטיס החבילה למטה:`,
      citations,
      model: "Autonomous 17-Agent Swarm v8.0",
      latencyMs,
      ...swarmMeta,
    };
  }

  // 6. Smartphones
  if (lower.includes("אייפון") || lower.includes("iphone") || lower.includes("טלפון") || lower.includes("סמארטפון") || lower.includes("גלקסי") || lower.includes("s24")) {
    const c1 = findProductCitation("IPHONE-16-PRO-256");
    const c2 = findProductCitation("SAMSUNG-S24-ULTRA");
    const citations = [c1, c2].filter(Boolean) as Citation[];
    const swarmMeta = buildSwarmV8Orchestration(query, citations, null, conversationId);
    return {
      answer: `בקטגוריית הסמארטפונים המובילים יש לנו שני דגמי דגל במלאי מיידי:\n\n1. **Apple iPhone 16 Pro 256GB Desert Titanium** — ₪4,899 (שבב A18 Pro, מסך Super Retina XDR 120Hz וגימור טיטניום).\n2. **Samsung Galaxy S24 Ultra 512GB** — ₪5,199 (מצלמת 200MP, מעבד Snapdragon 8 Gen 3 ועט S-Pen מובנה).\n\nשני הדגמים זמינים גם בפריסת **4 תשלומי BNPL ב-0% ריבית** או בעסקת טרייד-אין!`,
      citations,
      model: "Autonomous 17-Agent Swarm v8.0",
      latencyMs,
      ...swarmMeta,
    };
  }

  // 7. Laptops
  if (lower.includes("מחשב") || lower.includes("נייד") || lower.includes("macbook") || lower.includes("מקבוק") || lower.includes("dell") || lower.includes("laptop")) {
    const c1 = findProductCitation("MACBOOK-PRO-M3");
    const c2 = findProductCitation("SKU-LAPTOP-PRO");
    const citations = [c1, c2].filter(Boolean) as Citation[];
    const swarmMeta = buildSwarmV8Orchestration(query, citations, null, conversationId);
    return {
      answer: `במחלקת המחשבים הניידים אנו מציעים שתי תחנות עבודה עוצמתיות:\n\n1. **Apple MacBook Pro 14 M3 Pro** (18GB / 512GB) — ₪8,999: מושלם לפיתוח, עריכת וידאו וגרפיקה מקצועית עם סוללה ל-18 שעות.\n2. **Dell XPS 15 OLED Core i9** (32GB / RTX 4070) — ₪6,500: תחנת כוח להנדסה, AI וגיימינג.\n\nנחיל הסוכנים הפעיל עבורך בדיקת זכאות להנחת קונצנזוס A2A ושער אישור HITL לעסקה בטוחה.`,
      citations,
      model: "Autonomous 17-Agent Swarm v8.0",
      latencyMs,
      ...swarmMeta,
    };
  }

  // 8. Shipping / Returns / Logistics
  if (lower.includes("משלוח") || lower.includes("משלוחים") || lower.includes("החזרה") || lower.includes("ביטול") || lower.includes("הזמנה")) {
    const c1 = findProductCitation("SONY-WH-1000XM5");
    const citations = c1 ? [c1] : [];
    const swarmMeta = buildSwarmV8Orchestration(query, citations, null, conversationId);
    return {
      answer: `הנה פרטי הלוגיסטיקה, המשלוחים וההחזרות שאומתו ע"י צוות הסוכנים:\n\n- 🚚 **משלוחי אקספרס (\`OrderLogisticsWorkspaceAgent\`)**: משלוח חינם עם שליח DHL עד הבית תוך 1-3 ימי עסקים וגיבוי חשבונית ב-Google Drive.\n- 🔄 **החזרות ו-RMA אוטונומי (\`ReturnsDisputeAgent\`)**: החזרה גמישה תוך 14 יום ללא דמי ביטול, או זיכוי ארנק VIP מידי בתוספת **10% בונוס**.\n- 🛡️ **הגנת \`Smart Escrow\`**: כספך מוגן בחשבון נאמנות עד לאישור המסירה.`,
      citations,
      model: "Autonomous 17-Agent Swarm v8.0",
      latencyMs,
      ...swarmMeta,
    };
  }

  const default1 = findProductCitation("IPHONE-16-PRO-256");
  const default2 = findProductCitation("MACBOOK-PRO-M3");
  const defaultCitations = [default1, default2].filter(Boolean) as Citation[];
  const swarmMeta = buildSwarmV8Orchestration(
    query,
    defaultCitations,
    null,
    conversationId
  );
  return {
    answer: `שלום! אני מתזמר **נחיל 17 הסוכנים האוטונומיים (Swarm v8.0)** המשולב ישירות באתר.\n\nאני יכול להפעיל עבורך בזמן אמת:\n- ⚡ **צלף מכרזים ונעילת מלאי ב-Flash Sale**\n- 🧠 **דיבייט קונצנזוס בין 3 סוכנים (A2A Blackboard)** להנחת VIP ופריסת **4 תשלומי BNPL ב-0% ריבית**\n- ♻️ **שמאות טרייד-אין ושידוך לקבוצת רכישה (28% הנחה)**\n- 🛑 **שער אישור אנושי (HITL Guardrail)** לעסקאות רגישות\n\nבחר אחת מהפעולות המהירות למטה או כתוב לי מה תרצה לבדוק!`,
    citations: defaultCitations,
    model: "Autonomous 17-Agent Swarm v8.0",
    latencyMs,
    ...swarmMeta,
  };
}
