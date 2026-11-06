import urllib.request
import json
import uuid
import datetime
from bson.decimal128 import Decimal128
from bson.binary import Binary, UuidRepresentation
import pymongo
import redis

CATEGORY_MAP = {
    # DummyJSON
    "beauty": "ביוטי וטיפוח",
    "fragrances": "בישום וריח",
    "furniture": "ריהוט ועיצוב",
    "groceries": "מזון וסופרמרקט",
    "home-decoration": "עיצוב הבית",
    "kitchen-accessories": "כלי מטבח",
    "laptops": "מחשבים ניידים",
    "mens-shirts": "אופנת גברים",
    "mens-shoes": "נעלי גברים",
    "mens-watches": "שעוני גברים",
    "mobile-accessories": "אביזרי סלולר",
    "motorcycle": "אופנועים ורכב",
    "skin-care": "טיפוח וקוסמטיקה",
    "smartphones": "סמארטפונים",
    "sports-accessories": "כושר וספורט",
    "sunglasses": "משקפי שמש",
    "tablets": "טאבלטים",
    "tops": "אופנה וביגוד",
    "vehicle": "רכב ותחבורה",
    "womens-bags": "תיקי נשים",
    "womens-dresses": "שמלות נשים",
    "womens-jewellery": "תכשיטי יוקרה",
    "womens-shoes": "נעלי נשים",
    "womens-watches": "שעוני נשים",
    # FakeStoreAPI
    "men's clothing": "אופנת גברים",
    "women's clothing": "שמלות נשים",
    "jewelery": "תכשיטי יוקרה",
    "electronics": "אלקטרוניקה וגאדג'טים",
}

