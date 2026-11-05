import { FALLBACK_PRODUCTS } from "./fallback-catalog";

export interface NegotiationResult {
  decision: "ACCEPTED" | "COUNTER_OFFER" | "REJECTED_COUNTER";
  agreedPrice: number;
  originalPrice: number;
  discountPercent: number;
  discountAmount: number;
  couponCode: string;
  message: string;
  round: number;
}

export function negotiateProductPrice(
  skuCode: string,
  userOffer: number,
  round: number = 1
): NegotiationResult {
  const product = FALLBACK_PRODUCTS.find((p) => p.skuCode === skuCode) || {
    skuCode,
    productName: "מוצר פרימיום",
    unitPrice: 5000,
  };

  const originalPrice = product.unitPrice;
  const offer = Math.max(0, Number(userOffer) || 0);

  // Profit margin constraints
  const floorPrice = Math.round(originalPrice * 0.84); // max 16% discount
  const safeRandomId = Math.random().toString(36).substring(2, 6).toUpperCase();
  const cleanSku = skuCode.replace(/[^A-Za-z0-9]/g, "").slice(0, 6);

  // 1. User offered very reasonable price (within 8% discount)
  if (offer >= originalPrice * 0.92) {
    const agreedPrice = Math.round(offer);
    const discountAmount = originalPrice - agreedPrice;
    const discountPercent = Math.max(5, Math.round((discountAmount / originalPrice) * 100));
    const couponCode = `DEAL_${cleanSku}_${discountPercent}_${safeRandomId}`;

    return {
      decision: "ACCEPTED",
      agreedPrice,
      originalPrice,
      discountPercent,
      discountAmount,
      couponCode,
      message: `יש לנו עסקה! קיבלתי את הצעתך ל-₪${agreedPrice.toLocaleString()}. הנפקתי עבורך קופון בלעדי "${couponCode}" שמעניק ${discountPercent}% הנחה בעגלה!`,
      round,
    };
  }

  // 2. User offered realistic price above floor or it's round 2+
  if (offer >= floorPrice || round >= 2) {
    const counterPrice = Math.round(originalPrice * 0.88); // 12% discount
    const discountAmount = originalPrice - counterPrice;
    const discountPercent = 12;
    const couponCode = `DEAL_${cleanSku}_12_${safeRandomId}`;

    return {
      decision: "COUNTER_OFFER",
      agreedPrice: counterPrice,
      originalPrice,
      discountPercent,
      discountAmount,
      couponCode,
      message: `ההצעה שלך ל-₪${offer.toLocaleString()} קצת מאתגרת את מרווח היבואן, אבל בתור לקוח VIP אני יכול לבוא לקראתך ב-₪${counterPrice.toLocaleString()} (חיסכון של ₪${discountAmount.toLocaleString()}) עם קופון אישי "${couponCode}". מה דעתך?`,
      round,
    };
  }

  // 3. User offered very low price (lowball)
  const counterPrice = Math.round(originalPrice * 0.90); // 10% discount
  const discountAmount = originalPrice - counterPrice;
  const discountPercent = 10;
  const couponCode = `DEAL_${cleanSku}_10_${safeRandomId}`;

  return {
    decision: "REJECTED_COUNTER",
    agreedPrice: counterPrice,
    originalPrice,
    discountPercent,
    discountAmount,
    couponCode,
    message: `הלוואי ויכולתי לאשר ₪${offer.toLocaleString()}, אך זה נמוך ממחיר העלות של היבואן הרשמי. המחיר הכי חם שאוכל לאשר לך הוא ₪${counterPrice.toLocaleString()} (10% הנחה בלעדית בקופון "${couponCode}"). רוצה לסגור על זה?`,
    round,
  };
}
