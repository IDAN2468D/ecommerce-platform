#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Seed and Enrich Fashion, Clothing, and Accessories Products from DummyJSON.

Fetches products from DummyJSON API categories:
- mens-shirts
- womens-dresses
- tops
- sunglasses
- mens-shoes
- womens-shoes
- mens-watches
- womens-watches
- womens-bags
- womens-jewellery

Enriches them with:
- Hebrew titles & detailed descriptions
- Realistic ILS prices
- Stock levels (availableQuantity, reservedQuantity)
- Liquid Glass UI specifications (glow, glassMaterial, accentGradient, theme, elevation)
- Primary categories ('CLOTHING', 'FASHION', 'ACCESSORIES') & comprehensive tags

Integrates into:
1. web-client/lib/products.ts
2. web-client/lib/fallback-catalog.ts
3. scripts/fashion_products.json
4. MongoDB (inventory_db, ecommerce_db) and Redis (if running)
"""

import sys
import os
import json
import uuid
import datetime
import urllib.request
import urllib.error

# Import enrichment mapping dictionaries
sys.path.insert(0, os.path.dirname(__file__))
from fashion_enrichment_data import FASHION_ENRICHMENT, FAKESTORE_ENRICHMENT

CATEGORIES_TO_FETCH = [
    "mens-shirts",
    "womens-dresses",
    "tops",
    "sunglasses",
    "mens-shoes",
    "womens-shoes",
    "mens-watches",
    "womens-watches",
    "womens-bags",
    "womens-jewellery",
]

def fetch_dummyjson_category(category: str):
    url = f"https://dummyjson.com/products/category/{category}?limit=100"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("products", [])
    except Exception as e:
        print(f"Warning: could not fetch {category} online ({e}), trying fallback.")
        return []

def fetch_all_dummyjson():
    print("Fetching fashion, clothing, and accessories from DummyJSON API...")
    products = []
    seen_ids = set()

    for cat in CATEGORIES_TO_FETCH:
        items = fetch_dummyjson_category(cat)
        for item in items:
            pid = item.get("id")
            if pid not in seen_ids:
                seen_ids.add(pid)
                products.append(item)

    if not products:
        raw_path = os.path.join(os.path.dirname(__file__), "dummyjson_fashion_raw.json")
        if os.path.exists(raw_path):
            print(f"Loading cached products from {raw_path}")
            with open(raw_path, "r", encoding="utf-8") as f:
                products = json.load(f)

    print(f"Total DummyJSON fashion products obtained: {len(products)}")
    return products

def enrich_product(p: dict) -> dict:
    pid = p.get("id")
    enrichment = FASHION_ENRICHMENT.get(pid, {})

    sku = p.get("sku") or f"DJ-FAS-{pid:03d}"
    title_he = enrichment.get("title", p.get("title", f"מוצר אופנה {sku}"))
    desc_he = enrichment.get("description", p.get("description", "מוצר אופנה איכותי בגימור פרימיום."))
    cat = enrichment.get("category", "FASHION")
    price_ils = enrichment.get("price")
    if price_ils is None:
        usd_price = float(p.get("price", 40.0))
        price_ils = round(usd_price * 3.8, 2)
        if price_ils < 49.0:
            price_ils = 49.0

    stock_val = enrichment.get("stock", int(p.get("stock", 25)))
    tags = enrichment.get("tags", [cat, "FASHION", "אופנה"])
    if cat not in tags:
        tags.insert(0, cat)

    # Liquid Glass UI specs
    theme = enrichment.get("theme", "amber")
    glow_color = enrichment.get("glow", "rgba(245, 158, 11, 0.4)")
    accent_gradient = enrichment.get("gradient", "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)")
    glass_material = enrichment.get("material", "ultra-clear-glass")
    
    elevation = "high" if price_ils > 500 else ("ultra" if price_ils > 5000 else "medium")

    img = p.get("thumbnail") or (p.get("images")[0] if p.get("images") else "")
    images = p.get("images", [img] if img else [])

    return {
        "skuCode": sku,
        "productName": title_he,
        "unitPrice": price_ils,
        "description": desc_he,
        "category": cat,
        "imageUrl": img,
        "images": images,
        "availableQuantity": stock_val,
        "reservedQuantity": 0,
        "tags": tags,
        "brand": p.get("brand", "Fashion Pro"),
        "rating": float(p.get("rating", 4.8)),
        "liquidGlassSpecs": {
            "theme": theme,
            "glowColor": glow_color,
            "badgeStyle": f"liquid-{theme}-badge",
            "backdropBlur": "24px",
            "glassMaterial": glass_material,
            "accentGradient": accent_gradient,
            "cardElevation": elevation,
            "sparkleColor": "#fbbf24" if theme in ("gold", "amber") else "#60a5fa",
        }
    }

def enrich_fakestore_product(p: dict) -> dict:
    sku = p.get("skuCode", "")
    enrichment = FAKESTORE_ENRICHMENT.get(sku)
    if not enrichment:
        return p

    cat = enrichment.get("category", "CLOTHING")
    tags = enrichment.get("tags", [cat, "FASHION"])
    if cat not in tags:
        tags.insert(0, cat)

    theme = enrichment.get("theme", "indigo")
    glow_color = enrichment.get("glow", "rgba(99, 102, 241, 0.4)")
    accent_gradient = enrichment.get("gradient", "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)")
    glass_material = enrichment.get("material", "ultra-clear-glass")

    return {
        "skuCode": sku,
        "productName": enrichment.get("title", p.get("productName")),
        "unitPrice": float(enrichment.get("price", p.get("unitPrice"))),
        "description": enrichment.get("description", p.get("description")),
        "category": cat,
        "imageUrl": p.get("imageUrl"),
        "images": [p.get("imageUrl")] if p.get("imageUrl") else [],
        "availableQuantity": int(enrichment.get("stock", p.get("availableQuantity", 30))),
        "reservedQuantity": 0,
        "tags": tags,
        "brand": "TechNova Studio",
        "rating": 4.7,
        "liquidGlassSpecs": {
            "theme": theme,
            "glowColor": glow_color,
            "badgeStyle": f"liquid-{theme}-badge",
            "backdropBlur": "24px",
            "glassMaterial": glass_material,
            "accentGradient": accent_gradient,
            "cardElevation": "medium",
            "sparkleColor": "#60a5fa",
        }
    }

def update_web_client_products(enriched_fashion: list):
    """
    Creates/updates web-client/lib/products.ts and syncs web-client/lib/fallback-catalog.ts
    """
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    products_ts_path = os.path.join(project_root, "web-client", "lib", "products.ts")
    fallback_ts_path = os.path.join(project_root, "web-client", "lib", "fallback-catalog.ts")
    base_catalog_path = os.path.join(os.path.dirname(__file__), "base_catalog.json")

    # Read base catalog (all 227 products)
    existing_products = []
    if os.path.exists(base_catalog_path):
        with open(base_catalog_path, "r", encoding="utf-8") as f:
            existing_products = json.load(f)
    else:
        existing_products = list(enriched_fashion)

    # Build SKU map of enriched DummyJSON products
    fashion_by_sku = {p["skuCode"]: p for p in enriched_fashion}

    # Merge into unified catalog
    unified_catalog = []
    seen_skus = set()

    for ep in existing_products:
        sku = ep.get("skuCode")
        if sku in fashion_by_sku:
            unified_catalog.append(fashion_by_sku[sku])
            seen_skus.add(sku)
        elif sku in FAKESTORE_ENRICHMENT:
            enriched_fs = enrich_fakestore_product(ep)
            unified_catalog.append(enriched_fs)
            seen_skus.add(sku)
        else:
            cat = ep.get("category", "TECH")
            if "tags" not in ep:
                ep["tags"] = [cat, "PREMIUM"]
            if "liquidGlassSpecs" not in ep:
                ep["liquidGlassSpecs"] = {
                    "theme": "amber",
                    "glowColor": "rgba(245, 158, 11, 0.35)",
                    "badgeStyle": "liquid-amber-badge",
                    "backdropBlur": "24px",
                    "glassMaterial": "liquid-glass-surface",
                    "accentGradient": "linear-gradient(135deg, #f59e0b 0%, #6366f1 100%)",
                    "cardElevation": "high",
                    "sparkleColor": "#fbbf24",
                }
            unified_catalog.append(ep)
            seen_skus.add(sku)

    # Add any remaining fashion products not yet present
    for fp in enriched_fashion:
        sku = fp["skuCode"]
        if sku not in seen_skus:
            unified_catalog.append(fp)
            seen_skus.add(sku)

    print(f"Total unified catalog items: {len(unified_catalog)}")

    # 1. Write web-client/lib/products.ts
    ts_products_code = f"""// Auto-generated & Enriched Catalog Products for Storefront
