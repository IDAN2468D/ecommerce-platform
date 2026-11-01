package com.company.inventoryservice.config;

import com.company.inventoryservice.domain.entity.InventoryEntity;
import com.company.inventoryservice.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class MongoCatalogSeeder implements CommandLineRunner {

    private final InventoryRepository inventoryRepository;
    private final CacheManager cacheManager;

    @Override
    public void run(String... args) {
        List<InventoryEntity> initialCatalog = List.of(
                item("IPHONE-16-PRO-256", "Apple iPhone 16 Pro 256GB Desert Titanium", 50, "4899.00",
                        "שבב A18 Pro עוצמתי בטכנולוגיית 3 ננומטר, מסך Super Retina XDR 120Hz, כפתור Camera Control וגימור טיטניום יוקרתי.",
                        "סמארטפונים",
                        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80"),

                item("IPHONE-16-PRO", "Apple iPhone 16 Pro 256GB Desert Titanium", 50, "4899.00",
                        "שבב A18 Pro עוצמתי בטכנולוגיית 3 ננומטר, מסך Super Retina XDR 120Hz, כפתור Camera Control וגימור טיטניום יוקרתי.",
                        "סמארטפונים",
                        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80"),

                item("SAMSUNG-S24-ULTRA", "Samsung Galaxy S24 Ultra 512GB Titanium Gray", 45, "5199.00",
                        "מערך צילום 200MP מקצועי, מסך Dynamic AMOLED 2X שטוח 120Hz, מעבד Snapdragon 8 Gen 3 ועט S-Pen מובנה.",
                        "סמארטפונים",
                        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80"),

                item("MACBOOK-PRO-M3", "Apple MacBook Pro 14 M3 Pro 18GB 512GB", 25, "8999.00",
                        "מעבד Apple M3 Pro עוצמתי עם 18GB זיכרון אחיד, כונן 512GB SSD ומסך Liquid Retina XDR מרהיב.",
                        "מחשבים ניידים",
                        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"),

                item("SKU-LAPTOP-PRO", "Dell XPS 15 OLED Intel Core i9 32GB", 30, "6500.00",
                        "תחנת עבודה ניידת עם מסך מגע 3.5K OLED, מעבד Intel Core i9 דור 13, כרטיס גרפי RTX 4070 ו-32GB RAM.",
                        "מחשבים ניידים",
                        "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80"),

                item("IPAD-PRO-M4", "Apple iPad Pro 11-inch M4 256GB OLED Space Black", 35, "4299.00",
                        "שבב Apple M4 פורץ דרך, מסך Ultra Retina XDR כפול שכבות OLED בעובי דקיק של 5.3 מ\"מ בלבד.",
                        "טאבלטים",
                        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80"),

                item("AIRPODS-MAX", "Apple AirPods Max USB-C", 50, "2199.00",
                        "אוזניות פרימיום מעל האוזן עם סינון רעשים אקטיבי מוביל בתעשייה, שמע מרחבי מותאם אישית וחיבור USB-C.",
                        "אודיו",
                        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80"),

                item("SONY-WH-1000XM5", "Sony WH-1000XM5 Wireless Noise Canceling Headphones", 60, "1499.00",
                        "שני מעבדי סינון רעשים ייעודיים עם 8 מיקרופונים, איכות סאונד Hi-Res Audio וזמן סוללה של 30 שעות עם טעינה מהירה.",
                        "אודיו",
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"),

                item("AIRPODS-PRO-2", "Apple AirPods Pro (2nd generation) USB-C", 80, "899.00",
                        "שבב H2 לאיכות סאונד מוגברת, סינון רעשים אקטיבי פי 2, מצב שקיפות מותאם ומארז טעינה MagSafe עם רמקול ואיתור.",
                        "אודיו",
                        "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80"),

                item("WATCH-ULTRA-2", "Apple Watch Ultra 2 GPS + Cellular", 40, "3499.00",
                        "גוף טיטניום תעופתי 49 מ\"מ, מסך OLED בבהירות שיא של 3000nits, עמידות במים 100 מטר וסוללה לעד 72 שעות.",
                        "שעונים חכמים",
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"),

                item("PS5-PRO", "Sony PlayStation 5 Pro 2TB Console", 30, "3399.00",
                        "קונסולת הגיימינג המתקדמת בעולם עם מעבד גרפי משודרג, תמיכה ב-PSSR Upscaling, מעקב קרניים מתקדם וכונן 2TB SSD.",
                        "גיימינג",
                        "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80"),

                item("DJI-MINI-4-PRO", "DJI Mini 4 Pro Drone Fly More Combo", 25, "4599.00",
                        "רחפן מקצועי מתחת ל-249 גרם עם צילום 4K/60fps HDR, חישת מכשולים היקפית ב-360 מעלות וזמן טיסה עד 34 דקות.",
                        "רחפנים",
                        "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80"),

                item("SKU-MOUSE-WIRELESS", "Logitech MX Master 3S Wireless Mouse", 120, "250.00",
                        "עכבר פרימיום ארגונומי עם גלילת MagSpeed אלקטרומגנטית, חיישן Darkfield 8000 DPI ולחיצות שקטות ב-90%.",
                        "אביזרים",
                        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80"),

                item("CASE-CLEAR-MAGSAFE", "Clear Case with MagSafe for iPhone 16", 100, "150.00",
                        "כיסוי שקוף דק וקל להגנה מרבית, עם טבעת מגנטים מובנית התואמת למטעני MagSafe ואביזרים נלווים.",
                        "אביזרים",
                        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80")
        );

        int seededCount = 0;
        for (InventoryEntity product : initialCatalog) {
            if (inventoryRepository.findBySkuCode(product.getSkuCode()).isEmpty()) {
                inventoryRepository.save(product);
                seededCount++;
            }
        }

        if (seededCount > 0) {
            log.info("MongoCatalogSeeder: Seeded {} initial products into MongoDB 'inventory' collection", seededCount);
            try {
                if (cacheManager.getCache("products_catalog") != null) {
                    cacheManager.getCache("products_catalog").clear();
                }
                if (cacheManager.getCache("inventory_stock") != null) {
                    cacheManager.getCache("inventory_stock").clear();
                }
            } catch (Exception e) {
                log.debug("Redis cache clear skipped during startup seed: {}", e.getMessage());
            }
        }
    }

    private InventoryEntity item(String sku, String name, int qty, String price, String desc, String category, String imageUrl) {
        return InventoryEntity.builder()
                .id(UUID.randomUUID())
                .skuCode(sku)
                .productName(name)
                .availableQuantity(qty)
                .reservedQuantity(0)
                .unitPrice(new BigDecimal(price))
                .description(desc)
                .category(category)
                .imageUrl(imageUrl)
                .updatedAt(Instant.now())
                .build();
    }
}
