package com.company.recommendationloyaltyservice.rag.service;

import com.company.recommendationloyaltyservice.rag.config.RagConfig;
import com.company.recommendationloyaltyservice.rag.dto.CitationDto;
import com.company.recommendationloyaltyservice.rag.dto.RagQueryRequest;
import com.company.recommendationloyaltyservice.rag.dto.RagQueryResponse;
import com.company.recommendationloyaltyservice.rag.model.ProductVectorDocument;
import com.company.recommendationloyaltyservice.rag.repository.ProductVectorRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class RagOrchestratorService {

    private static final Logger log = LoggerFactory.getLogger(RagOrchestratorService.class);

    private final ProductVectorRepository vectorRepository;
    private final EmbeddingService embeddingService;
    private final RagConfig ragConfig;
    private final RestClient restClient;

    public RagOrchestratorService(ProductVectorRepository vectorRepository,
                                  EmbeddingService embeddingService,
                                  RagConfig ragConfig,
                                  RestClient ragVirtualThreadRestClient) {
        this.vectorRepository = vectorRepository;
        this.embeddingService = embeddingService;
        this.ragConfig = ragConfig;
        this.restClient = ragVirtualThreadRestClient;
    }

    @PostConstruct
    public void initCatalogSeedIfEmpty() {
        if (vectorRepository.count() == 0) {
            log.info("Bootstrapping initial catalog embeddings for RAG into MongoDB...");
            seedProducts();
        }
    }

    public RagQueryResponse query(RagQueryRequest request) {
        long start = System.currentTimeMillis();

        // 1. Embed user query
        List<Double> queryVector = embeddingService.generateEmbedding(request.getQuery());

        // 2. Retrieve top-K relevant catalog documents
        int topK = request.getTopK() != null ? request.getTopK() : 4;
        double minSimilarity = request.getMinSimilarity() != null ? request.getMinSimilarity() : 0.5;
        List<CitationDto> citations = vectorRepository.searchSimilar(queryVector, request.getCategory(), topK, minSimilarity);

        // 3. Generate grounded answer
        String answer = generateAnswerWithGemini(request.getQuery(), citations);

        long latency = System.currentTimeMillis() - start;
        double confidence = citations.isEmpty() ? 0.0 : citations.get(0).getRelevanceScore() != null ? citations.get(0).getRelevanceScore() : 0.85;

        return RagQueryResponse.builder()
                .query(request.getQuery())
                .answer(answer)
                .citations(citations)
                .confidenceScore(confidence)
                .model(ragConfig.getGeminiModel())
                .latencyMs(latency)
                .retrievedDocumentsCount(citations.size())
                .build();
    }

    public void streamQuery(String query, String category, Integer topK, SseEmitter emitter) {
        CompletableFuture.runAsync(() -> {
            long start = System.currentTimeMillis();
            try {
                int k = (topK != null && topK > 0) ? topK : 4;
                List<Double> queryVector = embeddingService.generateEmbedding(query);
                List<CitationDto> citations = vectorRepository.searchSimilar(queryVector, category, k, 0.4);

                // Send citations event first
                emitter.send(SseEmitter.event()
                        .name("citations")
                        .data(Map.of(
                                "citations", citations,
                                "model", ragConfig.getGeminiModel()
                        ), MediaType.APPLICATION_JSON));

                // Generate full answer and stream as tokens
                String fullAnswer = generateAnswerWithGemini(query, citations);
                String[] words = fullAnswer.split("(?<=\\s)|(?<=\\n)");

                for (String word : words) {
                    emitter.send(SseEmitter.event()
                            .name("token")
                            .data(Map.of("text", word, "done", false), MediaType.APPLICATION_JSON));
                    Thread.sleep(15);
                }

                long latency = System.currentTimeMillis() - start;
                emitter.send(SseEmitter.event()
                        .name("complete")
                        .data(Map.of("done", true, "latencyMs", latency), MediaType.APPLICATION_JSON));

                emitter.complete();
            } catch (Exception e) {
                log.error("Error in SSE RAG stream: {}", e.getMessage());
                emitter.completeWithError(e);
            }
        });
    }

    private String generateAnswerWithGemini(String userQuery, List<CitationDto> citations) {
        String apiKey = ragConfig.getGeminiApiKey();
        String model = ragConfig.getGeminiModel();

        if (apiKey != null && !apiKey.isBlank() && !apiKey.equals("demo_key")) {
            try {
                String prompt = buildGroundedPrompt(userQuery, citations);
                String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", model, apiKey);

                Map<String, Object> body = Map.of(
                        "contents", List.of(
                                Map.of("role", "user", "parts", List.of(Map.of("text", prompt)))
                        ),
                        "generationConfig", Map.of(
                                "temperature", 0.2,
                                "maxOutputTokens", 800
                        )
                );

                Map response = restClient.post()
                        .uri(url)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(body)
                        .retrieve()
                        .body(Map.class);

                if (response != null && response.containsKey("candidates")) {
                    List candidates = (List) response.get("candidates");
                    if (!candidates.isEmpty()) {
                        Map first = (Map) candidates.get(0);
                        Map content = (Map) first.get("content");
                        List parts = (List) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map textPart = (Map) parts.get(0);
                            return (String) textPart.get("text");
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Gemini LLM call failed, using grounded fallback generator: {}", e.getMessage());
            }
        }

        return generateLocalGroundedAnswer(userQuery, citations);
    }

    private String buildGroundedPrompt(String query, List<CitationDto> citations) {
        StringBuilder sb = new StringBuilder();
        sb.append("אתה יועץ קניות אישי מומחה בחנות האלקטרוניקה שלנו. ענה בעברית רהוטה ומקצועית בלבד.\n");
        sb.append("הנחיות קריטיות:\n");
        sb.append("1. הסתמך אך ורק על המוצרים המצוטטים מהקטלוג להלן. אל תמציא מוצרים, מק״טים או מחירים שלא מופיעים.\n");
        sb.append("2. ציין עבור כל מוצר רלוונטי את שמו, מק״ט, מחירו, והסבר קצר מדוע הוא מתאים לדרישות הלקוח.\n");
        sb.append("3. הדגש כי כל רכישה מזכה ב-5% Cashback למועדון VIP.\n\n");
        sb.append("רשימת המוצרים שנשלפו מהקטלוג:\n");

        for (CitationDto c : citations) {
            sb.append(String.format("- שם: %s | מק״ט: %s | מחיר: ₪%.2f | קטגוריה: %s | במלאי: %s | תיאור: %s\n",
                    c.getTitle(), c.getSkuCode(), c.getPrice(), c.getCategory(),
                    c.getInStock() != null && c.getInStock() ? "כן" : "לא",
                    c.getSnippet()));
        }

        sb.append("\nשאלת הלקוח:\n").append(query).append("\n\nתשובתך המנומקת:");
        return sb.toString();
    }

    private String generateLocalGroundedAnswer(String userQuery, List<CitationDto> citations) {
        if (citations.isEmpty()) {
            return "לא נמצאו בקטלוג מוצרים התואמים בדיוק את החיפוש. נסה לנסח את השאילתה מחדש או לבחור קטגוריה אחרת.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("בהתבסס על החיפוש בקטלוג המוצרים שלנו, הנה האפשרויות המתאימות ביותר לשאלתך:\n\n");

        int index = 1;
        for (CitationDto c : citations) {
            sb.append(String.format("%d. **%s** (מק״ט: `%s`)\n", index++, c.getTitle(), c.getSkuCode()));
            sb.append(String.format("   • **מחיר**: ₪%,.2f\n", c.getPrice()));
            sb.append(String.format("   • **זמינות**: %s\n", (c.getInStock() != null && c.getInStock()) ? "במלאי מיידי למשלוח חינם" : "אזל זמנית מהמלאי"));
            if (c.getSnippet() != null && !c.getSnippet().isBlank()) {
                sb.append(String.format("   • **פרטים**: %s\n", c.getSnippet()));
            }
            sb.append("\n");
        }

        sb.append("כל המוצרים זמינים להזמנה ישירה דרך האתר עם **5% Cashback** לחברי מועדון VIP!");
        return sb.toString();
    }

    public void seedProducts() {
        List<ProductVectorDocument> seedList = List.of(
                createDoc("MACBOOK-PRO-M4", "Apple MacBook Pro 14 M4 512GB Space Black", "מחשב נייד מקצועי עם מעבד M4 עוצמתי, מסך Liquid Retina XDR מרהיב וסוללה עד 24 שעות.", "מחשבים", 7999.0, true, 4.9),
                createDoc("IPHONE-16-PRO", "Apple iPhone 16 Pro Max 256GB Titanium", "סמארטפון הדגל עם שבב A18 Pro, מסך OLED 120Hz ProMotion ומצלמת 48MP מקצועית.", "סמארטפונים", 4899.0, true, 4.8),
                createDoc("SONY-WH1000XM5", "אוזניות סוני Sony WH-1000XM5 ביטול רעשים", "אוזניות Over-Ear מובילות בעולם לסינון רעשים בתקשורת ובטיסות, סאונד עשיר ונוחות מירבית.", "אוזניות", 1199.0, true, 4.9),
                createDoc("AIRPODS-PRO-2", "Apple AirPods Pro 2 עם ביטול רעשים אקטיבי", "אוזניות אלחוטיות In-Ear עם סינון רעשים פי 2, דרייברים משופרים ומארז טעינה MagSafe USB-C.", "אוזניות", 899.0, true, 4.8),
                createDoc("GALAXY-BUDS-3", "Samsung Galaxy Buds 3 Pro אלחוטיות", "אוזניות TWS עם איכות Hi-Fi 24bit, עיצוב ארגונומי חדשני ועמידות למים בתקן IP57.", "אוזניות", 799.0, true, 4.7),
                createDoc("GARMIN-FENIX-8", "שעון ספורט ויוקרה Garmin Fenix 8 סולאר", "שעון מולטי-ספורט מתקדם עם GPS רב-ערוצי, עמידות צלילה ומדדי בריאות מתקדמים מסביב לשעון.", "שעונים", 3499.0, true, 4.9),
                createDoc("DELL-XPS-15", "Dell XPS 15 Intel Core i9 32GB 1TB SSD RTX 4060", "לפטופ גרפיקה ועריכה מקצועי עם מסך OLED מגע ברזולוציית 3.5K וכרטיס מסך ייעודי.", "מחשבים", 8499.0, true, 4.7),
                createDoc("POWERBANK-20000", "סוללת גיבוי ניידת מהירה 20,000mAh", "מטען נייד עוצמתי לכל המכשירים, תומך Power Delivery 65W וטעינה מהירה ל-4 מכשירים במקביל.", "אביזרים", 229.0, true, 4.6),
                createDoc("CASE-PRO-CLEAR", "כיסוי סיליקון שקוף מוגן מכות לאייפון", "כיסוי מגן פרימיום עם בלימת זעזועים צבאית, ציפוי מונע הצהבה ותמיכה מלאה ב-MagSafe.", "אביזרים", 149.0, true, 4.5),
                createDoc("MAGSAFE-CHARGER", "מטען אלחוטי מגנטי מהיר MagSafe 25W", "מטען מקורי של אפל עם הצמדה מגנטית חזקה לטעינה מהירה ונוחה של כל דגמי אייפון ואיירפודס.", "מטענים", 199.0, true, 4.8)
        );

        for (ProductVectorDocument doc : seedList) {
            if (vectorRepository.findBySkuCode(doc.getSkuCode()).isEmpty()) {
                vectorRepository.save(doc);
            }
        }
        log.info("Catalog embeddings seeded successfully: {} items in database.", vectorRepository.count());
    }

    private ProductVectorDocument createDoc(String sku, String title, String chunk, String category, Double price, Boolean inStock, Double rating) {
        List<Double> vector = embeddingService.generateEmbedding(title + " " + chunk + " " + category);
        return ProductVectorDocument.builder()
                .skuCode(sku)
                .title(title)
                .textChunk(chunk)
                .category(category)
                .price(price)
                .inStock(inStock)
                .averageRating(rating)
                .embedding(vector)
                .lastIndexedAt(Instant.now())
                .build();
    }
}