// Generated on: {datetime.datetime.now(datetime.timezone.utc).isoformat()}

export interface LiquidGlassSpecs {{
  theme: "amber" | "indigo" | "rose" | "emerald" | "cyan" | "gold" | string;
  glowColor: string;
  badgeStyle: string;
  glassMaterial: string;
  backdropBlur: string;
  accentGradient: string;
  cardElevation?: "low" | "medium" | "high" | "ultra";
  sparkleColor?: string;
}}

export interface CatalogProduct {{
  skuCode: string;
  productName: string;
  unitPrice: number;
  description: string;
  category: "CLOTHING" | "FASHION" | "ACCESSORIES" | string;
  imageUrl: string;
  images?: string[];
  availableQuantity: number;
  reservedQuantity: number;
  tags?: string[];
  brand?: string;
  rating?: number;
  liquidGlassSpecs?: LiquidGlassSpecs;
}}

export const FASHION_PRODUCTS: CatalogProduct[] = {json.dumps(enriched_fashion, ensure_ascii=False, indent=2)};

export const PRODUCTS: CatalogProduct[] = {json.dumps(unified_catalog, ensure_ascii=False, indent=2)};

export const CLOTHING_PRODUCTS = PRODUCTS.filter((p) => p.category === "CLOTHING");
export const FASHION_FOOTWEAR_PRODUCTS = PRODUCTS.filter((p) => p.category === "FASHION");
export const ACCESSORIES_PRODUCTS = PRODUCTS.filter((p) => p.category === "ACCESSORIES");

