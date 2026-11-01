/**
 * Centralized API Client for Storefront
 * Communicates with Next.js API Routes and API Gateway
 */

export interface ProductDto {
  skuCode: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock?: {
    availableQuantity: number;
    reservedQuantity: number;
  };
}

export interface LoyaltyWalletDto {
  customerId: string;
  pointsBalance: number;
  lifetimePointsEarned: number;
  tier: string;
  cashbackRatePercent: number;
  transactions?: Array<{
    txId: string;
    orderId?: string | null;
    type: string;
    points: number;
    orderAmount?: number;
    description: string;
    timestamp: string;
  }>;
}

export interface RagResponseDto {
  query: string;
  answer: string;
  citations: Array<{
    skuCode: string;
    title: string;
    price: number;
    relevanceScore?: number;
    category?: string;
    inStock?: boolean;
    snippet?: string;
  }>;
  confidenceScore: number;
  model: string;
  latencyMs: number;
}

export const ApiClient = {
  async getProducts(category?: string): Promise<ProductDto[]> {
    const query = category && category !== "הכל" && category !== "ALL"
      ? `?category=${encodeURIComponent(category)}`
      : "";
    const res = await fetch(`/api/products${query}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load catalog products");
    const data = await res.json();
    return Array.isArray(data)
      ? data.map((item: any) => ({
          skuCode: item.skuCode,
          name: item.productName || item.name,
          price: Number(item.unitPrice || item.price),
          description: item.description || "מוצר איכותי מקורי עם אחריות יבואן רשמי",
          image: item.imageUrl || item.image || "📦",
          category: item.category || "כללי",
          stock: {
            availableQuantity: item.availableQuantity ?? 20,
            reservedQuantity: item.reservedQuantity ?? 0,
          },
        }))
      : [];
  },

  async queryRag(query: string, category?: string): Promise<RagResponseDto> {
    const res = await fetch("/api/rag/query", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        query,
        category: category !== "הכל" && category !== "ALL" ? category : undefined,
        topK: 4,
      }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to query AI Assistant");
    return res.json();
  },

  async getLoyaltyWallet(customerId: string): Promise<LoyaltyWalletDto | null> {
    try {
      const res = await fetch(`/api/loyalty/wallet?customerId=${encodeURIComponent(customerId)}`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async getOrders(): Promise<any[]> {
    const headers: Record<string, string> = {};
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("/api/orders?page=0&size=20", { headers, cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.content || [];
  },
};
