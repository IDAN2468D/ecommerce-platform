package com.company.ragservice.service;

import com.company.ragservice.config.GeminiProperties;
import com.company.ragservice.dto.CitationDto;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiGenerationService {

    private final GeminiProperties geminiProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(6))
            .build();

    /**
     * Generates a grounded response using Google Gemini gemini-3.5-flash-lite.
     */
    @CircuitBreaker(name = "geminiLlm", fallbackMethod = "fallbackGenerateGroundedAnswer")
    public String generateGroundedAnswer(String userQuery, String groundedContext, List<CitationDto> citations) {
        String apiKey = geminiProperties.getApiKey();
        String model = geminiProperties.getModel(); // default: gemini-3.5-flash-lite

        log.info("Invoking Google Gemini LLM [{}] for query: '{}' with {} context citations", model, userQuery, citations.size());

        if (apiKey != null && !apiKey.isBlank() && !apiKey.equals("demo_key")) {
            try {
                String systemInstruction = """
                        אתה העוזר החכם והרשמי של חנות המסחר האלקטרוני Enterprise E-Commerce Platform.
                        ענה ללקוחות בצורה מנומסת, מקצועית ומדויקת בעברית (RTL).
                        בסס את תשובתך אך ורק על המידע והמוצרים המופיעים בקונטקסט המאוחזר להלן.
                        אל תמציא מחירים, מפרטים או מלאי שאינם מופיעים בקונטקסט.
                        לכל מוצר שאתה ממליץ עליו, ציין תמיד את המק״ט (SKU) והמחיר שלו בש״ח או בדולר.
                        """;

                String prompt = String.format("""
                        [הקשר מאוחזר מהקטלוג והביקורות]
                        %s
                        [סוף הקשר מאוחזר]

                        שאלת הלקוח: %s
                        """, groundedContext, userQuery);

                Map<String, Object> requestBody = Map.of(
                        "systemInstruction", Map.of("parts", List.of(Map.of("text", systemInstruction))),
                        "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", prompt)))),
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
                        JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                        if (!textNode.isMissingNode()) {
                            String generated = textNode.asText();
                            log.info("Gemini [{}] generated response of length {}", model, generated.length());
                            return generated;
                        }
                    }
                } else {
                    log.warn("Gemini API error ({}): {}. Using smart grounded template.", response.statusCode(), response.body());
                }
            } catch (Exception ex) {
                log.warn("Gemini API call failed ({}). Using smart grounded fallback synthesizer.", ex.getMessage());
            }
        }

        // Deterministic Grounded Synthesizer (when external key is not set or in local demo mode)
        return synthesizeGroundedHebrewResponse(userQuery, citations);
    }

    /**
     * Fallback method triggered by Resilience4j CircuitBreaker if Gemini API fails or times out.
     */
    public String fallbackGenerateGroundedAnswer(String userQuery, String groundedContext, List<CitationDto> citations, Throwable t) {
        log.warn("Resilience4j CircuitBreaker opened for geminiLlm: {}. Serving grounded fallback answer.", t.getMessage());
        return synthesizeGroundedHebrewResponse(userQuery, citations);
    }

    /**
     * Smart local grounded synthesizer that formats a high-quality Hebrew answer
     * directly from the retrieved vector citations.
     */
    private String synthesizeGroundedHebrewResponse(String query, List<CitationDto> citations) {
        if (citations == null || citations.isEmpty()) {
            return "שלום! לא מצאתי מוצרים רלוונטיים בקטלוג התואמים את שאלתך: '" + query + "'. תוכל לנסות לחפש לפי קטגוריה, מותג (כגון Apple, Samsung, Anker) או לפנות לשירות הלקוחות שלנו.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("בהתבסס על החיפוש בקטלוג המוצרים שלנו, הנה האפשרויות המתאימות ביותר לשאלתך:\n\n");

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
