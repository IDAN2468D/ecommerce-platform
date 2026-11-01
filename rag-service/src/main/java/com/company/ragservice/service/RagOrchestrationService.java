package com.company.ragservice.service;

import com.company.ragservice.config.GeminiProperties;
import com.company.ragservice.dto.CitationDto;
import com.company.ragservice.dto.RagQueryRequest;
import com.company.ragservice.dto.RagQueryResponse;
import com.company.ragservice.entity.CatalogVectorDocument;
import com.company.ragservice.repository.VectorSearchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class RagOrchestrationService {

    private final EmbeddingService embeddingService;
    private final VectorSearchRepository vectorSearchRepository;
    private final GeminiGenerationService geminiGenerationService;
    private final GeminiProperties geminiProperties;

    public RagQueryResponse processQuery(RagQueryRequest request) {
        long startTime = System.currentTimeMillis();
        String query = request.query();
        int topK = (request.topK() != null && request.topK() > 0) ? request.topK() : 4;

        log.info("Processing RAG query: '{}' [Category: {}, MaxPrice: {}, TopK: {}]",
                query, request.categoryFilter(), request.maxPrice(), topK);

        // 1. Generate Query Embedding
        List<Float> queryVector = embeddingService.generateEmbedding(query);

        // 2. Vector Search Retrieval from MongoDB Atlas
        List<VectorSearchRepository.ScoredDocument> matches = vectorSearchRepository.searchSimilar(
                queryVector,
                request.categoryFilter(),
                request.maxPrice(),
                request.inStockOnly(),
                topK
        );

        // 3. Assemble Citations and Context Chunks
        List<CitationDto> citations = new ArrayList<>();
        StringBuilder contextBuilder = new StringBuilder();

        for (VectorSearchRepository.ScoredDocument scored : matches) {
            CatalogVectorDocument doc = scored.document();
            CitationDto citation = CitationDto.builder()
                    .skuCode(doc.getSkuCode())
                    .title(doc.getTitle())
                    .price(doc.getPrice())
                    .relevanceScore(Math.round(scored.score() * 100.0) / 100.0)
                    .category(doc.getCategory())
                    .inStock(doc.getInStock())
                    .snippet(doc.getTextChunk())
                    .build();
            citations.add(citation);

            contextBuilder.append(String.format("- מוצר: %s (מק״ט: %s), קטגוריה: %s, מחיר: ₪%.2f, זמינות: %s, תיאור: %s\n",
                    doc.getTitle(), doc.getSkuCode(), doc.getCategory(), doc.getPrice(),
                    doc.getInStock() != null && doc.getInStock() ? "במלאי" : "אזל",
                    doc.getTextChunk()));
        }

        // 4. Grounded Generation using Google Gemini gemini-3.5-flash-lite
        String generatedAnswer = geminiGenerationService.generateGroundedAnswer(
                query,
                contextBuilder.toString(),
                citations
        );

        long latency = System.currentTimeMillis() - startTime;
        double confidence = citations.isEmpty() ? 0.3 : Math.min(0.98, citations.get(0).relevanceScore() + 0.1);

        return RagQueryResponse.builder()
                .query(query)
                .answer(generatedAnswer)
                .citations(citations)
                .confidenceScore(confidence)
                .model(geminiProperties.getModel())
                .latencyMs(latency)
                .retrievedDocumentsCount(citations.size())
                .build();
    }

    /**
     * Streams the generated tokens via SSE for real-time customer UX.
     * Runs in a Virtual Thread without blocking application server threads.
     */
    public void streamQuery(RagQueryRequest request, SseEmitter emitter) {
        CompletableFuture.runAsync(() -> {
            try {
                RagQueryResponse fullResponse = processQuery(request);

                // Emit Citations metadata event first
                emitter.send(SseEmitter.event()
                        .name("citations")
                        .data(Map.of("citations", fullResponse.citations(), "model", fullResponse.model())));

                // Stream tokens word by word with micro-pauses for natural reading pacing
                String answer = fullResponse.answer();
                String[] words = answer.split(" ");
                for (int i = 0; i < words.length; i++) {
                    String piece = (i == 0 ? "" : " ") + words[i];
                    emitter.send(SseEmitter.event()
                            .name("token")
                            .data(Map.of("text", piece, "done", false)));
                    Thread.sleep(25);
                }

                // Final event
                emitter.send(SseEmitter.event()
                        .name("complete")
                        .data(Map.of("done", true, "latencyMs", fullResponse.latencyMs())));
                emitter.complete();
            } catch (Exception ex) {
                log.error("SSE stream error during RAG generation: {}", ex.getMessage());
                try {
                    emitter.send(SseEmitter.event().name("error").data(Map.of("error", ex.getMessage())));
                } catch (IOException ignored) {}
                emitter.completeWithError(ex);
            }
        });
    }
}
