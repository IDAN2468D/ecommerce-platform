package com.company.recommendationloyaltyservice.rag.service;

import com.company.recommendationloyaltyservice.rag.config.RagConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Service
public class EmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);
    private static final int DIMENSIONS = 768;

    private final RestClient restClient;
    private final RagConfig ragConfig;

    public EmbeddingService(RestClient ragVirtualThreadRestClient, RagConfig ragConfig) {
        this.restClient = ragVirtualThreadRestClient;
        this.ragConfig = ragConfig;
    }

    /**
     * Generates a 768-dimensional normalized vector for given text.
     */
    public List<Double> generateEmbedding(String text) {
        if (text == null || text.isBlank()) {
            return Collections.nCopies(DIMENSIONS, 0.0);
        }

        String apiKey = ragConfig.getGeminiApiKey();
        if (apiKey != null && !apiKey.isBlank() && !apiKey.equals("demo_key")) {
            try {
                String url = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=" + apiKey;
                Map<String, Object> body = Map.of(
                        "model", "models/text-embedding-004",
                        "content", Map.of("parts", List.of(Map.of("text", text)))
                );

                Map response = restClient.post()
                        .uri(url)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(body)
                        .retrieve()
                        .body(Map.class);

                if (response != null && response.containsKey("embedding")) {
                    Map embMap = (Map) response.get("embedding");
                    List values = (List) embMap.get("values");
                    if (values != null && !values.isEmpty()) {
                        List<Double> result = new ArrayList<>(values.size());
                        for (Object val : values) {
                            result.add(((Number) val).doubleValue());
                        }
                        return result;
                    }
                }
            } catch (Exception e) {
                log.warn("Gemini Embedding API call failed, using deterministic embedding fallback: {}", e.getMessage());
            }
        }

        return generateDeterministicEmbedding(text);
    }

    private List<Double> generateDeterministicEmbedding(String text) {
        List<Double> vector = new ArrayList<>(DIMENSIONS);
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] seedBytes = md.digest(text.toLowerCase().trim().getBytes(StandardCharsets.UTF_8));
            Random random = new Random(Arrays.hashCode(seedBytes));

            double sumSquares = 0.0;
            for (int i = 0; i < DIMENSIONS; i++) {
                double val = (random.nextGaussian());
                vector.add(val);
                sumSquares += val * val;
            }

            double norm = Math.sqrt(sumSquares);
            if (norm > 0) {
                for (int i = 0; i < DIMENSIONS; i++) {
                    vector.set(i, vector.get(i) / norm);
                }
            }
        } catch (Exception ex) {
            for (int i = 0; i < DIMENSIONS; i++) {
                vector.add(1.0 / Math.sqrt(DIMENSIONS));
            }
        }
        return vector;
    }
}
