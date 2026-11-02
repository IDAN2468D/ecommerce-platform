package com.company.ragservice.service;

import com.company.ragservice.dto.VectorSyncRequest;
import com.company.ragservice.entity.CatalogVectorDocument;
import com.company.ragservice.repository.CatalogVectorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CatalogIndexingService {

    private final CatalogVectorRepository vectorRepository;
    private final EmbeddingService embeddingService;

    @EventListener(ApplicationReadyEvent.class)
    public void initCatalogEmbeddingsIfEmpty() {
        bootstrapInitialCatalog();
    }

    public void indexProduct(
            String skuCode,
            String name,
            String description,
            String category,
            Double price,
            Boolean inStock,
            Double rating,
            Map<String, Object> extraMetadata
    ) {
        indexProductWithQuantity(skuCode, name, description, category, price, inStock,
                Boolean.TRUE.equals(inStock) ? 30 : 0, rating, extraMetadata);
    }

    public void indexProductWithQuantity(
            String skuCode,
            String name,
            String description,
            String category,
            Double price,
            Boolean inStock,
            Integer availableQuantity,
            Double rating,
            Map<String, Object> extraMetadata
    ) {
        String combinedText = String.format("%s. %s. קטגוריה: %s. מחיר: ₪%.2f.",
                name, description, category, price);

        List<Float> embedding = embeddingService.generateEmbedding(combinedText);

        CatalogVectorDocument doc = vectorRepository.findBySkuCode(skuCode)
                .orElse(CatalogVectorDocument.builder().skuCode(skuCode).build());

        doc.setTitle(name);
        doc.setTextChunk(description);
        doc.setEmbedding(embedding);
        doc.setCategory(category);
        doc.setPrice(price);
        int qty = availableQuantity != null ? availableQuantity : (Boolean.FALSE.equals(inStock) ? 0 : 25);
        doc.setAvailableQuantity(qty);
        doc.setInStock(inStock != null ? inStock : (qty > 0));
        doc.setAverageRating(rating != null ? rating : 4.8);
        doc.setMetadata(extraMetadata != null ? extraMetadata : new HashMap<>());
        doc.setIndexedAt(Instant.now());

        vectorRepository.save(doc);
        log.info("Successfully indexed product vector for SKU: [{}] with {} dimensions", skuCode, embedding.size());
    }

    public int syncBatch(VectorSyncRequest request) {
        if (request == null || request.products() == null) {
            return 0;
        }

        if (Boolean.TRUE.equals(request.wipeExisting())) {
            vectorRepository.deleteAll();
            log.warn("Wiped existing vector embeddings per sync request");
        }

        int count = 0;
        for (VectorSyncRequest.ProductSyncItem item : request.products()) {
            indexProduct(
                    item.skuCode(),
                    item.name(),
                    item.description(),
                    item.category(),
                    item.price(),
                    item.inStock(),
                    item.rating(),
                    null
            );
            count++;
        }
        return count;
    }

    private void bootstrapInitialCatalog() {
        List<CatalogVectorDocument> initialItems = List.of(
                createDoc("IPHONE-16-PRO-256", "Apple iPhone 16 Pro 256GB Desert Titanium", "שבב A18 Pro עוצמתי בטכנולוגיית 3 ננומטר, מסך Super Retina XDR 120Hz, כפתור Camera Control וגימור טיטניום יוקרתי.", "סמארטפונים", 4899.00, true, 50, 4.9),
                createDoc("IPHONE-16-PRO", "Apple iPhone 16 Pro Max 256GB Titanium", "סמארטפון הדגל של אפל עם מעבד A18 Pro עוצמתי, מסך OLED 120Hz ProMotion ומצלמת 48MP פרימיום.", "סמארטפונים", 4899.00, true, 50, 4.9),
                createDoc("SAMSUNG-S24-ULTRA", "Samsung Galaxy S24 Ultra 512GB Titanium Gray", "מערך צילום 200MP מקצועי, מסך Dynamic AMOLED 2X שטוח 120Hz, מעבד Snapdragon 8 Gen 3 ועט S-Pen מובנה.", "סמארטפונים", 5199.00, true, 45, 4.8),
                createDoc("MACBOOK-PRO-M3", "Apple MacBook Pro 14 M3 Pro 18GB 512GB", "מעבד Apple M3 Pro עוצמתי עם 18GB זיכרון אחיד, כונן 512GB SSD ומסך Liquid Retina XDR מרהיב לעריכת וידאו ופיתוח.", "מחשבים ניידים", 8999.00, true, 25, 4.9),
                createDoc("MACBOOK-PRO-M4", "Apple MacBook Pro 14 M4 512GB Space Black", "מחשב נייד מקצועי לעריכת וידאו ופיתוח עם מעבד M4 מטורף, מסך Liquid Retina XDR וסוללה לעד 24 שעות.", "מחשבים", 7999.00, true, 25, 4.9),
                createDoc("SKU-LAPTOP-PRO", "Dell XPS 15 OLED Intel Core i9 32GB", "תחנת עבודה ניידת עם מסך מגע 3.5K OLED, מעבד Intel Core i9 דור 13, כרטיס גרפי RTX 4070 ו-32GB RAM לגיימינג ועריכת וידאו.", "מחשבים ניידים", 6500.00, true, 30, 4.8),
                createDoc("IPAD-PRO-M4", "Apple iPad Pro 11-inch M4 256GB OLED Space Black", "שבב Apple M4 פורץ דרך, מסך Ultra Retina XDR כפול שכבות OLED בעובי דקיק של 5.3 מ\"מ בלבד ללימודים ויצירה.", "טאבלטים", 4299.00, true, 35, 4.9),
                createDoc("AIRPODS-MAX", "Apple AirPods Max USB-C", "אוזניות פרימיום מעל האוזן עם סינון רעשים אקטיבי מוביל בתעשייה, שמע מרחבי מותאם אישית וחיבור USB-C.", "אודיו", 2199.00, true, 50, 4.8),
                createDoc("SONY-WH-1000XM5", "Sony WH-1000XM5 Wireless Noise Canceling Headphones", "שני מעבדי סינון רעשים ייעודיים עם 8 מיקרופונים, איכות סאונד Hi-Res Audio וזמן סוללה של 30 שעות עם טעינה מהירה.", "אודיו", 1499.00, true, 60, 4.9),
                createDoc("SONY-WH1000XM5", "אוזניות סוני Sony WH-1000XM5 ביטול רעשים", "אוזניות Over-Ear מובילות בעולם לסינון רעשים בתקשורת ובטיסות, סאונד עשיר ונוחות מירבית.", "אוזניות", 1199.00, true, 60, 4.9),
                createDoc("AIRPODS-PRO-2", "Apple AirPods Pro 2 עם ביטול רעשים אקטיבי USB-C", "אוזניות אלחוטיות In-Ear עם סינון רעשים מתקדם, שמע מרחבי מותאם אישית ומארז טעינה MagSafe USB-C.", "אודיו", 899.00, true, 80, 4.8),
                createDoc("WATCH-ULTRA-2", "Apple Watch Ultra 2 GPS + Cellular", "גוף טיטניום תעופתי 49 מ\"מ, מסך OLED בבהירות שיא של 3000nits, עמידות במים 100 מטר וסוללה לעד 72 שעות.", "שעונים חכמים", 3499.00, true, 40, 4.9),
                createDoc("PS5-PRO", "Sony PlayStation 5 Pro 2TB Console", "קונסולת הגיימינג המתקדמת בעולם עם מעבד גרפי משודרג, תמיכה ב-PSSR Upscaling, מעקב קרניים מתקדם וכונן 2TB SSD.", "גיימינג", 3399.00, true, 30, 4.9),
                createDoc("DJI-MINI-4-PRO", "DJI Mini 4 Pro Drone Fly More Combo", "רחפן מקצועי מתחת ל-249 גרם עם צילום 4K/60fps HDR, חישת מכשולים היקפית ב-360 מעלות וזמן טיסה עד 34 דקות.", "רחפנים", 4599.00, true, 25, 4.8),
                createDoc("SKU-MOUSE-WIRELESS", "Logitech MX Master 3S Wireless Mouse", "עכבר פרימיום ארגונומי עם גלילת MagSpeed אלקטרומגנטית, חיישן Darkfield 8000 DPI ולחיצות שקטות ב-90%.", "אביזרים", 250.00, true, 120, 4.9),
                createDoc("CASE-CLEAR-MAGSAFE", "Clear Case with MagSafe for iPhone 16", "כיסוי שקוף דק וקל להגנה מרבית, עם טבעת מגנטים מובנית התואמת למטעני MagSafe ואביזרים נלווים.", "אביזרים", 150.00, true, 100, 4.7),
                createDoc("ANKER-65W-GAN", "מטען מהיר Anker 65W GaN קומפקטי רב-יציאות", "מטען קיר מתקדם בטכנולוגיית GaN לטעינה בו-זמנית של מחשב נייד, טאבלט וסמארטפון במהירות שיא.", "מטענים", 179.00, true, 75, 4.8),
                createDoc("MAGSAFE-CHARGER", "מטען אלחוטי מגנטי מהיר MagSafe 25W", "מטען מקורי של אפל עם הצמדה מגנטית חזקה לטעינה מהירה ונוחה של כל דגמי אייפון ואיירפודס.", "מטענים", 199.00, true, 90, 4.7),
                createDoc("GARMIN-FENIX-8", "שעון ספורט וטריאתלון Garmin Fenix 8 ספיר", "שעון מולטי-ספורט עמיד במיוחד עם GPS רב-ערוצי, מפות טופוגרפיות מובנות וחיי סוללה של חודש.", "שעונים", 3499.00, true, 20, 4.9),
                createDoc("POWERBANK-20000", "סוללת גיבוי ניידת מהירה 20,000mAh", "מטען נייד עוצמתי עם צג דיגיטלי, טעינה מהירה Power Delivery 65W וקיבולת ל-4 טעינות מלאות.", "סוללות", 229.00, true, 65, 4.8)
        );

        int newlyIndexed = 0;
        for (CatalogVectorDocument doc : initialItems) {
            Optional<CatalogVectorDocument> existingOpt = vectorRepository.findBySkuCode(doc.getSkuCode());
            if (existingOpt.isEmpty() || existingOpt.get().getEmbedding() == null || existingOpt.get().getEmbedding().isEmpty()) {
                String combinedText = String.format("%s. %s. קטגוריה: %s. מחיר: ₪%.2f.",
                        doc.getTitle(), doc.getTextChunk(), doc.getCategory(), doc.getPrice());
                doc.setEmbedding(embeddingService.generateEmbedding(combinedText));
                doc.setIndexedAt(Instant.now());
                existingOpt.ifPresent(existing -> doc.setId(existing.getId()));
                vectorRepository.save(doc);
                newlyIndexed++;
            } else {
                CatalogVectorDocument existing = existingOpt.get();
                if (existing.getAvailableQuantity() == null) {
                    existing.setAvailableQuantity(doc.getAvailableQuantity());
                    vectorRepository.save(existing);
                }
            }
        }
        log.info("Catalog vector store verified: {} newly indexed, {} total in store.", newlyIndexed, vectorRepository.count());
    }

    private CatalogVectorDocument createDoc(String sku, String title, String chunk, String cat, double price, boolean stock, int qty, double rating) {
        return CatalogVectorDocument.builder()
                .skuCode(sku)
                .title(title)
                .textChunk(chunk)
                .category(cat)
                .price(price)
                .inStock(stock)
                .availableQuantity(qty)
                .averageRating(rating)
                .metadata(Map.of("featured", true, "availableQuantity", qty))
                .build();
    }
}
