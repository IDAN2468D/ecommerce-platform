-- V3: Add rich product details (description, category, image_url) and new catalog products

ALTER TABLE inventory ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS category VARCHAR(64);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS image_url VARCHAR(512);

-- Update existing catalog items with rich descriptions, categories and authentic images
UPDATE inventory 
SET description = 'שבב A18 Pro עוצמתי בטכנולוגיית 3 ננומטר, מסך Super Retina XDR 120Hz, כפתור Camera Control וגימור טיטניום יוקרתי.',
    category = 'סמארטפונים',
    image_url = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80'
WHERE sku_code = 'IPHONE-16-PRO-256';

UPDATE inventory 
SET description = 'מעבד Apple M3 Pro עוצמתי עם 18GB זיכרון אחיד, כונן 512GB SSD ומסך Liquid Retina XDR מרהיב.',
    category = 'מחשבים ניידים',
    image_url = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
WHERE sku_code = 'MACBOOK-PRO-M3';

UPDATE inventory 
SET description = 'אוזניות פרימיום מעל האוזן עם סינון רעשים אקטיבי מוביל בתעשייה, שמע מרחבי מותאם אישית וחיבור USB-C.',
    category = 'אודיו',
    image_url = 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
WHERE sku_code = 'AIRPODS-MAX';

UPDATE inventory 
SET description = 'גוף טיטניום תעופתי 49 מ"מ, מסך OLED בבהירות שיא של 3000nits, עמידות במים 100 מטר וסוללה לעד 72 שעות.',
    category = 'שעונים חכמים',
    image_url = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
WHERE sku_code = 'WATCH-ULTRA-2';

UPDATE inventory 
SET description = 'שבב H2 לאיכות סאונד מוגברת, סינון רעשים אקטיבי פי 2, מצב שקיפות מותאם ומארז טעינה MagSafe עם רמקול ואיתור.',
    category = 'אודיו',
    image_url = 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80'
WHERE sku_code = 'AIRPODS-PRO-2';

UPDATE inventory 
SET description = 'תחנת עבודה ניידת עם מסך מגע 3.5K OLED, מעבד Intel Core i9 דור 13, כרטיס גרפי RTX 4070 ו-32GB RAM.',
    category = 'מחשבים ניידים',
    image_url = 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80'
WHERE sku_code = 'SKU-LAPTOP-PRO';

UPDATE inventory 
SET description = 'עכבר פרימיום ארגונומי עם גלילת MagSpeed אלקטרומגנטית, חיישן Darkfield 8000 DPI ולחיצות שקטות ב-90%.',
    category = 'אביזרים',
    image_url = 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80'
WHERE sku_code = 'SKU-MOUSE-WIRELESS';

UPDATE inventory 
SET description = 'כיסוי שקוף דק וקל להגנה מרבית, עם טבעת מגנטים מובנית התואמת למטעני MagSafe ואביזרים נלווים.',
    category = 'אביזרים',
    image_url = 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80'
WHERE sku_code = 'CASE-CLEAR-MAGSAFE';

-- Insert exciting new catalog products with authentic images
INSERT INTO inventory (id, sku_code, product_name, available_quantity, reserved_quantity, unit_price, description, category, image_url)
VALUES 
    (gen_random_uuid(), 'SAMSUNG-S24-ULTRA', 'Samsung Galaxy S24 Ultra 512GB Titanium Gray', 45, 0, 5199.00,
     'מערך צילום 200MP מקצועי, מסך Dynamic AMOLED 2X שטוח 120Hz, מעבד Snapdragon 8 Gen 3 ועט S-Pen מובנה.',
     'סמארטפונים',
     'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80'),

    (gen_random_uuid(), 'IPAD-PRO-M4', 'Apple iPad Pro 11-inch M4 256GB OLED Space Black', 35, 0, 4299.00,
     'שבב Apple M4 פורץ דרך, מסך Ultra Retina XDR כפול שכבות OLED בעובי דקיק של 5.3 מ"מ בלבד.',
     'טאבלטים',
     'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80'),

    (gen_random_uuid(), 'PS5-PRO', 'Sony PlayStation 5 Pro 2TB Console', 30, 0, 3399.00,
     'קונסולת הגיימינג המתקדמת בעולם עם מעבד גרפי משודרג, תמיכה ב-PSSR Upscaling, מעקב קרניים מתקדם וכונן 2TB SSD.',
     'גיימינג',
     'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80'),

    (gen_random_uuid(), 'SONY-WH-1000XM5', 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', 60, 0, 1499.00,
     'שני מעבדי סינון רעשים ייעודיים עם 8 מיקרופונים, איכות סאונד Hi-Res Audio וזמן סוללה של 30 שעות עם טעינה מהירה.',
     'אודיו',
     'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'),

    (gen_random_uuid(), 'DJI-MINI-4-PRO', 'DJI Mini 4 Pro Drone Fly More Combo', 25, 0, 4599.00,
     'רחפן מקצועי מתחת ל-249 גרם עם צילום 4K/60fps HDR, חישת מכשולים היקפית ב-360 מעלות וזמן טיסה עד 34 דקות.',
     'רחפנים',
     'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (sku_code) DO UPDATE SET
    product_name = EXCLUDED.product_name,
    unit_price = EXCLUDED.unit_price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    image_url = EXCLUDED.image_url;