INITIAL_PREMIUM = [
    {
        "skuCode": "IPHONE-16-PRO-256",
        "productName": "Apple iPhone 16 Pro 256GB Desert Titanium",
        "unitPrice": 4899.0,
        "description": "שבב A18 Pro עוצמתי בטכנולוגיית 3 ננומטר, מסך Super Retina XDR 120Hz, כפתור Camera Control וגימור טיטניום יוקרתי.",
        "category": "סמארטפונים",
        "imageUrl": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
        "availableQuantity": 50,
        "reservedQuantity": 0,
    },
    {
        "skuCode": "SAMSUNG-S24-ULTRA",
        "productName": "Samsung Galaxy S24 Ultra 512GB Titanium Gray",
        "unitPrice": 5199.0,
        "description": "מערך צילום 200MP מקצועי, מסך Dynamic AMOLED 2X שטוח 120Hz, מעבד Snapdragon 8 Gen 3 ועט S-Pen מובנה.",
        "category": "סמארטפונים",
        "imageUrl": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80",
        "availableQuantity": 45,
        "reservedQuantity": 0,
    },
    {
        "skuCode": "MACBOOK-PRO-M3",
        "productName": "Apple MacBook Pro 14 M3 Pro 18GB 512GB",
        "unitPrice": 8999.0,
        "description": "מעבד Apple M3 Pro עוצמתי עם 18GB זיכרון אחיד, כונן 512GB SSD ומסך Liquid Retina XDR מרהיב.",
        "category": "מחשבים ניידים",
        "imageUrl": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
        "availableQuantity": 25,
        "reservedQuantity": 0,
    },
    {
        "skuCode": "SKU-LAPTOP-PRO",
        "productName": "Dell XPS 15 OLED Intel Core i9 32GB",
        "unitPrice": 6500.0,
        "description": "תחנת עבודה ניידת עם מסך מגע 3.5K OLED, מעבד Intel Core i9 דור 13, כרטיס גרפי RTX 4070 ו-32GB RAM.",
        "category": "מחשבים ניידים",
        "imageUrl": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
        "availableQuantity": 30,
        "reservedQuantity": 0,
    },
    {
        "skuCode": "IPAD-PRO-M4",
        "productName": "Apple iPad Pro 11-inch M4 256GB OLED Space Black",
        "unitPrice": 4299.0,
        "description": "שבב Apple M4 פורץ דרך, מסך Ultra Retina XDR כפול שכבות OLED בעובי דקיק של 5.3 מ\"מ בלבד.",
        "category": "טאבלטים",
        "imageUrl": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
        "availableQuantity": 35,
        "reservedQuantity": 0,
    },
    {
        "skuCode": "WATCH-ULTRA-2",
        "productName": "Apple Watch Ultra 2 GPS + Cellular",
        "unitPrice": 3499.0,
        "description": "גוף טיטניום תעופתי 49 מ\"מ, מסך OLED בבהירות שיא של 3000nits, עמידות במים 100 מטר וסוללה לעד 72 שעות.",
        "category": "שעונים חכמים",
        "imageUrl": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        "availableQuantity": 40,
        "reservedQuantity": 0,
    },
    {
        "skuCode": "AIRPODS-MAX",
        "productName": "Apple AirPods Max USB-C",
        "unitPrice": 2199.0,
        "description": "אוזניות פרימיום מעל האוזן עם סינון רעשים אקטיבי מוביל בתעשייה, שמע מרחבי מותאם אישית וחיבור USB-C.",
        "category": "אודיו",
        "imageUrl": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
        "availableQuantity": 50,
        "reservedQuantity": 0,
    },
    {
        "skuCode": "AIRPODS-PRO-2",
        "productName": "Apple AirPods Pro (2nd generation) USB-C",
        "unitPrice": 899.0,
        "description": "שבב H2 לאיכות סאונד מוגברת, סינון רעשים אקטיבי פי 2, מצב שקיפות מותאם ומארז טעינה MagSafe עם רמקול ואיתור.",
        "category": "אודיו",
        "imageUrl": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
        "availableQuantity": 80,
        "reservedQuantity": 0,
    },
    {
        "skuCode": "SONY-WH-1000XM5",
        "productName": "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
        "unitPrice": 1499.0,
        "description": "שני מעבדי סינון רעשים ייעודיים עם 8 מיקרופונים, איכות סאונד Hi-Res Audio וזמן סוללה של 30 שעות עם טעינה מהירה.",
        "category": "אודיו",
        "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        "availableQuantity": 60,
        "reservedQuantity": 0,
    },
    {
        "skuCode": "PS5-PRO",
        "productName": "Sony PlayStation 5 Pro 2TB Console",
        "unitPrice": 3399.0,
        "description": "קונסולת הגיימינג המתקדמת בעולם עם מעבד גרפי משודרג, תמיכה ב-PSSR Upscaling, מעקב קרניים מתקדם וכונן 2TB SSD.",
        "category": "גיימינג",
        "imageUrl": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
        "availableQuantity": 30,
        "reservedQuantity": 0,
    },
    {
        "skuCode": "DJI-MINI-4-PRO",
        "productName": "DJI Mini 4 Pro Drone Fly More Combo",
        "unitPrice": 4599.0,
        "description": "רחפן מקצועי מתחת ל-249 גרם עם צילום 4K/60fps HDR, חישת מכשולים היקפית ב-360 מעלות וזמן טיסה עד 34 דקות.",
        "category": "רחפנים",
        "imageUrl": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
        "availableQuantity": 25,
        "reservedQuantity": 0,
    },
    {
        "skuCode": "SKU-MOUSE-WIRELESS",
        "productName": "Logitech MX Master 3S Wireless Mouse",
        "unitPrice": 250.0,
        "description": "עכבר פרימיום ארגונומי עם גלילת MagSpeed אלקטרומגנטית, חיישן Darkfield 8000 DPI ולחיצות שקטות ב-90%.",
        "category": "אביזרים",
        "imageUrl": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
        "availableQuantity": 120,
        "reservedQuantity": 0,
    },
    {
        "skuCode": "CASE-CLEAR-MAGSAFE",
        "productName": "Clear Case with MagSafe for iPhone 16",
        "unitPrice": 150.0,
        "description": "כיסוי שקוף דק וקל להגנה מרבית, עם טבעת מגנטים מובנית התואמת למטעני MagSafe ואביזרים נלווים.",
        "category": "אביזרים",
        "imageUrl": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80",
        "availableQuantity": 100,
        "reservedQuantity": 0,
    },
]

def fetch_dummyjson():
    print("Fetching from DummyJSON...")
    url = "https://dummyjson.com/products?limit=194"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("products", [])
    except Exception as e:
        print(f"Error fetching DummyJSON: {e}")
        return []

def fetch_fakestore():
    print("Fetching from FakeStoreAPI...")
    url = "https://fakestoreapi.com/products"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"Error fetching FakeStore: {e}")
        return []

