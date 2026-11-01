package com.company.recommendationloyaltyservice.rag.controller;

import com.company.recommendationloyaltyservice.rag.config.RagConfig;
import com.company.recommendationloyaltyservice.rag.dto.RagQueryRequest;
import com.company.recommendationloyaltyservice.rag.dto.RagQueryResponse;
import com.company.recommendationloyaltyservice.rag.repository.ProductVectorRepository;
import com.company.recommendationloyaltyservice.rag.service.RagOrchestratorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/rag")
@Tag(name = "AI RAG Engine", description = "Retrieval-Augmented Generation & Intelligent Shopping Assistant")
public class RagController {

    private final RagOrchestratorService ragOrchestratorService;
    private final ProductVectorRepository vectorRepository;
    private final RagConfig ragConfig;

    public RagController(RagOrchestratorService ragOrchestratorService,
                         ProductVectorRepository vectorRepository,
                         RagConfig ragConfig) {
        this.ragOrchestratorService = ragOrchestratorService;
        this.vectorRepository = vectorRepository;
        this.ragConfig = ragConfig;
    }

    @PostMapping("/query")
    @Operation(summary = "Query RAG Shopping Assistant", description = "Retrieves relevant product vectors and generates grounded answer")
    public ResponseEntity<RagQueryResponse> query(@Valid @RequestBody RagQueryRequest request) {
        RagQueryResponse response = ragOrchestratorService.query(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Stream RAG Response (SSE)", description = "Streams tokens and product citations in real time")
    public SseEmitter streamQuery(
            @RequestParam String query,
            @RequestParam(required = false) String conversationId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer topK
    ) {
        SseEmitter emitter = new SseEmitter(60000L);
        ragOrchestratorService.streamQuery(query, category, topK, emitter);
        return emitter;
    }

    @GetMapping("/health")
    @Operation(summary = "RAG Service Health & Status", description = "Reports RAG engine status, indexed vector count, and active LLM")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "recommendation-loyalty-service (Consolidated RAG)",
                "llmProvider", "google-gemini",
                "llmModel", ragConfig.getGeminiModel(),
                "vectorStore", "MongoDB Atlas Vector Search",
                "indexedDocuments", vectorRepository.count(),
                "virtualThreadsEnabled", true
        ));
    }

    @PostMapping("/sync")
    @Operation(summary = "Sync Catalog Embeddings", description = "Triggers indexing of catalog items into MongoDB vector store")
    public ResponseEntity<Map<String, Object>> sync() {
        ragOrchestratorService.seedProducts();
        return ResponseEntity.ok(Map.of(
                "status", "COMPLETED",
                "totalIndexed", vectorRepository.count()
        ));
    }
}
