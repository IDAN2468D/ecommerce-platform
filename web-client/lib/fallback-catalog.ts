export interface CatalogProduct {
  skuCode: string;
  productName: string;
  unitPrice: number;
  description: string;
  category: string;
  imageUrl: string;
  availableQuantity: number;
  reservedQuantity: number;
}

export const FALLBACK_PRODUCTS: CatalogProduct[] = [
  {
    "skuCode": "IPHONE-16-PRO-256",
    "productName": "Apple iPhone 16 Pro 256GB Desert Titanium",
    "unitPrice": 4899.0,
    "description": "שבב A18 Pro עוצמתי בטכנולוגיית 3 ננומטר, מסך Super Retina XDR 120Hz, כפתור Camera Control וגימור טיטניום יוקרתי.",
    "category": "סמארטפונים",
    "imageUrl": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    "availableQuantity": 50,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SAMSUNG-S24-ULTRA",
    "productName": "Samsung Galaxy S24 Ultra 512GB Titanium Gray",
    "unitPrice": 5199.0,
    "description": "מערך צילום 200MP מקצועי, מסך Dynamic AMOLED 2X שטוח 120Hz, מעבד Snapdragon 8 Gen 3 ועט S-Pen מובנה.",
    "category": "סמארטפונים",
    "imageUrl": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80",
    "availableQuantity": 45,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MACBOOK-PRO-M3",
    "productName": "Apple MacBook Pro 14 M3 Pro 18GB 512GB",
    "unitPrice": 8999.0,
    "description": "מעבד Apple M3 Pro עוצמתי עם 18GB זיכרון אחיד, כונן 512GB SSD ומסך Liquid Retina XDR מרהיב.",
    "category": "מחשבים ניידים",
    "imageUrl": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    "availableQuantity": 25,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SKU-LAPTOP-PRO",
    "productName": "Dell XPS 15 OLED Intel Core i9 32GB",
    "unitPrice": 6500.0,
    "description": "תחנת עבודה ניידת עם מסך מגע 3.5K OLED, מעבד Intel Core i9 דור 13, כרטיס גרפי RTX 4070 ו-32GB RAM.",
    "category": "מחשבים ניידים",
    "imageUrl": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
    "availableQuantity": 30,
    "reservedQuantity": 0
  },
  {
    "skuCode": "IPAD-PRO-M4",
    "productName": "Apple iPad Pro 11-inch M4 256GB OLED Space Black",
    "unitPrice": 4299.0,
    "description": "שבב Apple M4 פורץ דרך, מסך Ultra Retina XDR כפול שכבות OLED בעובי דקיק של 5.3 מ\"מ בלבד.",
    "category": "טאבלטים",
    "imageUrl": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
    "availableQuantity": 35,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WATCH-ULTRA-2",
    "productName": "Apple Watch Ultra 2 GPS + Cellular",
    "unitPrice": 3499.0,
    "description": "גוף טיטניום תעופתי 49 מ\"מ, מסך OLED בבהירות שיא של 3000nits, עמידות במים 100 מטר וסוללה לעד 72 שעות.",
    "category": "שעונים חכמים",
    "imageUrl": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "AIRPODS-MAX",
    "productName": "Apple AirPods Max USB-C",
    "unitPrice": 2199.0,
    "description": "אוזניות פרימיום מעל האוזן עם סינון רעשים אקטיבי מוביל בתעשייה, שמע מרחבי מותאם אישית וחיבור USB-C.",
    "category": "אודיו",
    "imageUrl": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
    "availableQuantity": 50,
    "reservedQuantity": 0
  },
  {
    "skuCode": "AIRPODS-PRO-2",
    "productName": "Apple AirPods Pro (2nd generation) USB-C",
    "unitPrice": 899.0,
    "description": "שבב H2 לאיכות סאונד מוגברת, סינון רעשים אקטיבי פי 2, מצב שקיפות מותאם ומארז טעינה MagSafe עם רמקול ואיתור.",
    "category": "אודיו",
    "imageUrl": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
    "availableQuantity": 80,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SONY-WH-1000XM5",
    "productName": "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    "unitPrice": 1499.0,
    "description": "שני מעבדי סינון רעשים ייעודיים עם 8 מיקרופונים, איכות סאונד Hi-Res Audio וזמן סוללה של 30 שעות עם טעינה מהירה.",
    "category": "אודיו",
    "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    "availableQuantity": 60,
    "reservedQuantity": 0
  },
  {
    "skuCode": "PS5-PRO",
    "productName": "Sony PlayStation 5 Pro 2TB Console",
    "unitPrice": 3399.0,
    "description": "קונסולת הגיימינג המתקדמת בעולם עם מעבד גרפי משודרג, תמיכה ב-PSSR Upscaling, מעקב קרניים מתקדם וכונן 2TB SSD.",
    "category": "גיימינג",
    "imageUrl": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
    "availableQuantity": 30,
    "reservedQuantity": 0
  },
  {
    "skuCode": "DJI-MINI-4-PRO",
    "productName": "DJI Mini 4 Pro Drone Fly More Combo",
    "unitPrice": 4599.0,
    "description": "רחפן מקצועי מתחת ל-249 גרם עם צילום 4K/60fps HDR, חישת מכשולים היקפית ב-360 מעלות וזמן טיסה עד 34 דקות.",
    "category": "רחפנים",
    "imageUrl": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
    "availableQuantity": 25,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SKU-MOUSE-WIRELESS",
    "productName": "Logitech MX Master 3S Wireless Mouse",
    "unitPrice": 250.0,
    "description": "עכבר פרימיום ארגונומי עם גלילת MagSpeed אלקטרומגנטית, חיישן Darkfield 8000 DPI ולחיצות שקטות ב-90%.",
    "category": "אביזרים",
    "imageUrl": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
    "availableQuantity": 120,
    "reservedQuantity": 0
  },
  {
    "skuCode": "CASE-CLEAR-MAGSAFE",
    "productName": "Clear Case with MagSafe for iPhone 16",
    "unitPrice": 150.0,
    "description": "כיסוי שקוף דק וקל להגנה מרבית, עם טבעת מגנטים מובנית התואמת למטעני MagSafe ואביזרים נלווים.",
    "category": "אביזרים",
    "imageUrl": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80",
    "availableQuantity": 100,
    "reservedQuantity": 0
  },
  {
    "skuCode": "BEA-ESS-ESS-001",
    "productName": "Essence Mascara Lash Princess",
    "unitPrice": 36.96,
    "description": "The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects. Achieve dramatic lashes with this long-lasting and cruelty-free formula.",
    "category": "ביוטי וטיפוח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp",
    "availableQuantity": 99,
    "reservedQuantity": 0
  },
  {
    "skuCode": "BEA-GLA-EYE-002",
    "productName": "Eyeshadow Palette with Mirror",
    "unitPrice": 73.96,
    "description": "The Eyeshadow Palette with Mirror offers a versatile range of eyeshadow shades for creating stunning eye looks. With a built-in mirror, it's convenient for on-the-go makeup application.",
    "category": "ביוטי וטיפוח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp",
    "availableQuantity": 34,
    "reservedQuantity": 0
  },
  {
    "skuCode": "BEA-VEL-POW-003",
    "productName": "Powder Canister",
    "unitPrice": 55.46,
    "description": "The Powder Canister is a finely milled setting powder designed to set makeup and control shine. With a lightweight and translucent formula, it provides a smooth and matte finish.",
    "category": "ביוטי וטיפוח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp",
    "availableQuantity": 89,
    "reservedQuantity": 0
  },
  {
    "skuCode": "BEA-CHI-LIP-004",
    "productName": "Red Lipstick",
    "unitPrice": 48.06,
    "description": "The Red Lipstick is a classic and bold choice for adding a pop of color to your lips. With a creamy and pigmented formula, it provides a vibrant and long-lasting finish.",
    "category": "ביוטי וטיפוח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/beauty/red-lipstick/thumbnail.webp",
    "availableQuantity": 91,
    "reservedQuantity": 0
  },
  {
    "skuCode": "BEA-NAI-NAI-005",
    "productName": "Red Nail Polish",
    "unitPrice": 33.26,
    "description": "The Red Nail Polish offers a rich and glossy red hue for vibrant and polished nails. With a quick-drying formula, it provides a salon-quality finish at home.",
    "category": "ביוטי וטיפוח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/beauty/red-nail-polish/thumbnail.webp",
    "availableQuantity": 79,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FRA-CAL-CAL-006",
    "productName": "Calvin Klein CK One",
    "unitPrice": 184.96,
    "description": "CK One by Calvin Klein is a classic unisex fragrance, known for its fresh and clean scent. It's a versatile fragrance suitable for everyday wear.",
    "category": "בישום וריח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/thumbnail.webp",
    "availableQuantity": 29,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FRA-CHA-CHA-007",
    "productName": "Chanel Coco Noir Eau De",
    "unitPrice": 480.96,
    "description": "Coco Noir by Chanel is an elegant and mysterious fragrance, featuring notes of grapefruit, rose, and sandalwood. Perfect for evening occasions.",
    "category": "בישום וריח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/thumbnail.webp",
    "availableQuantity": 58,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FRA-DIO-DIO-008",
    "productName": "Dior J'adore",
    "unitPrice": 332.96,
    "description": "J'adore by Dior is a luxurious and floral fragrance, known for its blend of ylang-ylang, rose, and jasmine. It embodies femininity and sophistication.",
    "category": "בישום וריח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/fragrances/dior-j'adore/thumbnail.webp",
    "availableQuantity": 98,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FRA-DOL-DOL-009",
    "productName": "Dolce Shine Eau de",
    "unitPrice": 258.96,
    "description": "Dolce Shine by Dolce & Gabbana is a vibrant and fruity fragrance, featuring notes of mango, jasmine, and blonde woods. It's a joyful and youthful scent.",
    "category": "בישום וריח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/fragrances/dolce-shine-eau-de/thumbnail.webp",
    "availableQuantity": 4,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FRA-GUC-GUC-010",
    "productName": "Gucci Bloom Eau de",
    "unitPrice": 295.96,
    "description": "Gucci Bloom by Gucci is a floral and captivating fragrance, with notes of tuberose, jasmine, and Rangoon creeper. It's a modern and romantic scent.",
    "category": "בישום וריח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/thumbnail.webp",
    "availableQuantity": 91,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FUR-ANN-ANN-011",
    "productName": "Annibale Colombo Bed",
    "unitPrice": 7029.96,
    "description": "The Annibale Colombo Bed is a luxurious and elegant bed frame, crafted with high-quality materials for a comfortable and stylish bedroom.",
    "category": "ריהוט ועיצוב",
    "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/thumbnail.webp",
    "availableQuantity": 88,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FUR-ANN-ANN-012",
    "productName": "Annibale Colombo Sofa",
    "unitPrice": 9249.96,
    "description": "The Annibale Colombo Sofa is a sophisticated and comfortable seating option, featuring exquisite design and premium upholstery for your living room.",
    "category": "ריהוט ועיצוב",
    "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/thumbnail.webp",
    "availableQuantity": 60,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FUR-FUR-BED-013",
    "productName": "Bedside Table African Cherry",
    "unitPrice": 1109.96,
    "description": "The Bedside Table in African Cherry is a stylish and functional addition to your bedroom, providing convenient storage space and a touch of elegance.",
    "category": "ריהוט ועיצוב",
    "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/thumbnail.webp",
    "availableQuantity": 64,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FUR-KNO-KNO-014",
    "productName": "Knoll Saarinen Executive Conference Chair",
    "unitPrice": 1849.96,
    "description": "The Knoll Saarinen Executive Conference Chair is a modern and ergonomic chair, perfect for your office or conference room with its timeless design.",
    "category": "ריהוט ועיצוב",
    "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/knoll-saarinen-executive-conference-chair/thumbnail.webp",
    "availableQuantity": 26,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FUR-BAT-WOO-015",
    "productName": "Wooden Bathroom Sink With Mirror",
    "unitPrice": 2959.96,
    "description": "The Wooden Bathroom Sink with Mirror is a unique and stylish addition to your bathroom, featuring a wooden sink countertop and a matching mirror.",
    "category": "ריהוט ועיצוב",
    "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/wooden-bathroom-sink-with-mirror/thumbnail.webp",
    "availableQuantity": 7,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-APP-016",
    "productName": "Apple",
    "unitPrice": 27.36,
    "description": "Fresh and crisp apples, perfect for snacking or incorporating into various recipes.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/apple/thumbnail.webp",
    "availableQuantity": 8,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-BEE-017",
    "productName": "Beef Steak",
    "unitPrice": 48.06,
    "description": "High-quality beef steak, great for grilling or cooking to your preferred level of doneness.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/beef-steak/thumbnail.webp",
    "availableQuantity": 86,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-FOO-018",
    "productName": "Cat Food",
    "unitPrice": 33.26,
    "description": "Nutritious cat food formulated to meet the dietary needs of your feline friend.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/cat-food/thumbnail.webp",
    "availableQuantity": 46,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-CHI-019",
    "productName": "Chicken Meat",
    "unitPrice": 36.96,
    "description": "Fresh and tender chicken meat, suitable for various culinary preparations.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/chicken-meat/thumbnail.webp",
    "availableQuantity": 97,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-COO-020",
    "productName": "Cooking Oil",
    "unitPrice": 38.46,
    "description": "Versatile cooking oil suitable for frying, sautéing, and various culinary applications.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/cooking-oil/thumbnail.webp",
    "availableQuantity": 10,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-CUC-021",
    "productName": "Cucumber",
    "unitPrice": 25.51,
    "description": "Crisp and hydrating cucumbers, ideal for salads, snacks, or as a refreshing side.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/cucumber/thumbnail.webp",
    "availableQuantity": 84,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-FOO-022",
    "productName": "Dog Food",
    "unitPrice": 40.66,
    "description": "Specially formulated dog food designed to provide essential nutrients for your canine companion.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/dog-food/thumbnail.webp",
    "availableQuantity": 71,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-EGG-023",
    "productName": "Eggs",
    "unitPrice": 31.06,
    "description": "Fresh eggs, a versatile ingredient for baking, cooking, or breakfast.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/eggs/thumbnail.webp",
    "availableQuantity": 9,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-FIS-024",
    "productName": "Fish Steak",
    "unitPrice": 55.46,
    "description": "Quality fish steak, suitable for grilling, baking, or pan-searing.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/fish-steak/thumbnail.webp",
    "availableQuantity": 74,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-GRE-025",
    "productName": "Green Bell Pepper",
    "unitPrice": 24.77,
    "description": "Fresh and vibrant green bell pepper, perfect for adding color and flavor to your dishes.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/green-bell-pepper/thumbnail.webp",
    "availableQuantity": 33,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-GRE-026",
    "productName": "Green Chili Pepper",
    "unitPrice": 23.66,
    "description": "Spicy green chili pepper, ideal for adding heat to your favorite recipes.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/green-chili-pepper/thumbnail.webp",
    "availableQuantity": 3,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-HON-027",
    "productName": "Honey Jar",
    "unitPrice": 45.86,
    "description": "Pure and natural honey in a convenient jar, perfect for sweetening beverages or drizzling over food.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/honey-jar/thumbnail.webp",
    "availableQuantity": 34,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-CRE-028",
    "productName": "Ice Cream",
    "unitPrice": 40.31,
    "description": "Creamy and delicious ice cream, available in various flavors for a delightful treat.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/ice-cream/thumbnail.webp",
    "availableQuantity": 27,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-JUI-029",
    "productName": "Juice",
    "unitPrice": 34.76,
    "description": "Refreshing fruit juice, packed with vitamins and great for staying hydrated.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/juice/thumbnail.webp",
    "availableQuantity": 50,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-KIW-030",
    "productName": "Kiwi",
    "unitPrice": 29.21,
    "description": "Nutrient-rich kiwi, perfect for snacking or adding a tropical twist to your dishes.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/kiwi/thumbnail.webp",
    "availableQuantity": 99,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-LEM-031",
    "productName": "Lemon",
    "unitPrice": 22.92,
    "description": "Zesty and tangy lemons, versatile for cooking, baking, or making refreshing beverages.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/lemon/thumbnail.webp",
    "availableQuantity": 31,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-MIL-032",
    "productName": "Milk",
    "unitPrice": 32.91,
    "description": "Fresh and nutritious milk, a staple for various recipes and daily consumption.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/milk/thumbnail.webp",
    "availableQuantity": 27,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-MUL-033",
    "productName": "Mulberry",
    "unitPrice": 38.46,
    "description": "Sweet and juicy mulberries, perfect for snacking or adding to desserts and cereals.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/mulberry/thumbnail.webp",
    "availableQuantity": 99,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-NES-034",
    "productName": "Nescafe Coffee",
    "unitPrice": 29.56,
    "description": "Quality coffee from Nescafe, available in various blends for a rich and satisfying cup.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/nescafe-coffee/thumbnail.webp",
    "availableQuantity": 57,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-POT-035",
    "productName": "Potatoes",
    "unitPrice": 28.47,
    "description": "Versatile and starchy potatoes, great for roasting, mashing, or as a side dish.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/potatoes/thumbnail.webp",
    "availableQuantity": 13,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-PRO-036",
    "productName": "Protein Powder",
    "unitPrice": 73.96,
    "description": "Nutrient-packed protein powder, ideal for supplementing your diet with essential proteins.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/protein-powder/thumbnail.webp",
    "availableQuantity": 80,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-ONI-037",
    "productName": "Red Onions",
    "unitPrice": 27.36,
    "description": "Flavorful and aromatic red onions, perfect for adding depth to your savory dishes.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/red-onions/thumbnail.webp",
    "availableQuantity": 82,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-RIC-038",
    "productName": "Rice",
    "unitPrice": 42.16,
    "description": "High-quality rice, a staple for various cuisines and a versatile base for many dishes.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/rice/thumbnail.webp",
    "availableQuantity": 59,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-SOF-039",
    "productName": "Soft Drinks",
    "unitPrice": 27.36,
    "description": "Assorted soft drinks in various flavors, perfect for refreshing beverages.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/soft-drinks/thumbnail.webp",
    "availableQuantity": 53,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-STR-040",
    "productName": "Strawberry",
    "unitPrice": 34.76,
    "description": "Sweet and succulent strawberries, great for snacking, desserts, or blending into smoothies.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/strawberry/thumbnail.webp",
    "availableQuantity": 46,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-TIS-041",
    "productName": "Tissue Paper Box",
    "unitPrice": 29.21,
    "description": "Convenient tissue paper box for everyday use, providing soft and absorbent tissues.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/tissue-paper-box/thumbnail.webp",
    "availableQuantity": 86,
    "reservedQuantity": 0
  },
  {
    "skuCode": "GRO-BRD-WAT-042",
    "productName": "Water",
    "unitPrice": 23.66,
    "description": "Pure and refreshing bottled water, essential for staying hydrated throughout the day.",
    "category": "מזון וסופרמרקט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/water/thumbnail.webp",
    "availableQuantity": 53,
    "reservedQuantity": 0
  },
  {
    "skuCode": "HOM-BRD-DEC-043",
    "productName": "Decoration Swing",
    "unitPrice": 221.96,
    "description": "The Decoration Swing is a charming addition to your home decor. Crafted with intricate details, it adds a touch of elegance and whimsy to any room.",
    "category": "עיצוב הבית",
    "imageUrl": "https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/thumbnail.webp",
    "availableQuantity": 47,
    "reservedQuantity": 0
  },
  {
    "skuCode": "HOM-BRD-FAM-044",
    "productName": "Family Tree Photo Frame",
    "unitPrice": 110.96,
    "description": "The Family Tree Photo Frame is a sentimental and stylish way to display your cherished family memories. With multiple photo slots, it tells the story of your loved ones.",
    "category": "עיצוב הבית",
    "imageUrl": "https://cdn.dummyjson.com/product-images/home-decoration/family-tree-photo-frame/thumbnail.webp",
    "availableQuantity": 77,
    "reservedQuantity": 0
  },
  {
    "skuCode": "HOM-BRD-HOU-045",
    "productName": "House Showpiece Plant",
    "unitPrice": 147.96,
    "description": "The House Showpiece Plant is an artificial plant that brings a touch of nature to your home without the need for maintenance. It adds greenery and style to any space.",
    "category": "עיצוב הבית",
    "imageUrl": "https://cdn.dummyjson.com/product-images/home-decoration/house-showpiece-plant/thumbnail.webp",
    "availableQuantity": 28,
    "reservedQuantity": 0
  },
  {
    "skuCode": "HOM-BRD-PLA-046",
    "productName": "Plant Pot",
    "unitPrice": 55.46,
    "description": "The Plant Pot is a stylish container for your favorite plants. With a sleek design, it complements your indoor or outdoor garden, adding a modern touch to your plant display.",
    "category": "עיצוב הבית",
    "imageUrl": "https://cdn.dummyjson.com/product-images/home-decoration/plant-pot/thumbnail.webp",
    "availableQuantity": 59,
    "reservedQuantity": 0
  },
  {
    "skuCode": "HOM-BRD-TAB-047",
    "productName": "Table Lamp",
    "unitPrice": 184.96,
    "description": "The Table Lamp is a functional and decorative lighting solution for your living space. With a modern design, it provides both ambient and task lighting, enhancing the atmosphere.",
    "category": "עיצוב הבית",
    "imageUrl": "https://cdn.dummyjson.com/product-images/home-decoration/table-lamp/thumbnail.webp",
    "availableQuantity": 9,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-BAM-048",
    "productName": "Bamboo Spatula",
    "unitPrice": 29.56,
    "description": "The Bamboo Spatula is a versatile kitchen tool made from eco-friendly bamboo. Ideal for flipping, stirring, and serving various dishes.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/bamboo-spatula/thumbnail.webp",
    "availableQuantity": 37,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-BLA-049",
    "productName": "Black Aluminium Cup",
    "unitPrice": 42.16,
    "description": "The Black Aluminium Cup is a stylish and durable cup suitable for both hot and cold beverages. Its sleek black design adds a modern touch to your drinkware collection.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/black-aluminium-cup/thumbnail.webp",
    "availableQuantity": 75,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-BLA-050",
    "productName": "Black Whisk",
    "unitPrice": 36.96,
    "description": "The Black Whisk is a kitchen essential for whisking and beating ingredients. Its ergonomic handle and sleek design make it a practical and stylish tool.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/black-whisk/thumbnail.webp",
    "availableQuantity": 73,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-BOX-051",
    "productName": "Boxed Blender",
    "unitPrice": 147.96,
    "description": "The Boxed Blender is a powerful and compact blender perfect for smoothies, shakes, and more. Its convenient design and multiple functions make it a versatile kitchen appliance.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/thumbnail.webp",
    "availableQuantity": 9,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-CAR-052",
    "productName": "Carbon Steel Wok",
    "unitPrice": 110.96,
    "description": "The Carbon Steel Wok is a versatile cooking pan suitable for stir-frying, sautéing, and deep frying. Its sturdy construction ensures even heat distribution for delicious meals.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/carbon-steel-wok/thumbnail.webp",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-CHO-053",
    "productName": "Chopping Board",
    "unitPrice": 48.06,
    "description": "The Chopping Board is an essential kitchen accessory for food preparation. Made from durable material, it provides a safe and hygienic surface for cutting and chopping.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/chopping-board/thumbnail.webp",
    "availableQuantity": 14,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-CIT-054",
    "productName": "Citrus Squeezer Yellow",
    "unitPrice": 33.26,
    "description": "The Citrus Squeezer in Yellow is a handy tool for extracting juice from citrus fruits. Its vibrant color adds a cheerful touch to your kitchen gadgets.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/citrus-squeezer-yellow/thumbnail.webp",
    "availableQuantity": 22,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-SLI-055",
    "productName": "Egg Slicer",
    "unitPrice": 45.86,
    "description": "The Egg Slicer is a convenient tool for slicing boiled eggs evenly. It's perfect for salads, sandwiches, and other dishes where sliced eggs are desired.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/egg-slicer/thumbnail.webp",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-ELE-056",
    "productName": "Electric Stove",
    "unitPrice": 184.96,
    "description": "The Electric Stove provides a portable and efficient cooking solution. Ideal for small kitchens or as an additional cooking surface for various culinary needs.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/electric-stove/thumbnail.webp",
    "availableQuantity": 21,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-FIN-057",
    "productName": "Fine Mesh Strainer",
    "unitPrice": 36.96,
    "description": "The Fine Mesh Strainer is a versatile tool for straining liquids and sifting dry ingredients. Its fine mesh ensures efficient filtering for smooth cooking and baking.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/fine-mesh-strainer/thumbnail.webp",
    "availableQuantity": 85,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-FOR-058",
    "productName": "Fork",
    "unitPrice": 34.76,
    "description": "The Fork is a classic utensil for various dining and serving purposes. Its durable and ergonomic design makes it a reliable choice for everyday use.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/fork/thumbnail.webp",
    "availableQuantity": 7,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-GLA-059",
    "productName": "Glass",
    "unitPrice": 38.46,
    "description": "The Glass is a versatile and elegant drinking vessel suitable for a variety of beverages. Its clear design allows you to enjoy the colors and textures of your drinks.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/glass/thumbnail.webp",
    "availableQuantity": 46,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-GRA-060",
    "productName": "Grater Black",
    "unitPrice": 40.66,
    "description": "The Grater in Black is a handy kitchen tool for grating cheese, vegetables, and more. Its sleek design and sharp blades make food preparation efficient and easy.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/grater-black/thumbnail.webp",
    "availableQuantity": 84,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-HAN-061",
    "productName": "Hand Blender",
    "unitPrice": 129.46,
    "description": "The Hand Blender is a versatile kitchen appliance for blending, pureeing, and mixing. Its compact design and powerful motor make it a convenient tool for various recipes.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/hand-blender/thumbnail.webp",
    "availableQuantity": 84,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-CUB-062",
    "productName": "Ice Cube Tray",
    "unitPrice": 42.16,
    "description": "The Ice Cube Tray is a practical accessory for making ice cubes in various shapes. Perfect for keeping your drinks cool and adding a fun element to your beverages.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/ice-cube-tray/thumbnail.webp",
    "availableQuantity": 13,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-KIT-063",
    "productName": "Kitchen Sieve",
    "unitPrice": 29.56,
    "description": "The Kitchen Sieve is a versatile tool for sifting and straining dry and wet ingredients. Its fine mesh design ensures smooth results in your cooking and baking.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/kitchen-sieve/thumbnail.webp",
    "availableQuantity": 68,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-KNI-064",
    "productName": "Knife",
    "unitPrice": 55.46,
    "description": "The Knife is an essential kitchen tool for chopping, slicing, and dicing. Its sharp blade and ergonomic handle make it a reliable choice for food preparation.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/knife/thumbnail.webp",
    "availableQuantity": 7,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-LUN-065",
    "productName": "Lunch Box",
    "unitPrice": 48.06,
    "description": "The Lunch Box is a convenient and portable container for packing and carrying your meals. With compartments for different foods, it's perfect for on-the-go dining.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/lunch-box/thumbnail.webp",
    "availableQuantity": 94,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-MIC-066",
    "productName": "Microwave Oven",
    "unitPrice": 332.96,
    "description": "The Microwave Oven is a versatile kitchen appliance for quick and efficient cooking, reheating, and defrosting. Its compact size makes it suitable for various kitchen setups.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/microwave-oven/thumbnail.webp",
    "availableQuantity": 59,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-TRE-067",
    "productName": "Mug Tree Stand",
    "unitPrice": 59.16,
    "description": "The Mug Tree Stand is a stylish and space-saving solution for organizing your mugs. Keep your favorite mugs easily accessible and neatly displayed in your kitchen.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/mug-tree-stand/thumbnail.webp",
    "availableQuantity": 88,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-PRD-068",
    "productName": "Pan",
    "unitPrice": 92.46,
    "description": "The Pan is a versatile and essential cookware item for frying, sautéing, and cooking various dishes. Its non-stick coating ensures easy food release and cleanup.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/pan/thumbnail.webp",
    "availableQuantity": 90,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-PLA-069",
    "productName": "Plate",
    "unitPrice": 34.76,
    "description": "The Plate is a classic and essential dishware item for serving meals. Its durable and stylish design makes it suitable for everyday use or special occasions.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/plate/thumbnail.webp",
    "availableQuantity": 66,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-TON-070",
    "productName": "Red Tongs",
    "unitPrice": 45.86,
    "description": "The Red Tongs are versatile kitchen tongs suitable for various cooking and serving tasks. Their vibrant color adds a pop of excitement to your kitchen utensils.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/red-tongs/thumbnail.webp",
    "availableQuantity": 82,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-SIL-071",
    "productName": "Silver Pot With Glass Cap",
    "unitPrice": 147.96,
    "description": "The Silver Pot with Glass Cap is a stylish and functional cookware item for boiling, simmering, and preparing delicious meals. Its glass cap allows you to monitor cooking progress.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/silver-pot-with-glass-cap/thumbnail.webp",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-SLO-072",
    "productName": "Slotted Turner",
    "unitPrice": 33.26,
    "description": "The Slotted Turner is a kitchen utensil designed for flipping and turning food items. Its slotted design allows excess liquid to drain, making it ideal for frying and sautéing.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/slotted-turner/thumbnail.webp",
    "availableQuantity": 88,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-SPI-073",
    "productName": "Spice Rack",
    "unitPrice": 73.96,
    "description": "The Spice Rack is a convenient organizer for your spices and seasonings. Keep your kitchen essentials within reach and neatly arranged with this stylish spice rack.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/spice-rack/thumbnail.webp",
    "availableQuantity": 79,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-SPO-074",
    "productName": "Spoon",
    "unitPrice": 38.46,
    "description": "The Spoon is a versatile kitchen utensil for stirring, serving, and tasting. Its ergonomic design and durable construction make it an essential tool for every kitchen.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/spoon/thumbnail.webp",
    "availableQuantity": 59,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-TRA-075",
    "productName": "Tray",
    "unitPrice": 62.86,
    "description": "The Tray is a functional and decorative item for serving snacks, appetizers, or drinks. Its stylish design makes it a versatile accessory for entertaining guests.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/tray/thumbnail.webp",
    "availableQuantity": 71,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-WOO-076",
    "productName": "Wooden Rolling Pin",
    "unitPrice": 44.36,
    "description": "The Wooden Rolling Pin is a classic kitchen tool for rolling out dough for baking. Its smooth surface and sturdy handles make it easy to achieve uniform thickness.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/wooden-rolling-pin/thumbnail.webp",
    "availableQuantity": 80,
    "reservedQuantity": 0
  },
  {
    "skuCode": "KIT-BRD-YEL-077",
    "productName": "Yellow Peeler",
    "unitPrice": 42.16,
    "description": "The Yellow Peeler is a handy tool for peeling fruits and vegetables with ease. Its bright yellow color adds a cheerful touch to your kitchen gadgets.",
    "category": "כלי מטבח",
    "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/yellow-peeler/thumbnail.webp",
    "availableQuantity": 35,
    "reservedQuantity": 0
  },
  {
    "skuCode": "LAP-APP-APP-078",
    "productName": "Apple MacBook Pro 14 Inch Space Grey",
    "unitPrice": 7399.96,
    "description": "The MacBook Pro 14 Inch in Space Grey is a powerful and sleek laptop, featuring Apple's M1 Pro chip for exceptional performance and a stunning Retina display.",
    "category": "מחשבים ניידים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/thumbnail.webp",
    "availableQuantity": 24,
    "reservedQuantity": 0
  },
  {
    "skuCode": "LAP-ASU-ASU-079",
    "productName": "Asus Zenbook Pro Dual Screen Laptop",
    "unitPrice": 6659.96,
    "description": "The Asus Zenbook Pro Dual Screen Laptop is a high-performance device with dual screens, providing productivity and versatility for creative professionals.",
    "category": "מחשבים ניידים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-laptop/thumbnail.webp",
    "availableQuantity": 45,
    "reservedQuantity": 0
  },
  {
    "skuCode": "LAP-HUA-HUA-080",
    "productName": "Huawei Matebook X Pro",
    "unitPrice": 5179.96,
    "description": "The Huawei Matebook X Pro is a slim and stylish laptop with a high-resolution touchscreen display, offering a premium experience for users on the go.",
    "category": "מחשבים ניידים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/laptops/huawei-matebook-x-pro/thumbnail.webp",
    "availableQuantity": 75,
    "reservedQuantity": 0
  },
  {
    "skuCode": "LAP-LEN-LEN-081",
    "productName": "Lenovo Yoga 920",
    "unitPrice": 4069.96,
    "description": "The Lenovo Yoga 920 is a 2-in-1 convertible laptop with a flexible hinge, allowing you to use it as a laptop or tablet, offering versatility and portability.",
    "category": "מחשבים ניידים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/laptops/lenovo-yoga-920/thumbnail.webp",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "LAP-DEL-DEL-082",
    "productName": "New DELL XPS 13 9300 Laptop",
    "unitPrice": 5549.96,
    "description": "The New DELL XPS 13 9300 Laptop is a compact and powerful device, featuring a virtually borderless InfinityEdge display and high-end performance for various tasks.",
    "category": "מחשבים ניידים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/laptops/new-dell-xps-13-9300-laptop/thumbnail.webp",
    "availableQuantity": 74,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MEN-FAS-BLU-083",
    "productName": "Blue & Black Check Shirt",
    "unitPrice": 110.96,
    "description": "The Blue & Black Check Shirt is a stylish and comfortable men's shirt featuring a classic check pattern. Made from high-quality fabric, it's suitable for both casual and semi-formal occasions.",
    "category": "אופנת גברים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/thumbnail.webp",
    "availableQuantity": 38,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MEN-GIG-GIG-084",
    "productName": "Gigabyte Aorus Men Tshirt",
    "unitPrice": 92.46,
    "description": "The Gigabyte Aorus Men Tshirt is a cool and casual shirt for gaming enthusiasts. With the Aorus logo and sleek design, it's perfect for expressing your gaming style.",
    "category": "אופנת גברים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/thumbnail.webp",
    "availableQuantity": 90,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MEN-CLA-PLA-085",
    "productName": "Man Plaid Shirt",
    "unitPrice": 129.46,
    "description": "The Man Plaid Shirt is a timeless and versatile men's shirt with a classic plaid pattern. Its comfortable fit and casual style make it a wardrobe essential for various occasions.",
    "category": "אופנת גברים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/thumbnail.webp",
    "availableQuantity": 82,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MEN-CAS-SHO-086",
    "productName": "Man Short Sleeve Shirt",
    "unitPrice": 73.96,
    "description": "The Man Short Sleeve Shirt is a breezy and stylish option for warm days. With a comfortable fit and short sleeves, it's perfect for a laid-back yet polished look.",
    "category": "אופנת גברים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/thumbnail.webp",
    "availableQuantity": 2,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MEN-URB-CHE-087",
    "productName": "Men Check Shirt",
    "unitPrice": 103.56,
    "description": "The Men Check Shirt is a classic and versatile shirt featuring a stylish check pattern. Suitable for various occasions, it adds a smart and polished touch to your wardrobe.",
    "category": "אופנת גברים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shirts/men-check-shirt/thumbnail.webp",
    "availableQuantity": 95,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MEN-NIK-NIK-088",
    "productName": "Nike Air Jordan 1 Red And Black",
    "unitPrice": 554.96,
    "description": "The Nike Air Jordan 1 in Red and Black is an iconic basketball sneaker known for its stylish design and high-performance features, making it a favorite among sneaker enthusiasts and athletes.",
    "category": "נעלי גברים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/thumbnail.webp",
    "availableQuantity": 7,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MEN-NIK-NIK-089",
    "productName": "Nike Baseball Cleats",
    "unitPrice": 295.96,
    "description": "Nike Baseball Cleats are designed for maximum traction and performance on the baseball field. They provide stability and support for players during games and practices.",
    "category": "נעלי גברים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shoes/nike-baseball-cleats/thumbnail.webp",
    "availableQuantity": 12,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MEN-PUM-PUM-090",
    "productName": "Puma Future Rider Trainers",
    "unitPrice": 332.96,
    "description": "The Puma Future Rider Trainers offer a blend of retro style and modern comfort. Perfect for casual wear, these trainers provide a fashionable and comfortable option for everyday use.",
    "category": "נעלי גברים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/thumbnail.webp",
    "availableQuantity": 90,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MEN-OFF-SPO-091",
    "productName": "Sports Sneakers Off White & Red",
    "unitPrice": 443.96,
    "description": "The Sports Sneakers in Off White and Red combine style and functionality, making them a fashionable choice for sports enthusiasts. The red and off-white color combination adds a bold and energetic touch.",
    "category": "נעלי גברים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-&-red/thumbnail.webp",
    "availableQuantity": 17,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MEN-OFF-SPO-092",
    "productName": "Sports Sneakers Off White Red",
    "unitPrice": 406.96,
    "description": "Another variant of the Sports Sneakers in Off White Red, featuring a unique design. These sneakers offer style and comfort for casual occasions.",
    "category": "נעלי גברים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-red/thumbnail.webp",
    "availableQuantity": 62,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MEN-FAS-BRO-093",
    "productName": "Brown Leather Belt Watch",
    "unitPrice": 332.96,
    "description": "The Brown Leather Belt Watch is a stylish timepiece with a classic design. Featuring a genuine leather strap and a sleek dial, it adds a touch of sophistication to your look.",
    "category": "שעוני גברים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/thumbnail.webp",
    "availableQuantity": 32,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MEN-LON-LON-094",
    "productName": "Longines Master Collection",
    "unitPrice": 5549.96,
    "description": "The Longines Master Collection is an elegant and refined watch known for its precision and craftsmanship. With a timeless design, it's a symbol of luxury and sophistication.",
    "category": "שעוני גברים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mens-watches/longines-master-collection/thumbnail.webp",
    "availableQuantity": 100,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MEN-ROL-ROL-095",
    "productName": "Rolex Cellini Date Black Dial",
    "unitPrice": 33299.96,
    "description": "The Rolex Cellini Date with Black Dial is a classic and prestigious watch. With a black dial and date complication, it exudes sophistication and is a symbol of Rolex's heritage.",
    "category": "שעוני גברים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-date-black-dial/thumbnail.webp",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MEN-ROL-ROL-096",
    "productName": "Rolex Cellini Moonphase",
    "unitPrice": 48099.96,
    "description": "The Rolex Cellini Moonphase is a masterpiece of horology, featuring a moon phase complication and exquisite design. It reflects Rolex's commitment to precision and elegance.",
    "category": "שעוני גברים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-moonphase/thumbnail.webp",
    "availableQuantity": 36,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MEN-ROL-ROL-097",
    "productName": "Rolex Datejust",
    "unitPrice": 40699.96,
    "description": "The Rolex Datejust is an iconic and versatile timepiece with a date window. Known for its timeless design and reliability, it's a symbol of Rolex's watchmaking excellence.",
    "category": "שעוני גברים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-datejust/thumbnail.webp",
    "availableQuantity": 86,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MEN-ROL-ROL-098",
    "productName": "Rolex Submariner Watch",
    "unitPrice": 51799.96,
    "description": "The Rolex Submariner is a legendary dive watch with a rich history. Known for its durability and water resistance, it's a symbol of adventure and exploration.",
    "category": "שעוני גברים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-submariner-watch/thumbnail.webp",
    "availableQuantity": 55,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MOB-AMA-AMA-099",
    "productName": "Amazon Echo Plus",
    "unitPrice": 369.96,
    "description": "The Amazon Echo Plus is a smart speaker with built-in Alexa voice control. It features premium sound quality and serves as a hub for controlling smart home devices.",
    "category": "אביזרי סלולר",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/thumbnail.webp",
    "availableQuantity": 61,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MOB-APP-APP-100",
    "productName": "Apple Airpods",
    "unitPrice": 480.96,
    "description": "The Apple Airpods offer a seamless wireless audio experience. With easy pairing, high-quality sound, and Siri integration, they are perfect for on-the-go listening.",
    "category": "אביזרי סלולר",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/thumbnail.webp",
    "availableQuantity": 67,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MOB-APP-APP-101",
    "productName": "Apple AirPods Max Silver",
    "unitPrice": 2034.96,
    "description": "The Apple AirPods Max in Silver are premium over-ear headphones with high-fidelity audio, adaptive EQ, and active noise cancellation. Experience immersive sound in style.",
    "category": "אביזרי סלולר",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/thumbnail.webp",
    "availableQuantity": 59,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MOB-APP-APP-102",
    "productName": "Apple Airpower Wireless Charger",
    "unitPrice": 295.96,
    "description": "The Apple AirPower Wireless Charger provides a convenient way to charge your compatible Apple devices wirelessly. Simply place your devices on the charging mat for effortless charging.",
    "category": "אביזרי סלולר",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpower-wireless-charger/thumbnail.webp",
    "availableQuantity": 1,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MOB-APP-APP-103",
    "productName": "Apple HomePod Mini Cosmic Grey",
    "unitPrice": 369.96,
    "description": "The Apple HomePod Mini in Cosmic Grey is a compact smart speaker that delivers impressive audio and integrates seamlessly with the Apple ecosystem for a smart home experience.",
    "category": "אביזרי סלולר",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-homepod-mini-cosmic-grey/thumbnail.webp",
    "availableQuantity": 27,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MOB-APP-APP-104",
    "productName": "Apple iPhone Charger",
    "unitPrice": 73.96,
    "description": "The Apple iPhone Charger is a high-quality charger designed for fast and efficient charging of your iPhone. Ensure your device stays powered up and ready to go.",
    "category": "אביזרי סלולר",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/thumbnail.webp",
    "availableQuantity": 31,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MOB-APP-APP-105",
    "productName": "Apple MagSafe Battery Pack",
    "unitPrice": 369.96,
    "description": "The Apple MagSafe Battery Pack is a portable and convenient way to add extra battery life to your MagSafe-compatible iPhone. Attach it magnetically for a secure connection.",
    "category": "אביזרי סלולר",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-magsafe-battery-pack/thumbnail.webp",
    "availableQuantity": 1,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MOB-APP-APP-106",
    "productName": "Apple Watch Series 4 Gold",
    "unitPrice": 1294.96,
    "description": "The Apple Watch Series 4 in Gold is a stylish and advanced smartwatch with features like heart rate monitoring, fitness tracking, and a beautiful Retina display.",
    "category": "אביזרי סלולר",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/thumbnail.webp",
    "availableQuantity": 33,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MOB-BEA-BEA-107",
    "productName": "Beats Flex Wireless Earphones",
    "unitPrice": 184.96,
    "description": "The Beats Flex Wireless Earphones offer a comfortable and versatile audio experience. With magnetic earbuds and up to 12 hours of battery life, they are ideal for everyday use.",
    "category": "אביזרי סלולר",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/beats-flex-wireless-earphones/thumbnail.webp",
    "availableQuantity": 50,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MOB-APP-IPH-108",
    "productName": "iPhone 12 Silicone Case with MagSafe Plum",
    "unitPrice": 110.96,
    "description": "The iPhone 12 Silicone Case with MagSafe in Plum is a stylish and protective case designed for the iPhone 12. It features MagSafe technology for easy attachment of accessories.",
    "category": "אביזרי סלולר",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/iphone-12-silicone-case-with-magsafe-plum/thumbnail.webp",
    "availableQuantity": 69,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MOB-TEC-MON-109",
    "productName": "Monopod",
    "unitPrice": 73.96,
    "description": "The Monopod is a versatile camera accessory for stable and adjustable shooting. Perfect for capturing selfies, group photos, and videos with ease.",
    "category": "אביזרי סלולר",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/monopod/thumbnail.webp",
    "availableQuantity": 48,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MOB-GAD-SEL-110",
    "productName": "Selfie Lamp with iPhone",
    "unitPrice": 55.46,
    "description": "The Selfie Lamp with iPhone is a portable and adjustable LED light designed to enhance your selfies and video calls. Attach it to your iPhone for well-lit photos.",
    "category": "אביזרי סלולר",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-lamp-with-iphone/thumbnail.webp",
    "availableQuantity": 58,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MOB-SNA-SEL-111",
    "productName": "Selfie Stick Monopod",
    "unitPrice": 48.06,
    "description": "The Selfie Stick Monopod is a extendable and foldable device for capturing the perfect selfie or group photo. Compatible with smartphones and cameras.",
    "category": "אביזרי סלולר",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-stick-monopod/thumbnail.webp",
    "availableQuantity": 11,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MOB-PRO-STU-112",
    "productName": "TV Studio Camera Pedestal",
    "unitPrice": 1849.96,
    "description": "The TV Studio Camera Pedestal is a professional-grade camera support system for smooth and precise camera movements in a studio setting. Ideal for broadcast and production.",
    "category": "אביזרי סלולר",
    "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/tv-studio-camera-pedestal/thumbnail.webp",
    "availableQuantity": 15,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MOT-GEN-GEN-113",
    "productName": "Generic Motorcycle",
    "unitPrice": 14799.96,
    "description": "The Generic Motorcycle is a versatile and reliable bike suitable for various riding preferences. With a balanced design, it provides a comfortable and efficient riding experience.",
    "category": "אופנועים ורכב",
    "imageUrl": "https://cdn.dummyjson.com/product-images/motorcycle/generic-motorcycle/thumbnail.webp",
    "availableQuantity": 34,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MOT-KAW-KAW-114",
    "productName": "Kawasaki Z800",
    "unitPrice": 33299.96,
    "description": "The Kawasaki Z800 is a powerful and agile sportbike known for its striking design and performance. It's equipped with advanced features, making it a favorite among motorcycle enthusiasts.",
    "category": "אופנועים ורכב",
    "imageUrl": "https://cdn.dummyjson.com/product-images/motorcycle/kawasaki-z800/thumbnail.webp",
    "availableQuantity": 52,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MOT-MOT-MOT-115",
    "productName": "MotoGP CI.H1",
    "unitPrice": 55499.96,
    "description": "The MotoGP CI.H1 is a high-performance motorcycle inspired by MotoGP racing technology. It offers cutting-edge features and precision engineering for an exhilarating riding experience.",
    "category": "אופנועים ורכב",
    "imageUrl": "https://cdn.dummyjson.com/product-images/motorcycle/motogp-ci.h1/thumbnail.webp",
    "availableQuantity": 10,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MOT-SCO-SCO-116",
    "productName": "Scooter Motorcycle",
    "unitPrice": 11099.96,
    "description": "The Scooter Motorcycle is a practical and fuel-efficient bike ideal for urban commuting. It features a step-through design and user-friendly controls for easy maneuverability.",
    "category": "אופנועים ורכב",
    "imageUrl": "https://cdn.dummyjson.com/product-images/motorcycle/scooter-motorcycle/thumbnail.webp",
    "availableQuantity": 84,
    "reservedQuantity": 0
  },
  {
    "skuCode": "MOT-SPE-SPO-117",
    "productName": "Sportbike Motorcycle",
    "unitPrice": 27749.96,
    "description": "The Sportbike Motorcycle is designed for speed and agility, with a sleek and aerodynamic profile. It's suitable for riders looking for a dynamic and thrilling riding experience.",
    "category": "אופנועים ורכב",
    "imageUrl": "https://cdn.dummyjson.com/product-images/motorcycle/sportbike-motorcycle/thumbnail.webp",
    "availableQuantity": 0,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SKI-ATT-ATT-118",
    "productName": "Attitude Super Leaves Hand Soap",
    "unitPrice": 33.26,
    "description": "Attitude Super Leaves Hand Soap is a natural and nourishing hand soap enriched with the goodness of super leaves. It cleanses and moisturizes your hands, leaving them feeling fresh and soft.",
    "category": "טיפוח וקוסמטיקה",
    "imageUrl": "https://cdn.dummyjson.com/product-images/skin-care/attitude-super-leaves-hand-soap/thumbnail.webp",
    "availableQuantity": 94,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SKI-OLA-OLA-119",
    "productName": "Olay Ultra Moisture Shea Butter Body Wash",
    "unitPrice": 48.06,
    "description": "Olay Ultra Moisture Shea Butter Body Wash is a luxurious body wash that hydrates and nourishes your skin with the moisturizing power of shea butter. Enjoy a rich lather and silky-smooth skin.",
    "category": "טיפוח וקוסמטיקה",
    "imageUrl": "https://cdn.dummyjson.com/product-images/skin-care/olay-ultra-moisture-shea-butter-body-wash/thumbnail.webp",
    "availableQuantity": 34,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SKI-VAS-VAS-120",
    "productName": "Vaseline Men Body and Face Lotion",
    "unitPrice": 36.96,
    "description": "Vaseline Men Body and Face Lotion is a specially formulated lotion designed to provide long-lasting moisture to men's skin. It absorbs quickly and helps keep the skin hydrated and healthy.",
    "category": "טיפוח וקוסמטיקה",
    "imageUrl": "https://cdn.dummyjson.com/product-images/skin-care/vaseline-men-body-and-face-lotion/thumbnail.webp",
    "availableQuantity": 95,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SMA-APP-IPH-121",
    "productName": "iPhone 5s",
    "unitPrice": 739.96,
    "description": "The iPhone 5s is a classic smartphone known for its compact design and advanced features during its release. While it's an older model, it still provides a reliable user experience.",
    "category": "סמארטפונים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp",
    "availableQuantity": 25,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SMA-APP-IPH-122",
    "productName": "iPhone 6",
    "unitPrice": 1109.96,
    "description": "The iPhone 6 is a stylish and capable smartphone with a larger display and improved performance. It introduced new features and design elements, making it a popular choice in its time.",
    "category": "סמארטפונים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-6/thumbnail.webp",
    "availableQuantity": 60,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SMA-APP-IPH-123",
    "productName": "iPhone 13 Pro",
    "unitPrice": 4069.96,
    "description": "The iPhone 13 Pro is a cutting-edge smartphone with a powerful camera system, high-performance chip, and stunning display. It offers advanced features for users who demand top-notch technology.",
    "category": "סמארטפונים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/thumbnail.webp",
    "availableQuantity": 56,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SMA-APP-IPH-124",
    "productName": "iPhone X",
    "unitPrice": 3329.96,
    "description": "The iPhone X is a flagship smartphone featuring a bezel-less OLED display, facial recognition technology (Face ID), and impressive performance. It represents a milestone in iPhone design and innovation.",
    "category": "סמארטפונים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-x/thumbnail.webp",
    "availableQuantity": 37,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SMA-OPP-OPP-125",
    "productName": "Oppo A57",
    "unitPrice": 924.96,
    "description": "The Oppo A57 is a mid-range smartphone known for its sleek design and capable features. It offers a balance of performance and affordability, making it a popular choice.",
    "category": "סמארטפונים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/oppo-a57/thumbnail.webp",
    "availableQuantity": 19,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SMA-OPP-OPP-126",
    "productName": "Oppo F19 Pro Plus",
    "unitPrice": 1479.96,
    "description": "The Oppo F19 Pro Plus is a feature-rich smartphone with a focus on camera capabilities. It boasts advanced photography features and a powerful performance for a premium user experience.",
    "category": "סמארטפונים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/oppo-f19-pro-plus/thumbnail.webp",
    "availableQuantity": 78,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SMA-OPP-OPP-127",
    "productName": "Oppo K1",
    "unitPrice": 1109.96,
    "description": "The Oppo K1 series offers a range of smartphones with various features and specifications. Known for their stylish design and reliable performance, the Oppo K1 series caters to diverse user preferences.",
    "category": "סמארטפונים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/oppo-k1/thumbnail.webp",
    "availableQuantity": 55,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SMA-REA-REA-128",
    "productName": "Realme C35",
    "unitPrice": 554.96,
    "description": "The Realme C35 is a budget-friendly smartphone with a focus on providing essential features for everyday use. It offers a reliable performance and user-friendly experience.",
    "category": "סמארטפונים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/realme-c35/thumbnail.webp",
    "availableQuantity": 48,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SMA-REA-REA-129",
    "productName": "Realme X",
    "unitPrice": 1109.96,
    "description": "The Realme X is a mid-range smartphone known for its sleek design and impressive display. It offers a good balance of performance and camera capabilities for users seeking a quality device.",
    "category": "סמארטפונים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/realme-x/thumbnail.webp",
    "availableQuantity": 12,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SMA-REA-REA-130",
    "productName": "Realme XT",
    "unitPrice": 1294.96,
    "description": "The Realme XT is a feature-rich smartphone with a focus on camera technology. It comes equipped with advanced camera sensors, delivering high-quality photos and videos for photography enthusiasts.",
    "category": "סמארטפונים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/realme-xt/thumbnail.webp",
    "availableQuantity": 80,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SMA-SAM-SAM-131",
    "productName": "Samsung Galaxy S7",
    "unitPrice": 1109.96,
    "description": "The Samsung Galaxy S7 is a flagship smartphone known for its sleek design and advanced features. It features a high-resolution display, powerful camera, and robust performance.",
    "category": "סמארטפונים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s7/thumbnail.webp",
    "availableQuantity": 67,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SMA-SAM-SAM-132",
    "productName": "Samsung Galaxy S8",
    "unitPrice": 1849.96,
    "description": "The Samsung Galaxy S8 is a premium smartphone with an Infinity Display, offering a stunning visual experience. It boasts advanced camera capabilities and cutting-edge technology.",
    "category": "סמארטפונים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s8/thumbnail.webp",
    "availableQuantity": 0,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SMA-SAM-SAM-133",
    "productName": "Samsung Galaxy S10",
    "unitPrice": 2589.96,
    "description": "The Samsung Galaxy S10 is a flagship device featuring a dynamic AMOLED display, versatile camera system, and powerful performance. It represents innovation and excellence in smartphone technology.",
    "category": "סמארטפונים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s10/thumbnail.webp",
    "availableQuantity": 19,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SMA-VIV-VIV-134",
    "productName": "Vivo S1",
    "unitPrice": 924.96,
    "description": "The Vivo S1 is a stylish and mid-range smartphone offering a blend of design and performance. It features a vibrant display, capable camera system, and reliable functionality.",
    "category": "סמארטפונים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/vivo-s1/thumbnail.webp",
    "availableQuantity": 50,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SMA-VIV-VIV-135",
    "productName": "Vivo V9",
    "unitPrice": 1109.96,
    "description": "The Vivo V9 is a smartphone known for its sleek design and emphasis on capturing high-quality selfies. It features a notch display, dual-camera setup, and a modern design.",
    "category": "סמארטפונים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/vivo-v9/thumbnail.webp",
    "availableQuantity": 82,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SMA-VIV-VIV-136",
    "productName": "Vivo X21",
    "unitPrice": 1849.96,
    "description": "The Vivo X21 is a premium smartphone with a focus on cutting-edge technology. It features an in-display fingerprint sensor, a high-resolution display, and advanced camera capabilities.",
    "category": "סמארטפונים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/vivo-x21/thumbnail.webp",
    "availableQuantity": 7,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SPO-BRD-AME-137",
    "productName": "American Football",
    "unitPrice": 73.96,
    "description": "The American Football is a classic ball used in American football games. It is designed for throwing and catching, making it an essential piece of equipment for the sport.",
    "category": "כושר וספורט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/american-football/thumbnail.webp",
    "availableQuantity": 53,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SPO-BRD-BAS-138",
    "productName": "Baseball Ball",
    "unitPrice": 33.26,
    "description": "The Baseball Ball is a standard baseball used in baseball games. It features a durable leather cover and is designed for pitching, hitting, and fielding in the game of baseball.",
    "category": "כושר וספורט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-ball/thumbnail.webp",
    "availableQuantity": 100,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SPO-BRD-BAS-139",
    "productName": "Baseball Glove",
    "unitPrice": 92.46,
    "description": "The Baseball Glove is a protective glove worn by baseball players. It is designed to catch and field the baseball, providing players with comfort and control during the game.",
    "category": "כושר וספורט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-glove/thumbnail.webp",
    "availableQuantity": 22,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SPO-BRD-BAS-140",
    "productName": "Basketball",
    "unitPrice": 55.46,
    "description": "The Basketball is a standard ball used in basketball games. It is designed for dribbling, shooting, and passing in the game of basketball, suitable for both indoor and outdoor play.",
    "category": "כושר וספורט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/basketball/thumbnail.webp",
    "availableQuantity": 75,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SPO-BRD-BAS-141",
    "productName": "Basketball Rim",
    "unitPrice": 147.96,
    "description": "The Basketball Rim is a sturdy hoop and net assembly mounted on a basketball backboard. It provides a target for shooting and scoring in the game of basketball.",
    "category": "כושר וספורט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/basketball-rim/thumbnail.webp",
    "availableQuantity": 43,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SPO-BRD-CRI-142",
    "productName": "Cricket Ball",
    "unitPrice": 48.06,
    "description": "The Cricket Ball is a hard leather ball used in the sport of cricket. It is bowled and batted in the game, and its hardness and seam contribute to the dynamics of cricket play.",
    "category": "כושר וספורט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-ball/thumbnail.webp",
    "availableQuantity": 30,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SPO-BRD-CRI-143",
    "productName": "Cricket Bat",
    "unitPrice": 110.96,
    "description": "The Cricket Bat is an essential piece of cricket equipment used by batsmen to hit the cricket ball. It is made of wood and comes in various sizes and designs.",
    "category": "כושר וספורט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-bat/thumbnail.webp",
    "availableQuantity": 98,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SPO-BRD-CRI-144",
    "productName": "Cricket Helmet",
    "unitPrice": 166.46,
    "description": "The Cricket Helmet is a protective headgear worn by cricket players, especially batsmen and wicketkeepers. It provides protection against fast bowling and bouncers.",
    "category": "כושר וספורט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-helmet/thumbnail.webp",
    "availableQuantity": 10,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SPO-BRD-CRI-145",
    "productName": "Cricket Wicket",
    "unitPrice": 110.96,
    "description": "The Cricket Wicket is a set of three stumps and two bails, forming a wicket used in the sport of cricket. Batsmen aim to protect the wicket while scoring runs.",
    "category": "כושר וספורט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-wicket/thumbnail.webp",
    "availableQuantity": 25,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SPO-BRD-FEA-146",
    "productName": "Feather Shuttlecock",
    "unitPrice": 42.16,
    "description": "The Feather Shuttlecock is used in the sport of badminton. It features natural feathers and is designed for high-speed play, providing stability and accuracy during matches.",
    "category": "כושר וספורט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/feather-shuttlecock/thumbnail.webp",
    "availableQuantity": 95,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SPO-BRD-FOO-147",
    "productName": "Football",
    "unitPrice": 66.56,
    "description": "The Football, also known as a soccer ball, is the standard ball used in the sport of football (soccer). It is designed for kicking and passing in the game.",
    "category": "כושר וספורט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/football/thumbnail.webp",
    "availableQuantity": 96,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SPO-BRD-GOL-148",
    "productName": "Golf Ball",
    "unitPrice": 36.96,
    "description": "The Golf Ball is a small ball used in the sport of golf. It features dimples on its surface, providing aerodynamic lift and distance when struck by a golf club.",
    "category": "כושר וספורט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/golf-ball/thumbnail.webp",
    "availableQuantity": 84,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SPO-BRD-IRO-149",
    "productName": "Iron Golf",
    "unitPrice": 184.96,
    "description": "The Iron Golf is a type of golf club designed for various golf shots. It features a solid metal head and is used for approach shots, chipping, and other golfing techniques.",
    "category": "כושר וספורט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/iron-golf/thumbnail.webp",
    "availableQuantity": 90,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SPO-BRD-MET-150",
    "productName": "Metal Baseball Bat",
    "unitPrice": 110.96,
    "description": "The Metal Baseball Bat is a durable and lightweight baseball bat made from metal alloys. It is commonly used in baseball games for hitting and batting practice.",
    "category": "כושר וספורט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/metal-baseball-bat/thumbnail.webp",
    "availableQuantity": 16,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SPO-BRD-TEN-151",
    "productName": "Tennis Ball",
    "unitPrice": 45.86,
    "description": "The Tennis Ball is a standard ball used in the sport of tennis. It is designed for bouncing and hitting with tennis rackets during matches or practice sessions.",
    "category": "כושר וספורט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/tennis-ball/thumbnail.webp",
    "availableQuantity": 28,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SPO-BRD-TEN-152",
    "productName": "Tennis Racket",
    "unitPrice": 184.96,
    "description": "The Tennis Racket is an essential piece of equipment used in the sport of tennis. It features a frame with strings and a grip, allowing players to hit the tennis ball.",
    "category": "כושר וספורט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/tennis-racket/thumbnail.webp",
    "availableQuantity": 6,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SPO-BRD-VOL-153",
    "productName": "Volleyball",
    "unitPrice": 44.36,
    "description": "The Volleyball is a standard ball used in the sport of volleyball. It is designed for passing, setting, and spiking over the net during volleyball matches.",
    "category": "כושר וספורט",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/volleyball/thumbnail.webp",
    "availableQuantity": 0,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SUN-FAS-BLA-154",
    "productName": "Black Sun Glasses",
    "unitPrice": 110.96,
    "description": "The Black Sun Glasses are a classic and stylish choice, featuring a sleek black frame and tinted lenses. They provide both UV protection and a fashionable look.",
    "category": "משקפי שמש",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/thumbnail.webp",
    "availableQuantity": 60,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SUN-FAS-CLA-155",
    "productName": "Classic Sun Glasses",
    "unitPrice": 92.46,
    "description": "The Classic Sun Glasses offer a timeless design with a neutral frame and UV-protected lenses. These sunglasses are versatile and suitable for various occasions.",
    "category": "משקפי שמש",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/thumbnail.webp",
    "availableQuantity": 1,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SUN-FAS-GRE-156",
    "productName": "Green and Black Glasses",
    "unitPrice": 129.46,
    "description": "The Green and Black Glasses feature a bold combination of green and black colors, adding a touch of vibrancy to your eyewear collection. They are both stylish and eye-catching.",
    "category": "משקפי שמש",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sunglasses/green-and-black-glasses/thumbnail.webp",
    "availableQuantity": 24,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SUN-FAS-PAR-157",
    "productName": "Party Glasses",
    "unitPrice": 73.96,
    "description": "The Party Glasses are designed to add flair to your party outfit. With unique shapes or colorful frames, they're perfect for adding a playful touch to your look during celebrations.",
    "category": "משקפי שמש",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sunglasses/party-glasses/thumbnail.webp",
    "availableQuantity": 86,
    "reservedQuantity": 0
  },
  {
    "skuCode": "SUN-FAS-SUN-158",
    "productName": "Sunglasses",
    "unitPrice": 85.06,
    "description": "The Sunglasses offer a classic and simple design with a focus on functionality. These sunglasses provide essential UV protection while maintaining a timeless look.",
    "category": "משקפי שמש",
    "imageUrl": "https://cdn.dummyjson.com/product-images/sunglasses/sunglasses/thumbnail.webp",
    "availableQuantity": 27,
    "reservedQuantity": 0
  },
  {
    "skuCode": "TAB-APP-IPA-159",
    "productName": "iPad Mini 2021 Starlight",
    "unitPrice": 1849.96,
    "description": "The iPad Mini 2021 in Starlight is a compact and powerful tablet from Apple. Featuring a stunning Retina display, powerful A-series chip, and a sleek design, it offers a premium tablet experience.",
    "category": "טאבלטים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/tablets/ipad-mini-2021-starlight/thumbnail.webp",
    "availableQuantity": 47,
    "reservedQuantity": 0
  },
  {
    "skuCode": "TAB-SAM-SAM-160",
    "productName": "Samsung Galaxy Tab S8 Plus Grey",
    "unitPrice": 2219.96,
    "description": "The Samsung Galaxy Tab S8 Plus in Grey is a high-performance Android tablet by Samsung. With a large AMOLED display, powerful processor, and S Pen support, it's ideal for productivity and entertainment.",
    "category": "טאבלטים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/tablets/samsung-galaxy-tab-s8-plus-grey/thumbnail.webp",
    "availableQuantity": 62,
    "reservedQuantity": 0
  },
  {
    "skuCode": "TAB-SAM-SAM-161",
    "productName": "Samsung Galaxy Tab White",
    "unitPrice": 1294.96,
    "description": "The Samsung Galaxy Tab in White is a sleek and versatile Android tablet. With a vibrant display, long-lasting battery, and a range of features, it offers a great user experience for various tasks.",
    "category": "טאבלטים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/tablets/samsung-galaxy-tab-white/thumbnail.webp",
    "availableQuantity": 92,
    "reservedQuantity": 0
  },
  {
    "skuCode": "TOP-BRD-BLU-162",
    "productName": "Blue Frock",
    "unitPrice": 110.96,
    "description": "The Blue Frock is a charming and stylish dress for various occasions. With a vibrant blue color and a comfortable design, it adds a touch of elegance to your wardrobe.",
    "category": "אופנה וביגוד",
    "imageUrl": "https://cdn.dummyjson.com/product-images/tops/blue-frock/thumbnail.webp",
    "availableQuantity": 52,
    "reservedQuantity": 0
  },
  {
    "skuCode": "TOP-BRD-GIR-163",
    "productName": "Girl Summer Dress",
    "unitPrice": 73.96,
    "description": "The Girl Summer Dress is a cute and breezy dress designed for warm weather. With playful patterns and lightweight fabric, it's perfect for keeping cool and stylish during the summer.",
    "category": "אופנה וביגוד",
    "imageUrl": "https://cdn.dummyjson.com/product-images/tops/girl-summer-dress/thumbnail.webp",
    "availableQuantity": 43,
    "reservedQuantity": 0
  },
  {
    "skuCode": "TOP-BRD-GRA-164",
    "productName": "Gray Dress",
    "unitPrice": 129.46,
    "description": "The Gray Dress is a versatile and chic option for various occasions. With a neutral gray color, it can be dressed up or down, making it a wardrobe staple for any fashion-forward individual.",
    "category": "אופנה וביגוד",
    "imageUrl": "https://cdn.dummyjson.com/product-images/tops/gray-dress/thumbnail.webp",
    "availableQuantity": 55,
    "reservedQuantity": 0
  },
  {
    "skuCode": "TOP-BRD-SHO-165",
    "productName": "Short Frock",
    "unitPrice": 92.46,
    "description": "The Short Frock is a playful and trendy dress with a shorter length. Ideal for casual outings or special occasions, it combines style and comfort for a fashionable look.",
    "category": "אופנה וביגוד",
    "imageUrl": "https://cdn.dummyjson.com/product-images/tops/short-frock/thumbnail.webp",
    "availableQuantity": 22,
    "reservedQuantity": 0
  },
  {
    "skuCode": "TOP-BRD-TAR-166",
    "productName": "Tartan Dress",
    "unitPrice": 147.96,
    "description": "The Tartan Dress features a classic tartan pattern, bringing a timeless and sophisticated touch to your wardrobe. Perfect for fall and winter, it adds a hint of traditional charm.",
    "category": "אופנה וביגוד",
    "imageUrl": "https://cdn.dummyjson.com/product-images/tops/tartan-dress/thumbnail.webp",
    "availableQuantity": 73,
    "reservedQuantity": 0
  },
  {
    "skuCode": "VEH-CHR-TOU-167",
    "productName": "300 Touring",
    "unitPrice": 107299.96,
    "description": "The 300 Touring is a stylish and comfortable sedan, known for its luxurious features and smooth performance.",
    "category": "רכב ותחבורה",
    "imageUrl": "https://cdn.dummyjson.com/product-images/vehicle/300-touring/thumbnail.webp",
    "availableQuantity": 54,
    "reservedQuantity": 0
  },
  {
    "skuCode": "VEH-DOD-CHA-168",
    "productName": "Charger SXT RWD",
    "unitPrice": 122099.96,
    "description": "The Charger SXT RWD is a powerful and sporty rear-wheel-drive sedan, offering a blend of performance and practicality.",
    "category": "רכב ותחבורה",
    "imageUrl": "https://cdn.dummyjson.com/product-images/vehicle/charger-sxt-rwd/thumbnail.webp",
    "availableQuantity": 57,
    "reservedQuantity": 0
  },
  {
    "skuCode": "VEH-DOD-DOD-169",
    "productName": "Dodge Hornet GT Plus",
    "unitPrice": 92499.96,
    "description": "The Dodge Hornet GT Plus is a compact and agile hatchback, perfect for urban driving with a touch of sportiness.",
    "category": "רכב ותחבורה",
    "imageUrl": "https://cdn.dummyjson.com/product-images/vehicle/dodge-hornet-gt-plus/thumbnail.webp",
    "availableQuantity": 82,
    "reservedQuantity": 0
  },
  {
    "skuCode": "VEH-DOD-DUR-170",
    "productName": "Durango SXT RWD",
    "unitPrice": 136899.96,
    "description": "The Durango SXT RWD is a spacious and versatile SUV, known for its strong performance and family-friendly features.",
    "category": "רכב ותחבורה",
    "imageUrl": "https://cdn.dummyjson.com/product-images/vehicle/durango-sxt-rwd/thumbnail.webp",
    "availableQuantity": 95,
    "reservedQuantity": 0
  },
  {
    "skuCode": "VEH-CHR-PAC-171",
    "productName": "Pacifica Touring",
    "unitPrice": 118399.96,
    "description": "The Pacifica Touring is a stylish and well-equipped minivan, offering comfort and convenience for family journeys.",
    "category": "רכב ותחבורה",
    "imageUrl": "https://cdn.dummyjson.com/product-images/vehicle/pacifica-touring/thumbnail.webp",
    "availableQuantity": 53,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-FAS-BLU-172",
    "productName": "Blue Women's Handbag",
    "unitPrice": 184.96,
    "description": "The Blue Women's Handbag is a stylish and spacious accessory for everyday use. With a vibrant blue color and multiple compartments, it combines fashion and functionality.",
    "category": "תיקי נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-bags/blue-women's-handbag/thumbnail.webp",
    "availableQuantity": 76,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-HES-HES-173",
    "productName": "Heshe Women's Leather Bag",
    "unitPrice": 480.96,
    "description": "The Heshe Women's Leather Bag is a luxurious and high-quality leather bag for the sophisticated woman. With a timeless design and durable craftsmanship, it's a versatile accessory.",
    "category": "תיקי נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-bags/heshe-women's-leather-bag/thumbnail.webp",
    "availableQuantity": 99,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-PRA-PRA-174",
    "productName": "Prada Women Bag",
    "unitPrice": 2219.96,
    "description": "The Prada Women Bag is an iconic designer bag that exudes elegance and luxury. Crafted with precision and featuring the Prada logo, it's a statement piece for fashion enthusiasts.",
    "category": "תיקי נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-bags/prada-women-bag/thumbnail.webp",
    "availableQuantity": 75,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-URB-WHI-175",
    "productName": "White Faux Leather Backpack",
    "unitPrice": 147.96,
    "description": "The White Faux Leather Backpack is a trendy and practical backpack for the modern woman. With a sleek white design and ample storage space, it's perfect for both casual and on-the-go styles.",
    "category": "תיקי נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-bags/white-faux-leather-backpack/thumbnail.webp",
    "availableQuantity": 39,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-ELE-WOM-176",
    "productName": "Women Handbag Black",
    "unitPrice": 221.96,
    "description": "The Women Handbag in Black is a classic and versatile accessory that complements various outfits. With a timeless black color and functional design, it's a must-have in every woman's wardrobe.",
    "category": "תיקי נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-bags/women-handbag-black/thumbnail.webp",
    "availableQuantity": 11,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-BRD-BLA-177",
    "productName": "Black Women's Gown",
    "unitPrice": 480.96,
    "description": "The Black Women's Gown is an elegant and timeless evening gown. With a sleek black design, it's perfect for formal events and special occasions, exuding sophistication and style.",
    "category": "שמלות נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-dresses/black-women's-gown/thumbnail.webp",
    "availableQuantity": 25,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-BRD-COR-178",
    "productName": "Corset Leather With Skirt",
    "unitPrice": 332.96,
    "description": "The Corset Leather With Skirt is a bold and edgy ensemble that combines a stylish corset with a matching skirt. Ideal for fashion-forward individuals, it makes a statement at any event.",
    "category": "שמלות נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-dresses/corset-leather-with-skirt/thumbnail.webp",
    "availableQuantity": 30,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-BRD-COR-179",
    "productName": "Corset With Black Skirt",
    "unitPrice": 295.96,
    "description": "The Corset With Black Skirt is a chic and versatile outfit that pairs a fashionable corset with a classic black skirt. It offers a trendy and coordinated look for various occasions.",
    "category": "שמלות נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-dresses/corset-with-black-skirt/thumbnail.webp",
    "availableQuantity": 33,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-BRD-DRE-180",
    "productName": "Dress Pea",
    "unitPrice": 184.96,
    "description": "The Dress Pea is a stylish and comfortable dress with a pea pattern. Perfect for casual outings, it adds a playful and fun element to your wardrobe, making it a great choice for day-to-day wear.",
    "category": "שמלות נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-dresses/dress-pea/thumbnail.webp",
    "availableQuantity": 6,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-BRD-MAR-181",
    "productName": "Marni Red & Black Suit",
    "unitPrice": 665.96,
    "description": "The Marni Red & Black Suit is a sophisticated and fashion-forward suit ensemble. With a combination of red and black tones, it showcases a modern design for a bold and confident look.",
    "category": "שמלות נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-dresses/marni-red-&-black-suit/thumbnail.webp",
    "availableQuantity": 62,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-BRD-GRE-182",
    "productName": "Green Crystal Earring",
    "unitPrice": 110.96,
    "description": "The Green Crystal Earring is a dazzling accessory that features a vibrant green crystal. With a classic design, it adds a touch of elegance to your ensemble, perfect for formal or special occasions.",
    "category": "תכשיטי יוקרה",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-jewellery/green-crystal-earring/thumbnail.webp",
    "availableQuantity": 54,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-BRD-GRE-183",
    "productName": "Green Oval Earring",
    "unitPrice": 92.46,
    "description": "The Green Oval Earring is a stylish and versatile accessory with a unique oval shape. Whether for casual or dressy occasions, its green hue and contemporary design make it a standout piece.",
    "category": "תכשיטי יוקרה",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-jewellery/green-oval-earring/thumbnail.webp",
    "availableQuantity": 73,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-BRD-TRO-184",
    "productName": "Tropical Earring",
    "unitPrice": 73.96,
    "description": "The Tropical Earring is a fun and playful accessory inspired by tropical elements. Featuring vibrant colors and a lively design, it's perfect for adding a touch of summer to your look.",
    "category": "תכשיטי יוקרה",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-jewellery/tropical-earring/thumbnail.webp",
    "availableQuantity": 1,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-COM-BLA-185",
    "productName": "Black & Brown Slipper",
    "unitPrice": 73.96,
    "description": "The Black & Brown Slipper is a comfortable and stylish choice for casual wear. Featuring a blend of black and brown colors, it adds a touch of sophistication to your relaxation.",
    "category": "נעלי נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-shoes/black-&-brown-slipper/thumbnail.webp",
    "availableQuantity": 3,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-CAL-CAL-186",
    "productName": "Calvin Klein Heel Shoes",
    "unitPrice": 295.96,
    "description": "Calvin Klein Heel Shoes are elegant and sophisticated, designed for formal occasions. With a classic design and high-quality materials, they complement your stylish ensemble.",
    "category": "נעלי נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-shoes/calvin-klein-heel-shoes/thumbnail.webp",
    "availableQuantity": 93,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-FAS-GOL-187",
    "productName": "Golden Shoes Woman",
    "unitPrice": 184.96,
    "description": "The Golden Shoes for Women are a glamorous choice for special occasions. Featuring a golden hue and stylish design, they add a touch of luxury to your outfit.",
    "category": "נעלי נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-shoes/golden-shoes-woman/thumbnail.webp",
    "availableQuantity": 88,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-PAM-PAM-188",
    "productName": "Pampi Shoes",
    "unitPrice": 110.96,
    "description": "Pampi Shoes offer a blend of comfort and style for everyday use. With a versatile design, they are suitable for various casual occasions, providing a trendy and relaxed look.",
    "category": "נעלי נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-shoes/pampi-shoes/thumbnail.webp",
    "availableQuantity": 49,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-FAS-SHO-189",
    "productName": "Red Shoes",
    "unitPrice": 129.46,
    "description": "The Red Shoes make a bold statement with their vibrant red color. Whether for a party or a casual outing, these shoes add a pop of color and style to your wardrobe.",
    "category": "נעלי נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-shoes/red-shoes/thumbnail.webp",
    "availableQuantity": 7,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-IWC-ING-190",
    "productName": "IWC Ingenieur Automatic Steel",
    "unitPrice": 18499.96,
    "description": "The IWC Ingenieur Automatic Steel watch is a durable and sophisticated timepiece. With a stainless steel case and automatic movement, it combines precision and style for watch enthusiasts.",
    "category": "שעוני נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-watches/iwc-ingenieur-automatic-steel/thumbnail.webp",
    "availableQuantity": 90,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-ROL-ROL-191",
    "productName": "Rolex Cellini Moonphase",
    "unitPrice": 59199.96,
    "description": "The Rolex Cellini Moonphase watch is a masterpiece of horology. Featuring a moon phase complication, it showcases the craftsmanship and elegance that Rolex is renowned for.",
    "category": "שעוני נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-watches/rolex-cellini-moonphase/thumbnail.webp",
    "availableQuantity": 52,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-ROL-ROL-192",
    "productName": "Rolex Datejust Women",
    "unitPrice": 40699.96,
    "description": "The Rolex Datejust Women's watch is an iconic timepiece designed for women. With a timeless design and a date complication, it offers both elegance and functionality.",
    "category": "שעוני נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-watches/rolex-datejust-women/thumbnail.webp",
    "availableQuantity": 4,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-FAS-WAT-193",
    "productName": "Watch Gold for Women",
    "unitPrice": 2959.96,
    "description": "The Gold Women's Watch is a stunning accessory that combines luxury and style. Featuring a gold-plated case and a chic design, it adds a touch of glamour to any outfit.",
    "category": "שעוני נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-watches/watch-gold-for-women/thumbnail.webp",
    "availableQuantity": 0,
    "reservedQuantity": 0
  },
  {
    "skuCode": "WOM-FAS-WOM-194",
    "productName": "Women's Wrist Watch",
    "unitPrice": 480.96,
    "description": "The Women's Wrist Watch is a versatile and fashionable timepiece for everyday wear. With a comfortable strap and a simple yet elegant design, it complements various styles.",
    "category": "שעוני נשים",
    "imageUrl": "https://cdn.dummyjson.com/product-images/womens-watches/women's-wrist-watch/thumbnail.webp",
    "availableQuantity": 12,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-1",
    "productName": "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
    "unitPrice": 406.82,
    "description": "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
    "category": "אופנת גברים",
    "imageUrl": "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-2",
    "productName": "Mens Casual Premium Slim Fit T-Shirts ",
    "unitPrice": 82.51,
    "description": "Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing. And Solid stitched shirts with round neck made for durability and a great fit for casual fashion wear and diehard baseball fans. The Henley style round neckline includes a three-button placket.",
    "category": "אופנת גברים",
    "imageUrl": "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-3",
    "productName": "Mens Cotton Jacket",
    "unitPrice": 207.16,
    "description": "great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions, such as working, hiking, camping, mountain/rock climbing, cycling, traveling or other outdoors. Good gift choice for you or your family member. A warm hearted love to Father, husband or son in this thanksgiving or Christmas Day.",
    "category": "אופנת גברים",
    "imageUrl": "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-4",
    "productName": "Mens Casual Slim Fit",
    "unitPrice": 59.16,
    "description": "The color could be slightly different between on the screen and in practice. / Please note that body builds vary by person, therefore, detailed size information should be reviewed below on the product description.",
    "category": "אופנת גברים",
    "imageUrl": "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-5",
    "productName": "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet",
    "unitPrice": 2571.5,
    "description": "From our Legends Collection, the Naga was inspired by the mythical water dragon that protects the ocean's pearl. Wear facing inward to be bestowed with love and abundance, or outward for protection.",
    "category": "תכשיטי יוקרה",
    "imageUrl": "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-6",
    "productName": "Solid Gold Petite Micropave ",
    "unitPrice": 621.6,
    "description": "Satisfaction Guaranteed. Return or exchange any order within 30 days.Designed and sold by Hafeez Center in the United States. Satisfaction Guaranteed. Return or exchange any order within 30 days.",
    "category": "תכשיטי יוקרה",
    "imageUrl": "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-7",
    "productName": "White Gold Plated Princess",
    "unitPrice": 36.96,
    "description": "Classic Created Wedding Engagement Solitaire Diamond Promise Ring for Her. Gifts to spoil your love more for Engagement, Wedding, Anniversary, Valentine's Day...",
    "category": "תכשיטי יוקרה",
    "imageUrl": "https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-8",
    "productName": "Pierced Owl Rose Gold Plated Stainless Steel Double",
    "unitPrice": 40.66,
    "description": "Rose Gold Plated Double Flared Tunnel Plug Earrings. Made of 316L Stainless Steel",
    "category": "תכשיטי יוקרה",
    "imageUrl": "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-9",
    "productName": "WD 2TB Elements Portable External Hard Drive - USB 3.0 ",
    "unitPrice": 236.8,
    "description": "USB 3.0 and USB 2.0 Compatibility Fast data transfers Improve PC Performance High Capacity; Compatibility Formatted NTFS for Windows 10, Windows 8.1, Windows 7; Reformatting may be required for other operating systems; Compatibility may vary depending on user’s hardware configuration and operating system",
    "category": "אלקטרוניקה וגאדג'טים",
    "imageUrl": "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-10",
    "productName": "SanDisk SSD PLUS 1TB Internal SSD - SATA III 6 Gb/s",
    "unitPrice": 403.3,
    "description": "Easy upgrade for faster boot up, shutdown, application load and response (As compared to 5400 RPM SATA 2.5” hard drive; Based on published specifications and internal benchmarking tests using PCMark vantage scores) Boosts burst write performance, making it ideal for typical PC workloads The perfect balance of performance and reliability Read/write speeds of up to 535MB/s/450MB/s (Based on internal testing; Performance may vary depending upon drive capacity, host device, OS and application.)",
    "category": "אלקטרוניקה וגאדג'טים",
    "imageUrl": "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-11",
    "productName": "Silicon Power 256GB SSD 3D NAND A55 SLC Cache Performance Boost SATA III 2.5",
    "unitPrice": 403.3,
    "description": "3D NAND flash are applied to deliver high transfer speeds Remarkable transfer speeds that enable faster bootup and improved overall system performance. The advanced SLC Cache Technology allows performance boost and longer lifespan 7mm slim design suitable for Ultrabooks and Ultra-slim notebooks. Supports TRIM command, Garbage Collection technology, RAID, and ECC (Error Checking & Correction) to provide the optimized performance and enhanced reliability.",
    "category": "אלקטרוניקה וגאדג'טים",
    "imageUrl": "https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-12",
    "productName": "WD 4TB Gaming Drive Works with Playstation 4 Portable External Hard Drive",
    "unitPrice": 421.8,
    "description": "Expand your PS4 gaming experience, Play anywhere Fast and easy, setup Sleek design with high capacity, 3-year manufacturer's limited warranty",
    "category": "אלקטרוניקה וגאדג'טים",
    "imageUrl": "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-13",
    "productName": "Acer SB220Q bi 21.5 inches Full HD (1920 x 1080) IPS Ultra-Thin",
    "unitPrice": 2216.3,
    "description": "21. 5 inches Full HD (1920 x 1080) widescreen IPS display And Radeon free Sync technology. No compatibility for VESA Mount Refresh Rate: 75Hz - Using HDMI port Zero-frame design | ultra-thin | 4ms response time | IPS panel Aspect ratio - 16: 9. Color Supported - 16. 7 million colors. Brightness - 250 nit Tilt angle -5 degree to 15 degree. Horizontal viewing angle-178 degree. Vertical viewing angle-178 degree 75 hertz",
    "category": "אלקטרוניקה וגאדג'טים",
    "imageUrl": "https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-14",
    "productName": "Samsung 49-Inch CHG90 144Hz Curved Gaming Monitor (LC49HG90DMNXZA) – Super Ultrawide Screen QLED ",
    "unitPrice": 3699.96,
    "description": "49 INCH SUPER ULTRAWIDE 32:9 CURVED GAMING MONITOR with dual 27 inch screen side by side QUANTUM DOT (QLED) TECHNOLOGY, HDR support and factory calibration provides stunningly realistic and accurate color and contrast 144HZ HIGH REFRESH RATE and 1ms ultra fast response time work to eliminate motion blur, ghosting, and reduce input lag",
    "category": "אלקטרוניקה וגאדג'טים",
    "imageUrl": "https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-15",
    "productName": "BIYLACLESEN Women's 3-in-1 Snowboard Jacket Winter Coats",
    "unitPrice": 210.86,
    "description": "Note:The Jackets is US standard size, Please choose size as your usual wear Material: 100% Polyester; Detachable Liner Fabric: Warm Fleece. Detachable Functional Liner: Skin Friendly, Lightweigt and Warm.Stand Collar Liner jacket, keep you warm in cold weather. Zippered Pockets: 2 Zippered Hand Pockets, 2 Zippered Pockets on Chest (enough to keep cards or keys)and 1 Hidden Pocket Inside.Zippered Hand Pockets and Hidden Pocket keep your things secure. Humanized Design: Adjustable and Detachable Hood and Adjustable cuff to prevent the wind and water,for a comfortable fit. 3 in 1 Detachable Design provide more convenience, you can separate the coat and inner as needed, or wear it together. It is suitable for different season and help you adapt to different climates",
    "category": "שמלות נשים",
    "imageUrl": "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-16",
    "productName": "Lock and Love Women's Removable Hooded Faux Leather Moto Biker Jacket",
    "unitPrice": 110.81,
    "description": "100% POLYURETHANE(shell) 100% POLYESTER(lining) 75% POLYESTER 25% COTTON (SWEATER), Faux leather material for style and comfort / 2 pockets of front, 2-For-One Hooded denim style faux leather jacket, Button detail on waist / Detail stitching at sides, HAND WASH ONLY / DO NOT BLEACH / LINE DRY / DO NOT IRON",
    "category": "שמלות נשים",
    "imageUrl": "https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-17",
    "productName": "Rain Jacket Women Windbreaker Striped Climbing Raincoats",
    "unitPrice": 147.96,
    "description": "Lightweight perfet for trip or casual wear---Long sleeve with hooded, adjustable drawstring waist design. Button and zipper front closure raincoat, fully stripes Lined and The Raincoat has 2 side pockets are a good size to hold all kinds of things, it covers the hips, and the hood is generous but doesn't overdo it.Attached Cotton Lined Hood with Adjustable Drawstrings give it a real styled look.",
    "category": "שמלות נשים",
    "imageUrl": "https://fakestoreapi.com/img/71HblAHs5xL._AC_UY879_-2t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-18",
    "productName": "MBJ Women's Solid Short Sleeve Boat Neck V ",
    "unitPrice": 36.45,
    "description": "95% RAYON 5% SPANDEX, Made in USA or Imported, Do Not Bleach, Lightweight fabric with great stretch for comfort, Ribbed on sleeves and neckline / Double stitching on bottom hem",
    "category": "שמלות נשים",
    "imageUrl": "https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-19",
    "productName": "Opna Women's Short Sleeve Moisture",
    "unitPrice": 29.42,
    "description": "100% Polyester, Machine wash, 100% cationic polyester interlock, Machine Wash & Pre Shrunk for a Great Fit, Lightweight, roomy and highly breathable with moisture wicking fabric which helps to keep moisture away, Soft Lightweight Fabric with comfortable V-neck collar and a slimmer fit, delivers a sleek, more feminine silhouette and Added Comfort",
    "category": "שמלות נשים",
    "imageUrl": "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  },
  {
    "skuCode": "FS-20",
    "productName": "DANVOUY Womens T Shirt Casual Cotton Short",
    "unitPrice": 48.06,
    "description": "95%Cotton,5%Spandex, Features: Casual, Short Sleeve, Letter Print,V-Neck,Fashion Tees, The fabric is soft and has some stretch., Occasion: Casual/Office/Beach/School/Home/Street. Season: Spring,Summer,Autumn,Winter.",
    "category": "שמלות נשים",
    "imageUrl": "https://fakestoreapi.com/img/61pHAEJ4NML._AC_UX679_t.png",
    "availableQuantity": 40,
    "reservedQuantity": 0
  }
];
