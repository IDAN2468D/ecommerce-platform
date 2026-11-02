package com.company.ragservice.controller;

import com.company.ragservice.config.GeminiProperties;
import com.company.ragservice.dto.*;
import com.company.ragservice.repository.CatalogVectorRepository;
import com.company.ragservice.service.CatalogIndexingService;
import com.company.ragservice.service.RagOrchestrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rag")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI RAG Service", description = "Single Source of Truth for Vector Retrieval, Hybrid Search, Agentic Tools, Product Comparison & Multimodal Vision")
public class RagController {

    private final RagOrchestrationService ragOrchestrationService;
    private final CatalogIndexingService catalogIndexingService;
    private final CatalogVectorRepository catalogVectorRepository;
    private final GeminiProperties geminiProperties;

    @PostMapping("/query")
    @Operation(summary = "Ask a grounded question with Hybrid Search and Agentic Function Calling")
    public ResponseEntity<RagQueryResponse> query(
            @RequestHeader(value = "X-Customer-Id", required = false) String headerCustomerId,
            @Valid @RequestBody RagQueryRequest request
    ) {
        RagQueryRequest effectiveRequest = request;
        if ((request.customerId() == null || request.customerId().isBlank()) && headerCustomerId != null && !headerCustomerId.isBlank()) {
            effectiveRequest = RagQueryRequest.builder()
                    .query(request.query())
                    .conversationId(request.conversationId())
                    .customerId(headerCustomerId)
                    .category(request.category())
                    .categoryFilter(request.categoryFilter())
                    .maxPrice(request.maxPrice())
                    .minRating(request.minRating())
                    .onlyInStock(request.onlyInStock())
                    .inStockOnly(request.inStockOnly())
                    .topK(request.topK())
                    .minSimilarity(request.minSimilarity())
                    .cartTotal(request.cartTotal())
                    .build();
        }
        RagQueryResponse response = ragOrchestrationService.processQuery(effectiveRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/compare")
    @Operation(summary = "Generate an AI comparative verdict for 2-3 products tailored to a customer use case")
    public ResponseEntity<ProductComparisonResponse> compareProducts(@Valid @RequestBody ProductComparisonRequest request) {
        return ResponseEntity.ok(ragOrchestrationService.compareProducts(request));
    }

    @PostMapping(value = "/multimodal-search", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Multimodal search using Base64 image and optional text query")
    public ResponseEntity<MultimodalSearchResponse> multimodalSearchJson(@RequestBody MultimodalSearchRequest request) {
        return ResponseEntity.ok(ragOrchestrationService.multimodalSearch(request));
    }

    @PostMapping(value = "/multimodal-search", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Multimodal search using Multipart image upload and optional text query")
    public ResponseEntity<MultimodalSearchResponse> multimodalSearchMultipart(
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "queryText", required = false) String queryText,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "maxPrice", required = false) Double maxPrice,
            @RequestParam(value = "onlyInStock", required = false, defaultValue = "true") Boolean onlyInStock,
            @RequestParam(value = "topK", required = false, defaultValue = "4") Integer topK
    ) throws Exception {
        String base64 = null;
        String mimeType = "image/jpeg";
        if (image != null && !image.isEmpty()) {
            base64 = Base64.getEncoder().encodeToString(image.getBytes());
            if (image.getContentType() != null) {
                mimeType = image.getContentType();
            }
        }
        MultimodalSearchRequest req = MultimodalSearchRequest.builder()
                .imageBase64(base64)
                .mimeType(mimeType)
                .queryText(queryText)
                .category(category)
                .maxPrice(maxPrice)
                .onlyInStock(onlyInStock)
                .topK(topK)
                .build();
        return ResponseEntity.ok(ragOrchestrationService.multimodalSearch(req));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Stream generated answer tokens in real-time via Server-Sent Events (SSE)")
    public SseEmitter streamQuery(
            @RequestParam("query") String query,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "maxPrice", required = false) Double maxPrice,
            @RequestParam(value = "minRating", required = false) Double minRating,
            @RequestParam(value = "onlyInStock", required = false) Boolean onlyInStock,
            @RequestParam(value = "inStockOnly", required = false) Boolean inStockOnly,
            @RequestParam(value = "topK", required = false, defaultValue = "4") Integer topK
    ) {
        RagQueryRequest request = RagQueryRequest.builder()
                .query(query)
                .category(category)
                .maxPrice(maxPrice)
                .minRating(minRating)
                .onlyInStock(onlyInStock != null ? onlyInStock : inStockOnly)
                .topK(topK)
                .build();

        SseEmitter emitter = new SseEmitter(60_000L);
        ragOrchestrationService.streamQuery(request, emitter);
        return emitter;
    }

    @PostMapping("/sync")
    @Operation(summary = "Bulk sync and generate embeddings for catalog items")
    public ResponseEntity<Map<String, Object>> syncCatalog(@RequestBody(required = false) VectorSyncRequest request) {
        int count = request != null ? catalogIndexingService.syncBatch(request) : 0;
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "indexedCount", count,
                "totalInStore", catalogVectorRepository.count()
        ));
    }

    @GetMapping("/health")
    @Operation(summary = "Check RAG vector store and Gemini LLM health")
    public ResponseEntity<Map<String, Object>> health() {
        long count = catalogVectorRepository.count();
        return ResponseEntity.ok(Map.of(
                "service", "rag-service",
                "status", "UP",
                "vectorStore", "MongoDB Atlas Vector Search (Hybrid + Reranking)",
                "indexedDocuments", count,
                "llmProvider", geminiProperties.getProvider(),
                "llmModel", geminiProperties.getModel(),
                "agenticTools", true,
                "virtualThreadsEnabled", true
        ));
    }
}
