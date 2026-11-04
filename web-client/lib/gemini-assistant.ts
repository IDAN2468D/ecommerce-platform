import { FALLBACK_PRODUCTS } from "./fallback-catalog";

export interface ExecutedAction {
  toolName: string;
  status: "SUCCESS" | "FAILED";
  payload?: any;
}

export interface AssistantResponse {
  answer: string;
  citations: string[];
  executedActions: ExecutedAction[];
  agentsInvolved: string[];
  model: string;
  latencyMs: number;
}

const SYSTEM_INSTRUCTION = `
אתה עוזר ה-AI החכם וסוכן הקניות האישי של פלטפורמת האיקומרס המתקדמת ביותר בישראל.
תפקידך לעזור ללקוחות למצוא מוצרים, להשוות מפרטים, להמליץ על התאמות אישיות, לענות על שאלות בנושאי משלוחים, אחריות ומבצעים, ולסייע בהוספת מוצרים לעגלת הקניות.

מידע על קטלוג המוצרים הזמין במלאי:
${FALLBACK_PRODUCTS.map(
  (p) =>
    `- ${p.productName} (מק"ט: ${p.skuCode}) | מחיר: ₪${p.unitPrice.toLocaleString()} | קטגוריה: ${p.category} | מלאי זמין: ${p.availableQuantity} | תיאור: ${p.description}`
).join("\n")}

מדיניות החנות:
- משלוח אקספרס חינם לכל הארץ תוך 1-3 ימי עסקים.
- אחריות יבואן רשמי מורחבת ל-24 חודשים על כל המוצרים.
- אפשרות החזרה והחלפה מלאה תוך 14 יום ללא דמי ביטול.
- תשלום מאובטח ב-SSL, Apple Pay, Google Pay וכרטיסי אשראי.

