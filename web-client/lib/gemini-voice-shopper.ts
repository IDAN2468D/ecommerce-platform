import { FALLBACK_PRODUCTS, CatalogProduct } from "./fallback-catalog";

export interface VoiceActionResult {
  actionType: "VOICE_ADD_TO_CART" | "VOICE_SEARCH_RECOMMEND" | "NAVIGATE_CHECKOUT" | "CLEAR_CART" | "SHOW_DETAILS";
  skuCode?: string;
  productName?: string;
  price?: number;
  quantity?: number;
  targetUrl?: string;
  spokenText: string;
  matchedProduct?: CatalogProduct;
}

export function processVoiceShoppingQuery(
  transcript: string,
  cart: Array<{ skuCode: string; quantity: number }> = []
): VoiceActionResult {
  const t = (transcript || "").trim().toLowerCase();

  const isCheckout = /תשלום|לשלם|קופה|לסיים|checkout|pay/i.test(t);
  const isClear = /תנקה|לנקות|תמחק|רוקן|clear/i.test(t);
  const isAdd = /תוסיף|שים|להוסיף|קנה|רוצה לקנות|add|buy/i.test(t);

  if (isCheckout) {
    return {
      actionType: "NAVIGATE_CHECKOUT",
      targetUrl: "/cart",
      spokenText: "מעבירה אותך עכשיו לעגלת הקניות ולתשלום המאובטח. כל הפריטים שלך מחכים לך!",
    };
  }

  if (isClear) {
    return {
      actionType: "CLEAR_CART",
      spokenText: "רוקנתי עבורך את עגלת הקניות. במה תרצה שנתמקד עכשיו?",
    };
  }

  // Find best matching product in catalog
  let matched: CatalogProduct | undefined;

  if (/מקבוק|macbook|לפטופ|מחשב נייד/i.test(t)) {
    matched = FALLBACK_PRODUCTS.find((p) => p.skuCode === "MACBOOK-PRO-M3") || FALLBACK_PRODUCTS[1];
  } else if (/סוני|אוזניות|headphones|ביטול רעשים/i.test(t)) {
    matched = FALLBACK_PRODUCTS.find((p) => p.skuCode === "SONY-WH-1000XM5") || FALLBACK_PRODUCTS[2];
  } else if (/אייפון|iphone|פלאפון|טלפון/i.test(t)) {
    matched = FALLBACK_PRODUCTS.find((p) => p.skuCode === "IPHONE-16-PRO-256") || FALLBACK_PRODUCTS[0];
  } else if (/דל|dell|xps/i.test(t)) {
    matched = FALLBACK_PRODUCTS.find((p) => p.skuCode === "DELL-XPS-15") || FALLBACK_PRODUCTS[3];
  } else if (/שעון|watch|אפל ווטש/i.test(t)) {
    matched = FALLBACK_PRODUCTS.find((p) => p.category === "WATCHES") || FALLBACK_PRODUCTS[4];
  } else {
    // Keyword match across all products
    const words = t.split(/\s+/).filter((w) => w.length > 2);
    matched = FALLBACK_PRODUCTS.find((p) =>
      words.some(
        (w) =>
          p.productName.toLowerCase().includes(w) ||
          p.description.toLowerCase().includes(w) ||
          p.category.toLowerCase().includes(w)
      )
    ) || FALLBACK_PRODUCTS[0];
  }

  if (isAdd && matched) {
    return {
      actionType: "VOICE_ADD_TO_CART",
      skuCode: matched.skuCode,
      productName: matched.productName,
      price: matched.unitPrice,
      quantity: 1,
      matchedProduct: matched,
      spokenText: `בשמחה! הוספתי את ${matched.productName} לעגלת הקניות שלך במחיר ₪${matched.unitPrice.toLocaleString()}. תרצה עוד מוצר או לעבור לתשלום?`,
    };
  }

  if (matched) {
    return {
      actionType: "VOICE_SEARCH_RECOMMEND",
      skuCode: matched.skuCode,
      productName: matched.productName,
      price: matched.unitPrice,
      matchedProduct: matched,
      spokenText: `מצאתי עבורך את ${matched.productName} במלאי עם משלוח אקספרס חינם במחיר ₪${matched.unitPrice.toLocaleString()}. לומר לך להוסיף אותו לסל?`,
    };
  }

  return {
    actionType: "SHOW_DETAILS",
    spokenText: "לא הצלחתי לזהות בדיוק את המוצר, אבל יש לנו מבחר ענק של מחשבים, סמארטפונים ואוזניות. מה תרצה לחפש?",
  };
}