export function getProductBySku(skuCode: string): CatalogProduct | undefined {{
  return PRODUCTS.find((p) => p.skuCode === skuCode);
}}

export function getProductsByCategory(category: string): CatalogProduct[] {{
  if (!category || category === "ALL" || category === "הכל") {{
    return PRODUCTS;
  }}
  const catLower = category.toLowerCase();
  return PRODUCTS.filter(
    (p) =>
      p.category.toLowerCase() === catLower ||
      (p.tags && p.tags.some((t) => t.toLowerCase() === catLower))
  );
}}

export function searchProducts(query: string): CatalogProduct[] {{
  if (!query.trim()) return PRODUCTS;
  const q = query.toLowerCase().trim();
  return PRODUCTS.filter((p) => {{
    const nameMatch = p.productName.toLowerCase().includes(q);
    const skuMatch = p.skuCode.toLowerCase().includes(q);
    const descMatch = p.description.toLowerCase().includes(q);
    const tagsMatch = p.tags ? p.tags.some((t) => t.toLowerCase().includes(q)) : false;
    return nameMatch || skuMatch || descMatch || tagsMatch;
  }});
}}

export function getCatalogCategories(): string[] {{
  const cats = new Set<string>();
  PRODUCTS.forEach((p) => {{
    if (p.category) cats.add(p.category);
  }});
  return ["הכל", ...Array.from(cats)];
}}
"""

    with open(products_ts_path, "w", encoding="utf-8") as f:
        f.write(ts_products_code)
    print(f"Created/Updated {products_ts_path} with {len(unified_catalog)} total products.")

    # 2. Update web-client/lib/fallback-catalog.ts for seamless backwards compatibility
    fallback_ts_code = f"""// Storefront Fallback Catalog with Rich Liquid Glass Specifications
// Backwards compatible with existing imports from fallback-catalog.ts

export type {{ LiquidGlassSpecs, CatalogProduct }} from "./products";
import {{ PRODUCTS, CatalogProduct }} from "./products";