def main():
    all_products = []
    seen_skus = set()

    # Add initial premium items
    for item in INITIAL_PREMIUM:
        seen_skus.add(item["skuCode"])
        all_products.append(item)

    # 1. Process DummyJSON
    dj_products = fetch_dummyjson()
    for p in dj_products:
        sku = p.get("sku") or f"DJ-{p.get('id')}"
        if sku in seen_skus:
            sku = f"DJ-{p.get('id')}-{sku}"
        seen_skus.add(sku)

        raw_cat = p.get("category", "general")
        hebrew_cat = CATEGORY_MAP.get(raw_cat, raw_cat.title())
        usd_price = float(p.get("price", 20.0))
        ils_price = round(usd_price * 3.7, 2)
        if ils_price < 29.0:
            ils_price = round(ils_price + 20.0, 2)

        img = p.get("thumbnail") or (p.get("images")[0] if p.get("images") else "")

        all_products.append({
            "skuCode": sku,
            "productName": p.get("title", f"Product {sku}"),
            "unitPrice": ils_price,
            "description": p.get("description", ""),
            "category": hebrew_cat,
            "imageUrl": img,
            "availableQuantity": int(p.get("stock", 35)),
            "reservedQuantity": 0,
        })

    # 2. Process FakeStoreAPI
    fs_products = fetch_fakestore()
    for p in fs_products:
        sku = f"FS-{p.get('id')}"
        if sku in seen_skus:
            continue
        seen_skus.add(sku)

        raw_cat = p.get("category", "general")
        hebrew_cat = CATEGORY_MAP.get(raw_cat, raw_cat.title())
        usd_price = float(p.get("price", 25.0))
        ils_price = round(usd_price * 3.7, 2)

        all_products.append({
            "skuCode": sku,
            "productName": p.get("title", f"Product {sku}"),
            "unitPrice": ils_price,
            "description": p.get("description", ""),
            "category": hebrew_cat,
            "imageUrl": p.get("image", ""),
            "availableQuantity": 40,
            "reservedQuantity": 0,
        })

    print(f"Total unified catalog items: {len(all_products)}")

    # Category summary
    cat_counts = {}
    for p in all_products:
        c = p["category"]
        cat_counts[c] = cat_counts.get(c, 0) + 1
    print("Categories distribution:")
    for c, cnt in sorted(cat_counts.items(), key=lambda x: -x[1]):
        print(f"  - {c}: {cnt} items")

    # Write to web-client/lib/fallback-catalog.ts
    print("\nUpdating web-client/lib/fallback-catalog.ts...")
    ts_code = """export interface CatalogProduct {
  skuCode: string;
  productName: string;
  unitPrice: number;
  description: string;
  category: string;
  imageUrl: string;
  availableQuantity: number;
  reservedQuantity: number;
}

export const FALLBACK_PRODUCTS: CatalogProduct[] = """ + json.dumps(all_products, ensure_ascii=False, indent=2) + ";\n"

    with open("web-client/lib/fallback-catalog.ts", "w", encoding="utf-8") as f:
        f.write(ts_code)
    print("Updated fallback-catalog.ts successfully.")

    # Save to MongoDB targets
    def sync_to_mongo(uri, db_name, label):
        print(f"\nConnecting to MongoDB {label} ({db_name})...")
        try:
            mongo_client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=5000)
            db = mongo_client[db_name]
            coll = db["inventory"]

            inserted_count = 0
            updated_count = 0

            for p in all_products:
                existing = coll.find_one({"skuCode": p["skuCode"]})
                now = datetime.datetime.now(datetime.timezone.utc)
                price_dec = Decimal128(str(p["unitPrice"]))

                if existing:
                    coll.update_one(
                        {"skuCode": p["skuCode"]},
                        {"$set": {
                            "productName": p["productName"],
                            "unitPrice": price_dec,
                            "description": p["description"],
                            "category": p["category"],
                            "imageUrl": p["imageUrl"],
                            "availableQuantity": p["availableQuantity"],
                            "updatedAt": now
                        }}
                    )
                    updated_count += 1
                else:
                    doc = {
                        "_id": Binary.from_uuid(uuid.uuid4(), UuidRepresentation.STANDARD),
                        "skuCode": p["skuCode"],
                        "productName": p["productName"],
                        "availableQuantity": p["availableQuantity"],
                        "reservedQuantity": 0,
                        "unitPrice": price_dec,
                        "description": p["description"],
                        "category": p["category"],
                        "imageUrl": p["imageUrl"],
                        "updatedAt": now,
                        "version": 0,
                        "_class": "com.company.inventoryservice.domain.entity.InventoryEntity"
                    }
                    coll.insert_one(doc)
                    inserted_count += 1

            print(f"[{label}] Inventory synced: {inserted_count} new inserted, {updated_count} existing refreshed. Total in DB: {coll.count_documents({})}")
        except Exception as e:
            print(f"[{label}] MongoDB update failed: {e}")

    sync_to_mongo("mongodb://localhost:27017/", "inventory_db", "Local inventory_db")
    sync_to_mongo("mongodb://localhost:27017/", "ecommerce_db", "Local ecommerce_db")
    sync_to_mongo("mongodb+srv://idankzm:idankzm2468@cluster0.purdk.mongodb.net/ecommerce_db?retryWrites=true&w=majority", "ecommerce_db", "Cloud Atlas ecommerce_db")

    # Clear Redis Cache
    print("\nClearing Redis cache...")
    try:
        r = redis.Redis(host="localhost", port=6379, db=0)
        keys = r.keys("*product*") + r.keys("*catalog*") + r.keys("*inventory*")
        if keys:
            r.delete(*keys)
            print(f"Cleared {len(keys)} cache keys in Redis.")
        else:
            print("No matching product cache keys found to clear.")
    except Exception as e:
        print(f"Redis clear skipped: {e}")

    print("\nDone! All products imported and synchronized across all services.")

if __name__ == "__main__":
    main()
