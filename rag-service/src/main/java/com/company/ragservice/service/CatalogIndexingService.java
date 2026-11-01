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
        long count = vectorRepository.count();
        if (count == 0) {
            log.info("Catalog vector collection is empty. Bootstrapping initial catalog embeddings into MongoDB Atlas Vector Store...");
            bootstrapInitialCatalog();
        } else {
            log.info("Catalog vector store contains {} indexed products.", count);
        }
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
        doc.setInStock(inStock != null ? inStock : true);
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
                createDoc("IPHONE-16-PRO", "Apple iPhone 16 Pro Max 256GB Titanium", "סמארטפון הדגל של אפל עם מעבד A18 Pro עוצמתי, מסך OLED 120Hz ProMotion ומצלמת 48MP פרימיום.", "סמארטפונים", 4899.00, true, 4.9),
                createDoc("AIRPODS-PRO-2", "Apple AirPods Pro 2 עם ביטול רעשים אקטיבי", "אוזניות אלחוטיות In-Ear עם סינון רעשים מתקדם, שמע מרחבי מותאם אישית ומארז טעינה MagSafe USB-C.", "אוזניות", 899.00, true, 4.8),
                createDoc("MACBOOK-PRO-M4", "Apple MacBook Pro 14 M4 512GB Space Black", "מחשב נייד מקצועי לעריכה ופיתוח עם מעבד M4 מטורף, מסך Liquid Retina XDR וסוללה לעד 24 שעות.", "מחשבים", 7999.00, true, 4.9),
                createDoc("SAMSUNG-S25-ULTRA", "Samsung Galaxy S25 Ultra 512GB AI Titanium", "מכשיר הדגל של סמסונג עם Galaxy AI מובנה, עט S-Pen משולב ומערך 4 מצלמות זום עד פי 100.", "סמארטפונים", 4599.00, true, 4.8),
                createDoc("GALAXY-BUDS-3", "Samsung Galaxy Buds 3 Pro אלחוטיות", "אוזניות TWS עם סאונד Hi-Fi 24bit, ביטול רעשים חכם והתאמה מושלמת למכשירי סמסונג גלקסי.", "אוזניות", 799.00, true, 4.7),
                createDoc("SONY-WH1000XM5", "אוזניות סוני Sony WH-1000XM5 ביטול רעשים", "אוזניות Over-Ear מובילות בעולם לסינון רעשים בתקשורת ובטיסות, סאונד עשיר ונוחות מירבית.", "אוזניות", 1199.00, true, 4.9),
                createDoc("ANKER-65W-GAN", "מטען מהיר Anker 65W GaN קומפקטי רב-יציאות", "מטען קיר מתקדם בטכנולוגיית GaN לטעינה בו-זמנית של מחשב נייד, טאבלט וסמארטפון במהירות שיא.", "מטענים", 179.00, true, 4.8),
                createDoc("MAGSAFE-CHARGER", "מטען אלחוטי מגנטי מהיר MagSafe 25W", "מטען מקורי של אפל עם הצמדה מגנטית חזקה לטעינה מהירה ונוחה של כל דגמי אייפון ואיירפודס.", "מטענים", 199.00, true, 4.7),
                createDoc("GARMIN-FENIX-8", "שעון ספורט וטריאתלון Garmin Fenix 8 ספיר", "שעון מולטי-ספורט עמיד במיוחד עם GPS רב-ערוצי, מפות טופוגרפיות מובנות וחיי סוללה של חודש.", "שעונים", 3499.00, true, 4.9),
                createDoc("APPLE-WATCH-U2", "שעון חכם Apple Watch Ultra 2 טיטניום", "שעון הקצה של אפל לספורט אתגרי, צלילה ופעילות שטח עם גוף טיטניום ומסך בהירות 3000 ניטס.", "שעונים", 3299.00, true, 4.8),
                createDoc("CASE-PRO-CLEAR", "כיסוי סיליקון שקוף מגנטי מוגן נפילות", "כיסוי עמיד במיוחד עם כריות אוויר בפינות ותמיכה מלאה בטעינה אלחוטית מגנטית MagSafe.", "כיסויים", 149.00, true, 4.6),
                createDoc("POWERBANK-20000", "סוללת גיבוי ניידת מהירה 20,000mAh", "מטען נייד עוצמתי עם צג דיגיטלי, טעינה מהירה Power Delivery 65W וקיבולת ל-4 טעינות מלאות.", "סוללות", 229.00, true, 4.8)
        );

        for (CatalogVectorDocument doc : initialItems) {
            String combinedText = String.format("%s. %s. קטגוריה: %s. מחיר: ₪%.2f.",
                    doc.getTitle(), doc.getTextChunk(), doc.getCategory(), doc.getPrice());
            doc.setEmbedding(embeddingService.generateEmbedding(combinedText));
            doc.setIndexedAt(Instant.now());
            vectorRepository.save(doc);
        }
        log.info("Bootstrapped {} catalog items with embeddings successfully.", initialItems.size());
    }

    private CatalogVectorDocument createDoc(String sku, String title, String chunk, String cat, double price, boolean stock, double rating) {
        return CatalogVectorDocument.builder()
                .skuCode(sku)
                .title(title)
                .textChunk(chunk)
                .category(cat)
                .price(price)
                .inStock(stock)
                .averageRating(rating)
                .metadata(Map.of("featured", true))
                .build();
    }
}
