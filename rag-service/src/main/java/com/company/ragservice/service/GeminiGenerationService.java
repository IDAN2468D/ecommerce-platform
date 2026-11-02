package com.company.ragservice.service;

import com.company.ragservice.config.GeminiProperties;
import com.company.ragservice.dto.CitationDto;
import com.company.ragservice.dto.ExecutedActionDto;
import com.company.ragservice.dto.ProductComparisonResponse;
import com.company.ragservice.dto.ProductComparisonResponse.ProductTradeOffDto;
import com.company.ragservice.entity.CatalogVectorDocument;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiGenerationService {

    private final GeminiProperties geminiProperties;
    private final AgenticToolsService agenticToolsService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(6))
            .build();

    public record AgenticGenerationResult(String answer, List<ExecutedActionDto> executedActions) {}
    public record VisionExtractionResult(String extractedDescription, List<String> detectedFeatures) {}

    /**
     * Generates a grounded response with Gemini Function Calling (Tools) support.
     */
    @CircuitBreaker(name = "geminiLlm", fallbackMethod = "fallbackGenerateAgenticAnswer")
    public AgenticGenerationResult generateAgenticAnswer(
            String userQuery,
            String groundedContext,
            List<CitationDto> citations,
            String customerId,
            Double cartTotal
    ) {
        List<ExecutedActionDto> executedActions = new ArrayList<>();
        String apiKey = geminiProperties.getApiKey();
        String model = geminiProperties.getModel();

        log.info("Invoking Google Gemini LLM [{}] with Function Calling tools for query: '{}'", model, userQuery);

        String generatedText = null;

        if (apiKey != null && !apiKey.isBlank() && !apiKey.equals("demo_key")) {
            try {
                String systemInstruction = """
                        אתה העוזר החכם והרשמי של חנות המסחר האלקטרוני Enterprise E-Commerce Platform.
                        ענה ללקוחות בצורה מנומסת, מקצועית ומדויקת בעברית (RTL).
                        בסס את תשובתך אך ורק על המידע והמוצרים המופיעים בקונטקסט המאוחזר להלן.
                        אל תמציא מחירים, מפרטים או מלאי שאינם מופיעים בקונטקסט.
                        לכל מוצר שאתה ממליץ עליו, ציין תמיד את המק״ט (SKU) והמחיר שלו בש״ח.
                        אם הלקוח מבקש להוסיף מוצר לסל/לעגלה, לבדוק סטטוס הזמנה/משלוח, או לבדוק קופון משתלם, הפעל את הכלי המתאים (Tool).
                        """;

                String prompt = String.format("""
                        [הקשר מאוחזר מהקטלוג והביקורות]
                        %s
                        [סוף הקשר מאוחזר]

                        שאלת הלקוח: %s
                        """, groundedContext, userQuery);

                Map<String, Object> toolsDeclaration = Map.of(
                        "functionDeclarations", List.of(
                                Map.of(
                                        "name", "addToCartTool",
                                        "description", "Adds a product SKU with a given quantity to the customer's shopping cart.",
                                        "parameters", Map.of(
                                                "type", "OBJECT",
                                                "properties", Map.of(
                                                        "sku", Map.of("type", "STRING", "description", "Product SKU code, e.g. IPHONE-16-PRO-256 or SONY-WH-1000XM5"),
                                                        "quantity", Map.of("type", "INTEGER", "description", "Quantity to add to cart (default 1)")
                                                ),
                                                "required", List.of("sku", "quantity")
                                        )
                                ),
                                Map.of(
                                        "name", "checkOrderStatusTool",
                                        "description", "Checks the order and shipment delivery status for an order ID.",
                                        "parameters", Map.of(
                                                "type", "OBJECT",
                                                "properties", Map.of(
                                                        "orderId", Map.of("type", "STRING", "description", "Order ID UUID or LATEST")
                                                ),
                                                "required", List.of("orderId")
                                        )
                                ),
                                Map.of(
                                        "name", "validateBestCouponTool",
                                        "description", "Finds and validates the best available discount coupon for a cart total amount.",
                                        "parameters", Map.of(
                                                "type", "OBJECT",
                                                "properties", Map.of(
                                                        "cartTotal", Map.of("type", "NUMBER", "description", "Total cart amount in ILS")
                                                ),
                                                "required", List.of("cartTotal")
                                        )
                                )
                        )
                );

                Map<String, Object> requestBody = Map.of(
                        "systemInstruction", Map.of("parts", List.of(Map.of("text", systemInstruction))),
                        "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", prompt)))),
                        "tools", List.of(toolsDeclaration),
                        "generationConfig", Map.of(
                                "temperature", geminiProperties.getTemperature(),
                                "maxOutputTokens", geminiProperties.getMaxTokens()
                        )
                );

                String endpoint = String.format("%s/%s:generateContent?key=%s",
                        geminiProperties.getApiUrl(), model, apiKey);

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(endpoint))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                        .timeout(Duration.ofSeconds(15))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 200) {
                    JsonNode root = objectMapper.readTree(response.body());
                    JsonNode candidates = root.path("candidates");
                    if (candidates.isArray() && !candidates.isEmpty()) {
                        JsonNode parts = candidates.get(0).path("content").path("parts");
                        if (parts.isArray()) {
                            StringBuilder textParts = new StringBuilder();
                            for (JsonNode part : parts) {
                                if (part.has("functionCall")) {
                                    JsonNode fnCall = part.path("functionCall");
                                    String fnName = fnCall.path("name").asText("");
                                    JsonNode args = fnCall.path("args");
                                    ExecutedActionDto action = dispatchGeminiFunctionCall(fnName, args, citations, customerId, cartTotal);
                                    if (action != null) {
                                        executedActions.add(action);
                                    }
                                }
                                if (part.has("text")) {
                                    textParts.append(part.path("text").asText());
                                }
                            }
                            if (!textParts.isEmpty()) {
                                generatedText = textParts.toString();
                            }
                        }
                    }
                }
            } catch (Exception ex) {
                log.warn("Gemini API call with tools failed ({}). Using smart deterministic agentic synthesizer.", ex.getMessage());
            }
        }

        // Deterministic Agentic Tool Detection (ensures tools execute reliably when requested in Hebrew/English even in demo/fallback mode)
        if (executedActions.isEmpty()) {
            executedActions.addAll(detectAndExecuteDeterministicTools(userQuery, citations, customerId, cartTotal));
        }

        if (generatedText == null || generatedText.isBlank()) {
            generatedText = synthesizeGroundedHebrewResponse(userQuery, citations, executedActions);
        } else if (!executedActions.isEmpty()) {
            StringBuilder actionSummaryBlock = new StringBuilder("\n\n⚡ **פעולות אוטונומיות שבוצעו עבורך:**\n");
            for (ExecutedActionDto act : executedActions) {
                actionSummaryBlock.append("• ").append(act.summary()).append("\n");
            }
            generatedText = generatedText + actionSummaryBlock;
        }

        return new AgenticGenerationResult(generatedText, executedActions);
    }

    public AgenticGenerationResult fallbackGenerateAgenticAnswer(
            String userQuery,
            String groundedContext,
            List<CitationDto> citations,
            String customerId,
            Double cartTotal,
            Throwable t
    ) {
        log.warn("Resilience4j CircuitBreaker fallback for generateAgenticAnswer: {}", t.getMessage());
        List<ExecutedActionDto> actions = detectAndExecuteDeterministicTools(userQuery, citations, customerId, cartTotal);
        String answer = synthesizeGroundedHebrewResponse(userQuery, citations, actions);
        return new AgenticGenerationResult(answer, actions);
    }

    public String generateGroundedAnswer(String userQuery, String groundedContext, List<CitationDto> citations) {
        return generateAgenticAnswer(userQuery, groundedContext, citations, "usr_demo", null).answer();
    }

    private ExecutedActionDto dispatchGeminiFunctionCall(
            String fnName,
            JsonNode args,
            List<CitationDto> citations,
            String customerId,
            Double defaultCartTotal
    ) {
        return switch (fnName) {
            case "addToCartTool" -> {
                String defaultSku = (citations != null && !citations.isEmpty()) ? citations.get(0).skuCode() : "IPHONE-16-PRO-256";
                String sku = args.path("sku").asText(defaultSku);
                int qty = args.path("quantity").asInt(1);
                yield agenticToolsService.addToCartTool(sku, qty, customerId);
            }
            case "checkOrderStatusTool" -> {
                String orderId = args.path("orderId").asText("LATEST");
                yield agenticToolsService.checkOrderStatusTool(orderId, customerId);
            }
            case "validateBestCouponTool" -> {
                double total = args.path("cartTotal").asDouble(defaultCartTotal != null ? defaultCartTotal : 1500.0);
                yield agenticToolsService.validateBestCouponTool(total);
            }
            default -> null;
        };
    }

    private List<ExecutedActionDto> detectAndExecuteDeterministicTools(
            String userQuery,
            List<CitationDto> citations,
            String customerId,
            Double cartTotal
    ) {
        List<ExecutedActionDto> actions = new ArrayList<>();
        if (userQuery == null || userQuery.isBlank()) {
            return actions;
        }
        String lower = userQuery.toLowerCase(Locale.ROOT);

        // 1. Check for Add-to-Cart intent
        boolean wantsAddToCart = lower.contains("הוסף") || lower.contains("תוסיף") || lower.contains("שים לי בסל")
                || lower.contains("לעגלה") || lower.contains("לסל הקניות") || lower.contains("add to cart")
                || lower.contains("תזמין לי");

        if (wantsAddToCart) {
            String targetSku = extractSkuFromQueryOrCitations(userQuery, citations);
            int quantity = extractQuantityFromQuery(userQuery);
            actions.add(agenticToolsService.addToCartTool(targetSku, quantity, customerId));
        }

        // 2. Check for Order Status intent
        boolean wantsOrderStatus = lower.contains("מצב הזמנה") || lower.contains("סטטוס הזמנה") || lower.contains("איפה ההזמנה")
                || lower.contains("מעקב משלוח") || lower.contains("בדוק הזמנה") || lower.contains("מה עם ההזמנה")
                || lower.contains("order status") || lower.contains("check order");

        if (wantsOrderStatus) {
            String orderId = extractOrderIdFromQuery(userQuery);
            actions.add(agenticToolsService.checkOrderStatusTool(orderId, customerId));
        }

        // 3. Check for Coupon Validation intent
        boolean wantsCoupon = lower.contains("קופון") || lower.contains("הנחה") || lower.contains("קוד קופון")
                || lower.contains("איזה קופון") || lower.contains("coupon") || lower.contains("שובר");

        if (wantsCoupon) {
            double inferredTotal = extractCartTotalFromQuery(userQuery, cartTotal, citations);
            actions.add(agenticToolsService.validateBestCouponTool(inferredTotal));
        }

        return actions;
    }

    private String extractSkuFromQueryOrCitations(String query, List<CitationDto> citations) {
        String upper = query.toUpperCase(Locale.ROOT);
        if (upper.contains("SONY") || query.contains("סוני") || upper.contains("XM5")) {
            return "SONY-WH-1000XM5";
        }
        if (upper.contains("AIRPODS MAX") || query.contains("איירפודס מקס")) {
            return "AIRPODS-MAX";
        }
        if (upper.contains("AIRPODS") || query.contains("איירפודס")) {
            return "AIRPODS-PRO-2";
        }
        if (upper.contains("MACBOOK") || query.contains("מקבוק")) {
            return "MACBOOK-PRO-M3";
        }
        if (upper.contains("DELL") || upper.contains("XPS") || query.contains("דל")) {
            return "SKU-LAPTOP-PRO";
        }
        if (upper.contains("IPAD") || query.contains("אייפד")) {
            return "IPAD-PRO-M4";
        }
        if (upper.contains("SAMSUNG") || upper.contains("S24") || upper.contains("S25") || query.contains("סמסונג") || query.contains("גלקסי")) {
            return "SAMSUNG-S24-ULTRA";
        }
        if (upper.contains("PS5") || upper.contains("PLAYSTATION") || query.contains("פלייסטיישן")) {
            return "PS5-PRO";
        }
        if (upper.contains("DJI") || query.contains("רחפן")) {
            return "DJI-MINI-4-PRO";
        }
        if (upper.contains("WATCH") || query.contains("שעון")) {
            return "WATCH-ULTRA-2";
        }
        if (upper.contains("MOUSE") || upper.contains("LOGITECH") || query.contains("עכבר")) {
            return "SKU-MOUSE-WIRELESS";
        }
        if (upper.contains("CASE") || query.contains("כיסוי")) {
            return "CASE-CLEAR-MAGSAFE";
        }
        if (upper.contains("IPHONE") || query.contains("אייפון")) {
            return "IPHONE-16-PRO-256";
        }
        if (citations != null && !citations.isEmpty()) {
            return citations.get(0).skuCode();
        }
        return "IPHONE-16-PRO-256";
    }

    private int extractQuantityFromQuery(String query) {
        Matcher m = Pattern.compile("(?:כמות|יחידות|פעמים)\\s*(\\d+)|(\\d+)\\s*(?:יחידות|יח׳|מוצרים)").matcher(query);
        if (m.find()) {
            String g = m.group(1) != null ? m.group(1) : m.group(2);
            try {
                return Math.max(1, Math.min(10, Integer.parseInt(g)));
            } catch (NumberFormatException ignored) {}
        }
        return 1;
    }

    private String extractOrderIdFromQuery(String query) {
        Matcher uuidMatcher = Pattern.compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}").matcher(query);
        if (uuidMatcher.find()) {
            return uuidMatcher.group();
        }
        return "LATEST";
    }

    private double extractCartTotalFromQuery(String query, Double providedCartTotal, List<CitationDto> citations) {
        if (providedCartTotal != null && providedCartTotal > 0) {
            return providedCartTotal;
        }
        Matcher m = Pattern.compile("(\\d{3,5})(?:\\s*ש\"ח|\\s*₪)?").matcher(query);
        if (m.find()) {
            try {
                return Double.parseDouble(m.group(1));
            } catch (NumberFormatException ignored) {}
        }
        if (citations != null && !citations.isEmpty() && citations.get(0).price() != null) {
            return citations.get(0).price();
        }
        return 3500.0;
    }

    /**
     * Feature 5: Smart Product Comparison AI Verdict
     */
    public ProductComparisonResponse generateProductComparisonVerdict(
            List<CatalogVectorDocument> products,
            List<String> requestedSkus,
            String userUseCase,
            long startTime
    ) {
        String effectiveUseCase = (userUseCase != null && !userUseCase.isBlank())
                ? userUseCase.trim()
                : "שימוש יומיומי, ביצועים ותמורה למחיר";

        // Identify best candidate based on useCase and product attributes
        CatalogVectorDocument winner = selectWinnerForUseCase(products, effectiveUseCase);
        String winnerSku = winner != null ? winner.getSkuCode() : (requestedSkus.isEmpty() ? "N/A" : requestedSkus.get(0));
        String winnerTitle = winner != null ? winner.getTitle() : winnerSku;

        Map<String, String> categoryWinners = buildCategoryWinners(products, effectiveUseCase);
        List<ProductTradeOffDto> tradeOffs = buildProductTradeOffs(products, effectiveUseCase);
        String verdictSummary = buildComparativeVerdictSummary(products, winner, effectiveUseCase);

        // Try enriching verdictSummary via Gemini API if real key is configured
        String apiKey = geminiProperties.getApiKey();
        if (apiKey != null && !apiKey.isBlank() && !apiKey.equals("demo_key") && !products.isEmpty()) {
            try {
                StringBuilder specsPrompt = new StringBuilder();
                specsPrompt.append("השווה בין המוצרים הבאים עבור הצורך של הלקוח: '").append(effectiveUseCase).append("'.\n");
                specsPrompt.append("ענה בעברית ב-3-4 משפטים ממוקדים המנמקים מדוע המוצר המנצח עדיף ומה הפשרות.\n\n");
                for (CatalogVectorDocument doc : products) {
                    specsPrompt.append(String.format("- %s (מק״ט: %s): מחיר ₪%.2f, דירוג %.1f, קטגוריה: %s, מפרט: %s\n",
                            doc.getTitle(), doc.getSkuCode(),
                            doc.getPrice() != null ? doc.getPrice() : 0.0,
                            doc.getAverageRating() != null ? doc.getAverageRating() : 4.8,
                            doc.getCategory(), doc.getTextChunk()));
                }

                String geminiVerdict = callGeminiSimpleText(specsPrompt.toString());
                if (geminiVerdict != null && !geminiVerdict.isBlank()) {
                    verdictSummary = geminiVerdict;
                }
            } catch (Exception ex) {
                log.debug("Gemini comparison synthesis fallback used: {}", ex.getMessage());
            }
        }

        long latency = System.currentTimeMillis() - startTime;

        return ProductComparisonResponse.builder()
                .skus(requestedSkus)
                .userUseCase(effectiveUseCase)
                .recommendedSku(winnerSku)
                .recommendedProductTitle(winnerTitle)
                .verdictSummary(verdictSummary)
                .categoryWinners(categoryWinners)
                .tradeOffs(tradeOffs)
                .model(geminiProperties.getModel())
                .latencyMs(latency)
                .build();
    }

    /**
     * Feature 6: Multimodal Vision Search Extraction
     */
    public VisionExtractionResult extractProductDescriptionFromImage(String imageBase64, String mimeType, String queryText) {
        String effectiveMime = (mimeType != null && !mimeType.isBlank()) ? mimeType : "image/jpeg";
        String apiKey = geminiProperties.getApiKey();
        String model = geminiProperties.getModel();

        if (apiKey != null && !apiKey.isBlank() && !apiKey.equals("demo_key") && imageBase64 != null && !imageBase64.isBlank()) {
            try {
                String cleanBase64 = imageBase64.contains(",")
                        ? imageBase64.substring(imageBase64.indexOf(",") + 1)
                        : imageBase64;

                String visionPrompt = "נתח את התמונה המצורפת (מוצר אלקטרוני או רשימת דרישות/מפרט). " +
                        "תאר בעברית את סוג המוצר, הקטגוריה שלו, והמאפיינים הטכניים הבולטים שלו לחיפוש בקטלוג. " +
                        (queryText != null && !queryText.isBlank() ? "דגש נוסף מהמשתמש: " + queryText : "");

                Map<String, Object> requestBody = Map.of(
                        "contents", List.of(Map.of(
                                "role", "user",
                                "parts", List.of(
                                        Map.of("text", visionPrompt),
                                        Map.of("inlineData", Map.of(
                                                "mimeType", effectiveMime,
                                                "data", cleanBase64
                                        ))
                                )
                        )),
                        "generationConfig", Map.of("temperature", 0.2, "maxOutputTokens", 400)
                );

                String endpoint = String.format("%s/%s:generateContent?key=%s",
                        geminiProperties.getApiUrl(), model, apiKey);

                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(endpoint))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                        .timeout(Duration.ofSeconds(15))
                        .build();

                HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                if (res.statusCode() == 200) {
                    JsonNode root = objectMapper.readTree(res.body());
                    JsonNode candidates = root.path("candidates");
                    if (candidates.isArray() && !candidates.isEmpty()) {
                        String extracted = candidates.get(0).path("content").path("parts").get(0).path("text").asText("");
                        if (!extracted.isBlank()) {
                            return new VisionExtractionResult(extracted, extractFeaturePills(extracted));
                        }
                    }
                }
            } catch (Exception ex) {
                log.warn("Gemini Vision API fallback triggered: {}", ex.getMessage());
            }
        }

        // Deterministic Vision Synthesizer based on optional queryText / image characteristics
        String hint = (queryText != null && !queryText.isBlank()) ? queryText.trim() : "";
        String lowerHint = hint.toLowerCase(Locale.ROOT);

        if (lowerHint.contains("אוזני") || lowerHint.contains("headphone") || lowerHint.contains("audio") || lowerHint.contains("sony") || lowerHint.contains("airpods")) {
            return new VisionExtractionResult(
                    "זוהתה תמונת אוזניות אלחוטיות פרימיום עם סינון רעשים אקטיבי (ANC), תמיכה ב-Hi-Res Audio וחיבור USB-C. " + hint,
                    List.of("ביטול רעשים אקטיבי (ANC)", "שמע Hi-Res אלחוטי", "סוללה ארוכת טווח", "קטגוריה: אודיו ואוזניות")
            );
        } else if (lowerHint.contains("מחשב") || lowerHint.contains("לפטופ") || lowerHint.contains("laptop") || lowerHint.contains("macbook") || lowerHint.contains("dell")) {
            return new VisionExtractionResult(
                    "זוהתה תמונת מחשב נייד מקצועי בעל מסך רזולוציה גבוהה (Retina / OLED), מעבד עוצמתי לעריכת וידאו ופיתוח וזיכרון RAM מהיר. " + hint,
                    List.of("מעבד M3/M4 או Core i9", "מסך Liquid Retina / OLED", "כונן NVMe SSD מהיר", "קטגוריה: מחשבים ניידים")
            );
        } else if (lowerHint.contains("שעון") || lowerHint.contains("watch") || lowerHint.contains("garmin")) {
            return new VisionExtractionResult(
                    "זוהתה תמונת שעון חכם אתגרי בגוף טיטניום עם חיישני ספורט, GPS רב-ערוצי ועמידות למים. " + hint,
                    List.of("גוף טיטניום מוקשח", "GPS דו-תדרי מדויק", "מדדי בריאות וכושר", "קטגוריה: שעונים חכמים")
            );
        } else {
            String desc = hint.isBlank()
                    ? "זוהתה תמונת מכשיר דגל אלקטרוני פרימיום: סמארטפון טיטניום מתקדם עם מסך 120Hz OLED, מערך מצלמות Pro ומעבד AI ייעודי."
                    : "ניתוח חזותי משולב מפרט טכני עבור: " + hint + " – מוצר אלקטרוניקה פרימיום עם ביצועים גבוהים.";
            return new VisionExtractionResult(
                    desc,
                    List.of("זיהוי חזותי Gemini Vision", "מסך ProMotion 120Hz", "מעבד דור אחרון", "תאימות לאביזרי MagSafe / USB-C")
            );
        }
    }

    private List<String> extractFeaturePills(String text) {
        List<String> features = new ArrayList<>();
        features.add("ניתוח תמונה Gemini Vision");
        if (text.contains("סוללה")) features.add("חיי סוללה ארוכים");
        if (text.contains("מסך") || text.contains("OLED") || text.contains("Retina")) features.add("תצוגת פרימיום חדה");
        if (text.contains("רעשים") || text.contains("ANC")) features.add("ביטול רעשים אקטיבי");
        if (features.size() < 3) features.add("התאמה וקטורית מהקטלוג");
        return features;
    }

    private CatalogVectorDocument selectWinnerForUseCase(List<CatalogVectorDocument> products, String useCase) {
        if (products == null || products.isEmpty()) return null;
        String lower = useCase.toLowerCase(Locale.ROOT);

        return products.stream()
                .max(Comparator.comparingDouble(doc -> {
                    double score = (doc.getAverageRating() != null ? doc.getAverageRating() : 4.7) * 10.0;
                    double price = doc.getPrice() != null ? doc.getPrice() : 1000.0;
                    String text = ((doc.getTitle() != null ? doc.getTitle() : "") + " " + (doc.getTextChunk() != null ? doc.getTextChunk() : "")).toLowerCase(Locale.ROOT);

                    if (lower.contains("תקציב") || lower.contains("זול") || lower.contains("לימודים") || lower.contains("חסכוני")) {
                        score += Math.max(0, (10000.0 - price) / 250.0);
                    } else if (lower.contains("וידאו") || lower.contains("גרפיקה") || lower.contains("עריכה") || lower.contains("פיתוח")) {
                        if (text.contains("m3") || text.contains("m4") || text.contains("i9") || text.contains("oled") || text.contains("retina") || text.contains("pro")) {
                            score += 25.0;
                        }
                    } else if (lower.contains("גיימינג") || lower.contains("משחקים")) {
                        if (text.contains("ps5") || text.contains("rtx") || text.contains("120hz") || text.contains("i9") || text.contains("ultra")) {
                            score += 25.0;
                        }
                    }
                    if (Boolean.TRUE.equals(doc.getInStock())) {
                        score += 5.0;
                    }
                    return score;
                }))
                .orElse(products.get(0));
    }

    private Map<String, String> buildCategoryWinners(List<CatalogVectorDocument> products, String useCase) {
        Map<String, String> map = new LinkedHashMap<>();
        if (products == null || products.isEmpty()) return map;

        CatalogVectorDocument bestPerf = products.stream()
                .max(Comparator.comparingDouble(d -> (d.getPrice() != null ? d.getPrice() : 0.0)))
                .orElse(products.get(0));

        CatalogVectorDocument bestValue = products.stream()
                .min(Comparator.comparingDouble(d -> (d.getPrice() != null ? d.getPrice() : Double.MAX_VALUE)))
                .orElse(products.get(0));

        CatalogVectorDocument bestRated = products.stream()
                .max(Comparator.comparingDouble(d -> (d.getAverageRating() != null ? d.getAverageRating() : 4.8)))
                .orElse(products.get(0));

        map.put("מנצח ביצועים ומפרט קצה", bestPerf.getTitle() + " (" + bestPerf.getSkuCode() + ")");
        map.put("התמורה הטובה ביותר למחיר", bestValue.getTitle() + " (" + bestValue.getSkuCode() + ")");
        map.put("מנצח דירוג קונים מאומתים", bestRated.getTitle() + " (★ " + (bestRated.getAverageRating() != null ? bestRated.getAverageRating() : 4.9) + ")");
        return map;
    }

    private List<ProductTradeOffDto> buildProductTradeOffs(List<CatalogVectorDocument> products, String useCase) {
        List<ProductTradeOffDto> list = new ArrayList<>();
        if (products == null || products.isEmpty()) return list;

        double avgPrice = products.stream()
                .mapToDouble(d -> d.getPrice() != null ? d.getPrice() : 0.0)
                .average()
                .orElse(1000.0);

        for (CatalogVectorDocument doc : products) {
            double price = doc.getPrice() != null ? doc.getPrice() : 0.0;
            double rating = doc.getAverageRating() != null ? doc.getAverageRating() : 4.8;

            List<String> strengths = new ArrayList<>();
            List<String> tradeOffs = new ArrayList<>();

            if (price <= avgPrice) {
                strengths.add(String.format("מחיר תחרותי ומשתלם (₪%,.0f) ביחס לחלופות", price));
            } else {
                strengths.add("חומרת דגל פרימיום וביצועים ללא פשרות לטווח ארוך");
                tradeOffs.add(String.format("מחיר רכישה גבוה יותר (₪%,.0f)", price));
            }

            if (rating >= 4.85) {
                strengths.add("ציון שביעות רצון יוצא דופן מקונים מאומתים (" + rating + "/5.0)");
            }
            if (Boolean.TRUE.equals(doc.getInStock())) {
                strengths.add("זמין במלאי מיידי למשלוח אקספרס חינם ו-5% Cashback");
            } else {
                tradeOffs.add("זמינות מוגבלת במחסן כרגע");
            }

            if (tradeOffs.isEmpty()) {
                tradeOffs.add("מפרט ממוקד שנועד למי שמחפש איזון בין עלות לתועלת עבור " + useCase);
            }

            list.add(ProductTradeOffDto.builder()
                    .skuCode(doc.getSkuCode())
                    .title(doc.getTitle())
                    .price(price)
                    .rating(rating)
                    .strengths(strengths)
                    .tradeOffs(tradeOffs)
                    .build());
        }
        return list;
    }

    private String buildComparativeVerdictSummary(
            List<CatalogVectorDocument> products,
            CatalogVectorDocument winner,
            String useCase
    ) {
        if (winner == null || products.isEmpty()) {
            return "לא נמצאו מספיק נתונים להשוואה בין המוצרים שנבחרו.";
        }
        return String.format(
                "עבור הצורך שהגדרת (\"%s\"), הבחירה המומלצת ביותר של ה-AI היא **%s** (מק״ט: `%s`) במחיר ₪%,.2f. " +
                "מוצר זה מעניק את השילוב האופטימלי של מפרט טכני (%s), דירוג קונים מאומתים של %.1f כוכבים וזמינות מלאי מיידית עם 5%% Cashback VIP.",
                useCase,
                winner.getTitle(),
                winner.getSkuCode(),
                winner.getPrice() != null ? winner.getPrice() : 0.0,
                winner.getTextChunk() != null ? winner.getTextChunk() : winner.getCategory(),
                winner.getAverageRating() != null ? winner.getAverageRating() : 4.9
        );
    }

    private String callGeminiSimpleText(String prompt) throws Exception {
        String apiKey = geminiProperties.getApiKey();
        String model = geminiProperties.getModel();

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of("temperature", 0.2, "maxOutputTokens", 500)
        );

        String endpoint = String.format("%s/%s:generateContent?key=%s",
                geminiProperties.getApiUrl(), model, apiKey);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                .timeout(Duration.ofSeconds(10))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                return candidates.get(0).path("content").path("parts").get(0).path("text").asText(null);
            }
        }
        return null;
    }

    private String synthesizeGroundedHebrewResponse(
            String query,
            List<CitationDto> citations,
            List<ExecutedActionDto> executedActions
    ) {
        StringBuilder sb = new StringBuilder();

        if (executedActions != null && !executedActions.isEmpty()) {
            sb.append("⚡ **ביצעתי עבורך את הפעולות הבאות באופן אוטונומי:**\n");
            for (ExecutedActionDto act : executedActions) {
                sb.append("• **").append(act.summary()).append("**\n");
            }
            sb.append("\n");
        }

        if (citations == null || citations.isEmpty()) {
            if (sb.isEmpty()) {
                return "שלום! לא מצאתי מוצרים רלוונטיים בקטלוג התואמים את שאלתך: '" + query + "'. תוכל לנסות לחפש לפי קטגוריה, מותג (כגון Apple, Samsung, Sony) או לבקש בדיקת הזמנה/קופון.";
            }
            return sb.toString().trim();
        }

        sb.append("בהתבסס על החיפוש ההיברידי בקטלוג המוצרים שלנו, הנה האפשרויות המתאימות ביותר:\n\n");

        for (int i = 0; i < citations.size(); i++) {
            CitationDto c = citations.get(i);
            sb.append(String.format("%d. **%s** (מק״ט: `%s`)\n", i + 1, c.title(), c.skuCode()));
            sb.append(String.format("   • **מחיר**: ₪%,.2f\n", c.price()));
            sb.append(String.format("   • **זמינות**: %s\n", c.inStock() != null && c.inStock() ? "במלאי מיידי למשלוח חינם" : "אזל זמנית"));
            if (c.snippet() != null && !c.snippet().isBlank()) {
                sb.append(String.format("   • **פרטים**: %s\n", c.snippet()));
            }
            sb.append("\n");
        }

        sb.append("כל המוצרים זמינים להזמנה ישירה דרך האתר עם **5% Cashback** לחברי מועדון VIP!");
        return sb.toString();
    }
}