הנחיות מענה:
1. ענה תמיד בעברית טבעית, רהוטה, שירותית ואדיבה.
2. המלץ על מוצרים מהקטלוג תוך ציון המחיר והיתרונות המרכזיים שלהם.
3. אם הלקוח שואל על השוואה בין מוצרים, הצג יתרונות וחסרונות ברורים.
4. אם הלקוח מבקש במפורש להוסיף מוצר לעגלה (למשל "תוסיף לי אייפון לעגלה", "שים לי מקבוק בסל"), אשר את ההוספה בצורה שמחה וציין את שם המוצר והמק"ט שלו.
`;

const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-3.8-flash",
];

export async function askGeminiAssistant(
  query: string,
  history: any[] = []
): Promise<AssistantResponse> {
  const startTime = Date.now();
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    "";

  // Check if user wants to add to cart
  const cartAction = detectAddToCartIntent(query);

  if (apiKey && apiKey !== "demo_key") {
    for (const model of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // Build conversation contents
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
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

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
            const citations = extractCitations(candidateText);
            return {
              answer: candidateText.trim(),
              citations,
              executedActions: cartAction ? [cartAction] : [],
              agentsInvolved: [
                "SupervisorRouterAgent",
                "CatalogDiscoveryAgent",
                `GoogleGemini(${model})`,
              ],
              model: `Google Gemini (${model})`,
              latencyMs: Date.now() - startTime,
            };
          }
        }
      } catch (err: any) {
        console.warn(`Failed model ${model}:`, err?.message);
      }
    }
  }

  // Smart Offline/Local Rule-Based Fallback
  return generateLocalSmartResponse(query, cartAction, Date.now() - startTime);
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

function extractCitations(text: string): string[] {
  const citations: string[] = [];
  for (const p of FALLBACK_PRODUCTS) {
    if (text.includes(p.skuCode) || text.includes(p.productName)) {
      citations.push(`${p.productName} — ₪${p.unitPrice.toLocaleString()}`);
    }
  }
  return citations.slice(0, 3);
}

function generateLocalSmartResponse(
  query: string,
  cartAction: ExecutedAction | null,
  latencyMs: number
): AssistantResponse {
  const lower = query.toLowerCase();

  if (cartAction) {
    const item = cartAction.payload;
    return {
      answer: `בשמחה רבה! הוספתי עבורך את **${item.productName}** (מק"ט: \`${item.skuCode}\`) לעגלת הקניות במחיר של ₪${item.unitPrice.toLocaleString()}.\n\nהמשלוח חינם לכל הארץ תוך 1-3 ימי עסקים! תוכל לעבור לעגלה בכל שלב להשלמת ההזמנה.`,
      citations: [`${item.productName} — ₪${item.unitPrice.toLocaleString()}`],
      executedActions: [cartAction],
      agentsInvolved: ["CartManagerAgent", "CatalogDiscoveryAgent"],
      model: "Local AI Fallback Agent",
      latencyMs,
    };
  }

  if (lower.includes("אייפון") || lower.includes("iphone") || lower.includes("טלפון") || lower.includes("סמארטפון") || lower.includes("גלקסי") || lower.includes("s24")) {
    return {
      answer: `בקטגוריית הסמארטפונים המובילים יש לנו שני דגמי דגל מדהימים:\n\n1. **Apple iPhone 16 Pro 256GB Desert Titanium** — ₪4,899 (שבב A18 Pro, מסך Super Retina XDR 120Hz וגימור טיטניום יוקרתי).\n2. **Samsung Galaxy S24 Ultra 512GB** — ₪5,199 (מצלמת 200MP, מעבד Snapdragon 8 Gen 3 ועט S-Pen מובנה).\n\nאיזה מהם מעניין אותך יותר? אוכל להוסיף אותו לעגלה עבורך מיד!`,
      citations: [
        "Apple iPhone 16 Pro 256GB — ₪4,899",
        "Samsung Galaxy S24 Ultra 512GB — ₪5,199",
      ],
      executedActions: [],
      agentsInvolved: ["CatalogDiscoveryAgent"],
      model: "Local AI Fallback Agent",
      latencyMs,
    };
  }

  if (lower.includes("מחשב") || lower.includes("נייד") || lower.includes("macbook") || lower.includes("dell") || lower.includes("laptop")) {
    return {
      answer: `במחלקת המחשבים הניידים אנו מציעים שתי תחנות עבודה עוצמתיות:\n\n1. **Apple MacBook Pro 14 M3 Pro** (18GB / 512GB) — ₪8,999: מושלם לעריכת וידאו, פיתוח וגרפיקה מקצועית עם זמן סוללה אגדי.\n2. **Dell XPS 15 OLED Core i9** (32GB / RTX 4070) — ₪6,500: מעולה לגיימינג, חישובים הנדסיים ומולטימדיה.\n\nרוצה שאשווה ביניהם עבור שימוש מסוים?`,
      citations: [
        "Apple MacBook Pro 14 M3 Pro — ₪8,999",
        "Dell XPS 15 OLED Core i9 — ₪6,500",
      ],
      executedActions: [],
      agentsInvolved: ["CatalogDiscoveryAgent"],
      model: "Local AI Fallback Agent",
      latencyMs,
    };
  }

  if (lower.includes("משלוח") || lower.includes("משלוחים") || lower.includes("אחריות") || lower.includes("החזרה") || lower.includes("ביטול")) {
    return {
      answer: `הנה כל המידע על השירות והמשלוחים שלנו:\n\n🚚 **משלוחים**: משלוח אקספרס חינם עם שליח עד דלת הבית לכל הארץ תוך 1-3 ימי עסקים בלבד.\n🛡️ **אחריות**: 24 חודשי אחריות יבואן רשמי מורחבת על כל מוצרי החנות.\n🔄 **החזרות**: מדיניות החזרה גמישה עד 14 יום מקבלת המוצר באריזתו המקורית ללא דמי ביטול.`,
      citations: [],
      executedActions: [],
      agentsInvolved: ["CustomerSupportAgent"],
      model: "Local AI Fallback Agent",
      latencyMs,
    };
  }

  return {
    answer: `שלום! אני עוזר ה-AI האישי שלך בחנות. יש לנו מגוון מוצרי אלקטרוניקה מתקדמים, כולל **iPhone 16 Pro**, **MacBook Pro M3**, **PlayStation 5 Pro**, **Sony WH-1000XM5**, **רחפן DJI Mini 4 Pro** ועוד.\n\nתוכל לשאול אותי כל שאלה על מפרט, מחיר, זמינות במלאי או פשוט לבקש: *"תוסיף לי מקבוק לעגלה"*!`,
    citations: ["Apple iPhone 16 Pro — ₪4,899", "PlayStation 5 Pro — ₪3,399"],
    executedActions: [],
    agentsInvolved: ["SupervisorRouterAgent"],
    model: "Local AI Fallback Agent",
    latencyMs,
  };
}
