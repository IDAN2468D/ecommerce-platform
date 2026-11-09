import json
import re

with open('web-client/lib/fallback-catalog.ts', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(
    r'\{\s*"skuCode":\s*"([^"]+)",\s*'
    r'"productName":\s*"([^"]+)",\s*'
    r'"unitPrice":\s*([0-9.]+),\s*'
    r'"description":\s*"([^"]+)",\s*'
    r'"category":\s*"([^"]+)",\s*'
    r'"imageUrl":\s*"([^"]+)",\s*'
    r'"availableQuantity":\s*([0-9]+)',
    re.DOTALL
)

matches = pattern.findall(content)
print(f"Total parsed: {len(matches)}")

products = []
for m in matches:
    sku, name, price, desc, cat, img, qty = m
    products.append({
        "sku": sku,
        "name": name,
        "price": float(price),
        "description": desc,
        "category": cat,
        "image": img,
        "quantity": int(qty)
    })

# Select 12 varied high quality products
skus_priority = [
    "IPHONE-16-PRO-256",
    "SAMSUNG-S24-ULTRA",
    "MACBOOK-PRO-M3",
    "SKU-LAPTOP-PRO",
    "IPAD-PRO-M4",
    "WATCH-ULTRA-2",
    "AIRPODS-MAX",
    "AIRPODS-PRO-2",
    "SONY-WH-1000XM5",
    "PS5-PRO-CONSOLE",
    "DYSON-V15",
    "NESPRESSO-VERTUO"
]

selected = []
for s in skus_priority:
    for p in products:
        if s.lower() in p["sku"].lower():
            selected.append(p)
            break

# If not 12, fill up from others
for p in products:
    if len(selected) >= 12:
        break
    if p not in selected:
        selected.append(p)

with open('scripts/top_products.json', 'w', encoding='utf-8') as out:
    json.dump(selected, out, ensure_ascii=False, indent=2)

print(f"Saved {len(selected)} selected products to scripts/top_products.json")
