package com.company.ragservice.controller;

import com.company.ragservice.config.GeminiProperties;
import com.company.ragservice.dto.RagQueryRequest;
import com.company.ragservice.dto.RagQueryResponse;
import com.company.ragservice.dto.VectorSyncRequest;
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
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/rag")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI RAG Service", description = "Endpoints for Vector Retrieval & Google Gemini Generation")
public class RagController {

    private final RagOrchestrationService ragOrchestrationService;
    private final CatalogIndexingService catalogIndexingService;
    private final CatalogVectorRepository catalogVectorRepository;
    private final GeminiProperties geminiProperties;

    @PostMapping("/query")
    @Operation(summary = "Ask a grounded question over catalog and reviews")
    public ResponseEntity<RagQueryResponse> query(@Valid @RequestBody RagQueryRequest request) {
        RagQueryResponse response = ragOrchestrationService.processQuery(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Stream generated answer tokens in real-time via Server-Sent Events (SSE)")
    public SseEmitter streamQuery(
            @RequestParam("query") String query,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "maxPrice", required = false) Double maxPrice,
            @RequestParam(value = "inStockOnly", required = false) Boolean inStockOnly,
            @RequestParam(value = "topK", required = false, defaultValue = "4") Integer topK
    ) {
        RagQueryRequest request = RagQueryRequest.builder()
                .query(query)
                .categoryFilter(category)
                .maxPrice(maxPrice)
                .inStockOnly(inStockOnly)
                .topK(topK)
                .build();

        SseEmitter emitter = new SseEmitter(60_000L); // 60s timeout
        ragOrchestrationService.streamQuery(request, emitter);
        return emitter;
    }

    @PostMapping("/sync")
    @Operation(summary = "Bulk sync and generate embeddings for catalog items")
    public ResponseEntity<Map<String, Object>> syncCatalog(@RequestBody VectorSyncRequest request) {
        int count = catalogIndexingService.syncBatch(request);
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
                "vectorStore", "MongoDB Atlas Vector Search",
                "indexedDocuments", count,
                "llmProvider", geminiProperties.getProvider(),
                "llmModel", geminiProperties.getModel(),
                "virtualThreadsEnabled", true
        ));
    }
}
