# Architectural Specification: In-Process RAG Engine Consolidation (`recommendation-loyalty-service`)

- **Document ID**: SPEC-2026-RAG-002
- **Status**: PROPOSED (Awaiting Team Lead Approval)
- **Author**: Antigravity Pair Programmer
- **Reviewer**: Idan (Team Lead)
- **Target Microservice**: `recommendation-loyalty-service` (Port 8089)
- **Target Stack**: Java 21 LTS (Virtual Threads), Spring Boot 3.3.5 / 3.4.x, MongoDB Atlas Vector Search, Google Gemini `gemini-3.5-flash-lite`, Apache Kafka, Micrometer / OpenZipkin
- **Governance**: Spec-First (`.agents/GOVERNANCE.md`)

---

## 1. System Placement & Motivation

### 1.1 Motivation
Consolidate the RAG engine directly into `recommendation-loyalty-service` rather than maintaining an independent JVM process (`rag-service`).
- **Resource Optimization**: Eliminates the overhead of a dedicated JVM instance, saving ~384MB RAM in Docker.
- **Domain Synergy**: Recommendations, Loyalty Rewards, and RAG Assisted Sales share catalog intelligence, co-purchase graphs, and customer context.
- **High Concurrency**: Utilizes Java 21 Virtual Threads (`spring.threads.virtual.enabled=true`) to handle blocking LLM and Vector Search I/O without thread pool contention.

### 1.2 Routing & Network Boundaries
- **API Gateway Routing**: Requests matching `/api/v1/rag/**` are routed to `http://recommendation-loyalty-service:8089/api/v1/rag/**`.
- **Stateless & Scalable**: All vector documents and chat histories reside in MongoDB Atlas and Redis; instances remain horizontally scalable.

---

## 2. Modular Package Structure

```
recommendation-loyalty-service/src/main/java/com/company/recommendationloyaltyservice/rag/
├── config/
│   └── RagConfig.java                 # RestClient with Virtual Threads, Gemini credentials, timeouts
├── controller/
│   └── RagController.java             # REST & SSE endpoints: /api/v1/rag/query, /stream, /sync, /health
├── dto/
│   ├── RagQueryRequest.java           # Incoming query, conversationId, category filter, topK
│   ├── RagQueryResponse.java          # Grounded Hebrew answer, citations, confidence, latencyMs
│   └── CitationDto.java               # SKU, title, price, category, stock, relevance score
├── model/
│   └── ProductVectorDocument.java     # MongoDB collection "catalog_embeddings" (768-dim vector)
├── repository/
│   └── ProductVectorRepository.java   # MongoDB Atlas $vectorSearch aggregation & Cosine fallback
└── service/
    ├── EmbeddingService.java          # 768-dim normalized embedding generator (text-embedding-004)
    ├── ProductSyncConsumer.java       # Kafka listener on product/rating topics for continuous indexing
    └── RagOrchestratorService.java    # Pipeline: Embed -> Retrieve -> Ground -> Generate (Gemini 3.5)
```

---

## 3. Data Schema & MongoDB Vector Definition

### 3.1 Document Entity (`ProductVectorDocument.java`)
- **Collection Name**: `catalog_embeddings`
- **Fields**:
  - `id`: String (UUID)
  - `skuCode`: String (Unique index)
  - `title`: String
  - `textChunk`: String (Descriptive chunk used for embedding)
  - `category`: String (Pre-filter metadata)
  - `price`: Double (Pre-filter metadata)
  - `inStock`: Boolean (Pre-filter metadata)
  - `averageRating`: Double
  - `embedding`: List<Double> (768 dimensions)
  - `lastIndexedAt`: Instant

### 3.2 MongoDB Atlas Vector Search Index
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "category"
    },
    {
      "type": "filter",
      "path": "inStock"
    }
  ]
}
```

---

## 4. REST & SSE API Contracts

### 4.1 POST `/api/v1/rag/query`
- **Request Body**:
```json
{
  "query": "איזה מחשב נייד מתאים לגרפיקה ועריכת וידאו?",
  "conversationId": "conv_client_session",
  "category": "מחשבים",
  "topK": 4,
  "minSimilarity": 0.5
}
```
- **Response Body (200 OK)**:
```json
{
  "query": "...",
  "answer": "בהתבסס על הקטלוג שלנו, האפשרויות המובילות הן: ...",
  "citations": [
    {
      "skuCode": "MACBOOK-PRO-M4",
      "title": "Apple MacBook Pro 14 M4",
      "price": 7999.0,
      "category": "מחשבים",
      "inStock": true,
      "relevanceScore": 0.89,
      "snippet": "מעבד M4 Pro חזק, מסך Liquid Retina XDR מרהיב..."
    }
  ],
  "confidenceScore": 0.89,
  "model": "gemini-3.5-flash-lite",
  "latencyMs": 142,
  "retrievedDocumentsCount": 4
}
```

### 4.2 GET `/api/v1/rag/stream` (SSE Event Stream)
- Parameters: `query`, `conversationId`, `category`, `topK`
- Event Flow:
  - `event: citations` -> JSON list of product citations
  - `event: token` -> `{"text": "...", "done": false}`
  - `event: complete` -> `{"latencyMs": 85, "done": true}`

### 4.3 GET `/api/v1/rag/health`
- Returns service status, model in use, indexed count, and virtual threads indicator.

---

## 5. Gateway Configuration & Clean Cutover

Update `api-gateway/src/main/resources/application.yml`:
```yaml
# 11. AI RAG Service Route (Consolidated into recommendation-loyalty-service)
- id: rag-service-route
  uri: ${RECOMMENDATION_SERVICE_URL:http://recommendation-loyalty-service:8089}
  predicates:
    - Path=/api/v1/rag/**
```
Update `docker-compose.yml`:
- Update `api-gateway` environment variable: `RAG_SERVICE_URL` -> points to `recommendation-loyalty-service:8089`.
- Safely disable or retire the standalone `rag-service` container to reclaim system RAM.

---

## 6. Observability & Resilience
- **Virtual Threads**: Enabled via `spring.threads.virtual.enabled: true`.
- **Distributed Tracing**: Micrometer Tracing with OpenZipkin automatically traces spans through Gateway to RAG components.
- **Circuit Breaker**: Resilience4j protects downstream LLM calls, falling back to curated catalog recommendations.