export const FALLBACK_PRODUCTS: CatalogProduct[] = PRODUCTS;
"""
    with open(fallback_ts_path, "w", encoding="utf-8") as f:
        f.write(fallback_ts_code)
    print(f"Updated {fallback_ts_path} referencing unified products catalog.")

def sync_to_mongodb(unified_catalog: list):
    """
    Syncs the products into MongoDB inventory collections if MongoDB is available.
    """
    try:
        from bson.decimal128 import Decimal128
        from bson.binary import Binary, UuidRepresentation
        import pymongo
    except ImportError:
        print("pymongo or bson not installed, skipping MongoDB sync.")
        return

    mongo_targets = [
        ("mongodb://localhost:27017/", "inventory_db", "Local inventory_db"),
        ("mongodb://localhost:27017/", "ecommerce_db", "Local ecommerce_db"),
    ]

    for uri, db_name, label in mongo_targets:
        try:
            client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=1500)
            db = client[db_name]
            coll = db["inventory"]
            client.admin.command("ping")

            inserted = 0
            updated = 0
            now = datetime.datetime.now(datetime.timezone.utc)

            for p in unified_catalog:
                sku = p["skuCode"]
                price_dec = Decimal128(str(p["unitPrice"]))
                existing = coll.find_one({"skuCode": sku})

                if existing:
                    coll.update_one(
                        {"skuCode": sku},
                        {"$set": {
                            "productName": p["productName"],
                            "unitPrice": price_dec,
                            "description": p["description"],
                            "category": p["category"],
                            "imageUrl": p["imageUrl"],
                            "availableQuantity": p["availableQuantity"],
                            "tags": p.get("tags", []),
                            "liquidGlassSpecs": p.get("liquidGlassSpecs"),
                            "updatedAt": now
                        }}
                    )
                    updated += 1
                else:
                    doc = {
                        "_id": Binary.from_uuid(uuid.uuid4(), UuidRepresentation.STANDARD),
                        "skuCode": sku,
                        "productName": p["productName"],
                        "availableQuantity": p["availableQuantity"],
                        "reservedQuantity": p.get("reservedQuantity", 0),
                        "unitPrice": price_dec,
                        "description": p["description"],
                        "category": p["category"],
                        "imageUrl": p["imageUrl"],
                        "tags": p.get("tags", []),
                        "liquidGlassSpecs": p.get("liquidGlassSpecs"),
                        "updatedAt": now,
                        "version": 0,
                        "_class": "com.company.inventoryservice.domain.entity.InventoryEntity"
                    }
                    coll.insert_one(doc)
                    inserted += 1

            print(f"[{label}] Synced: {inserted} inserted, {updated} updated.")
        except Exception as e:
            print(f"[{label}] Skipped (offline/unreachable: {e})")

def clear_redis_cache():
    """
    Clears product and catalog cache keys in Redis if running.
    """
    try:
        import redis
        r = redis.Redis(host="localhost", port=6379, db=0, socket_connect_timeout=1.0, socket_timeout=1.0)
        keys = r.keys("*product*") + r.keys("*catalog*") + r.keys("*inventory*")
        if keys:
            r.delete(*keys)
            print(f"Cleared {len(keys)} Redis cache keys.")
        else:
            print("No matching product cache keys found in Redis.")
    except Exception as e:
        print(f"Redis cache clear skipped: {e}")

def main():
    print("=" * 65)
    print("  Seed Fashion, Clothing & Accessories (DummyJSON + Liquid Glass)")
    print("=" * 65)

    raw_products = fetch_all_dummyjson()
    enriched = [enrich_product(p) for p in raw_products]

    # Save to scripts/fashion_products.json for ingest by any external script/service
    fashion_json_path = os.path.join(os.path.dirname(__file__), "fashion_products.json")
    with open(fashion_json_path, "w", encoding="utf-8") as f:
        json.dump(enriched, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(enriched)} enriched fashion products to {fashion_json_path}")

    # Category breakdown
    cat_counts = {}
    for p in enriched:
        c = p["category"]
        cat_counts[c] = cat_counts.get(c, 0) + 1

    print("\nEnriched DummyJSON Categories Summary:")
    for cat, count in sorted(cat_counts.items()):
        print(f"  - {cat}: {count} products")

    # Update web-client catalogs
    update_web_client_products(enriched)

    # Sync to databases if active
    sync_to_mongodb(enriched)
    clear_redis_cache()

    print("\n[SUCCESS] Fashion, Clothing & Accessories seeding completed successfully!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
