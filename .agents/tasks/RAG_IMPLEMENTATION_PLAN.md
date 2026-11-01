# Implementation Plan: AI RAG Component (rag-service)

- **Feature**: Autonomous RAG Microservice for Intelligent Catalog Search & Customer Assistant
- **Governance**: Spec-First (`.agents/GOVERNANCE.md` & `.agents/specs/RAG_SERVICE_SPEC.md`)
- **Port Allocation**: Port `8092`
- **Target Completion**: Spring Boot 3.4.x / 3.3.5, Java 21 LTS (Virtual Threads), MongoDB Atlas Vector Search

---

## Phase 1: Project Scaffolding & Maven Dependencies

### 1.1 Root `pom.xml` Registration
Add `rag-service` to the parent `<modules>`:
```xml
<modules>
    <!-- Existing microservices -->
    ...
    <module>workspace-integration-service</module>
    <module>api-gateway</module>
    <module>rag-service</module>
</modules>
```

### 1.2 `rag-service/pom.xml` Setup
Create `rag-service/pom.xml` inheriting from `com.company:ecommerce-platform:0.0.1-SNAPSHOT`:
- **Core Starters**:
  - `spring-boot-starter-web`
  - `spring-boot-starter-validation`
  - `spring-boot-starter-data-mongodb`
  - `spring-boot-starter-actuator`
- **Spring AI / LLM & Embeddings**:
  - `org.springframework.ai:spring-ai-mongodb-atlas-store-spring-boot-starter` (or custom `$vectorSearch` repository using `MongoTemplate`)
  - Supported Google GenAI / Gemini client for embeddings and generation
- **Resilience & Messaging**:
  - `io.github.resilience4j:resilience4j-spring-boot3`
  - `spring-kafka` and `com.company:common-events`
- **Observability**:
  - `micrometer-registry-prometheus`
  - `micrometer-tracing-bridge-otel`
- **Documentation**:
  - `springdoc-openapi-starter-webmvc-ui`

---

## Phase 2: Configuration & Virtual Threads Setup

### 2.1 `src/main/resources/application.yml`
```yaml
server:
  port: 8092
  shutdown: graceful

spring:
  application:
    name: rag-service
  threads:
    virtual:
      enabled: true
  data:
    mongodb:
      uri: ${MONGODB_URI:mongodb://localhost:27017/ecommerce_db?maxPoolSize=50&minPoolSize=10&connectTimeoutMS=5000&socketTimeoutMS=30000}
      database: ecommerce_db
  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:29092}
    consumer:
      group-id: rag-service-group
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer

rag:
  vector:
    collection-name: catalog_embeddings
    index-name: vector_index
    dimensions: 768
    num-candidates: 100
    top-k-default: 4
  llm:
    provider: gemini
    model: gemini-1.5-flash
    api-key: ${GEMINI_API_KEY:demo_key}
    temperature: 0.2
    max-tokens: 800

resilience4j:
  circuitbreaker:
    instances:
      llmService:
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
```

---

## Phase 3: Data Models & MongoDB Vector Schema

### 3.1 MongoDB Document (`CatalogVectorDocument.java`)
```java
package com.company.ragservice.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Document(collection = "catalog_embeddings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CatalogVectorDocument {
    @Id
    private String id;
    private String skuCode;
    private String title;
    private String textChunk;
    private List<Float> embedding; // 768 dimensions
    private String category;
    private Double price;
    private Boolean inStock;
    private Double averageRating;
    private Map<String, Object> metadata;
    private Instant indexedAt;
}
```

### 3.2 MongoDB Atlas Vector Search Index Initializer
Script executed on Atlas deployment or container initialization:
```javascript
db.catalog_embeddings.createSearchIndex(
  "vector_index",
  "vectorSearch",
  {
    "fields": [
      {
        "type": "vector",
        "path": "embedding",
        "numDimensions": 768,
        "similarity": "cosine"
      },
      { "type": "filter", "path": "category" },
      { "type": "filter", "path": "inStock" },
      { "type": "filter", "path": "price" }
    ]
  }
);
```

---

## Phase 4: Core Retrieval & Generation Services

### 4.1 Embedding Service (`EmbeddingService.java`)
- Interface defining `List<Float> generateEmbedding(String text)`.
- Implementation:
  - Calls Gemini Embedding model (`text-embedding-004`).
  - Fallback / Mock provider when offline or running in mock local mode, computing normalized cosine hash vectors so development requires zero external API key.

### 4.2 Vector Search Repository (`VectorSearchRepository.java`)
- Executes MongoDB `$vectorSearch` aggregation stage with dynamic metadata pre-filtering:
```java
public List<CatalogVectorDocument> searchSimilar(List<Float> queryVector, String category, Double maxPrice, Boolean inStockOnly, int limit) {
    List<Document> pipeline = new ArrayList<>();
    
    Document filterDoc = new Document();
    if (category != null && !category.isBlank() && !category.equalsIgnoreCase("all")) {
        filterDoc.put("category", category);
    }
    if (inStockOnly != null && inStockOnly) {
        filterDoc.put("inStock", true);
    }
    if (maxPrice != null && maxPrice > 0) {
        filterDoc.put("price", new Document("$lte", maxPrice));
    }

    Document vectorSearchStage = new Document("$vectorSearch", new Document()
        .append("index", "vector_index")
        .append("path", "embedding")
        .append("queryVector", queryVector)
        .append("numCandidates", limit * 15)
        .append("limit", limit)
        .append("filter", filterDoc)
    );
    pipeline.add(vectorSearchStage);

    return mongoTemplate.aggregate(
        new CustomAggregation(pipeline), 
        "catalog_embeddings", 
        CatalogVectorDocument.class
    ).getMappedResults();
}
```

### 4.3 RAG Generation Pipeline (`RagGenerationService.java`)
- Constructs structured prompt with retrieved context.
- System Prompt in Hebrew RTL and English.
- Emits either complete `RagQueryResponse` or SSE `ResponseBodyEmitter` for streamable tokens.
- Protected by `@CircuitBreaker(name = "llmService", fallbackMethod = "fallbackRagAnswer")`.

---

## Phase 5: REST & Streaming API Endpoints

### 5.1 Controller (`RagController.java`)
- **`POST /api/v1/rag/query`**: Synchronous Q&A with grounded citations and confidence score.
- **`GET /api/v1/rag/stream`**: Real-time Server-Sent Events (SSE) streaming for fast interactive chat.
- **`POST /api/v1/rag/sync`**: Trigger bulk re-indexing of catalog products into vector store.
- **`GET /api/v1/rag/health`**: Vector search connectivity and LLM provider status.

---

## Phase 6: Kafka Ingestion & Event-Driven Indexing

### 6.1 Kafka Consumer (`CatalogSyncConsumer.java`)
Listens to existing e-commerce events:
- `product-events`: Updates `CatalogVectorDocument` embedding whenever title, description, or price changes.
- `inventory-events` (`StockReservedEvent`, `StockReleasedEvent`): Updates `inStock` boolean filter in real-time.
- `review-events` (`ProductRatingUpdatedEvent`): Re-indexes average rating.

---

## Phase 7: Gateway Routing & Docker Compose Integration

### 7.1 `api-gateway` Route (`api-gateway/src/main/resources/application.yml`)
```yaml
        # 11. AI RAG Service Route
        - id: rag-service-route
          uri: ${RAG_SERVICE_URL:http://localhost:8092}
          predicates:
            - Path=/api/v1/rag/**
```

### 7.2 `docker-compose.yml` Entry
```yaml
  rag-service:
    build:
      context: ./rag-service
      dockerfile: Dockerfile
    container_name: rag-service
    ports:
      - "8092:8092"
    environment:
      JAVA_TOOL_OPTIONS: "-Xms64m -Xmx384m -Dspring.threads.virtual.enabled=true"
      MONGODB_URI: "mongodb://platform-mongodb:27017/ecommerce_db?maxPoolSize=50&uuidRepresentation=standard"
      KAFKA_BOOTSTRAP_SERVERS: "platform-kafka:9092"
      GEMINI_API_KEY: "${GEMINI_API_KEY:-demo_key}"
    depends_on:
      platform-mongodb:
        condition: service_healthy
      platform-kafka:
        condition: service_started
    networks:
      - platform-network
```

---

## Phase 8: Verification & E2E Acceptance Testing

1. **Unit & Slice Tests**:
   - `VectorSearchRepositoryTest`: Tests vector aggregation syntax with embedded MongoDB.
   - `RagGenerationServiceTest`: Tests prompt formatting and citation extraction.
2. **Integration & Gateway Verification**:
   - `curl -X POST http://localhost:8080/api/v1/rag/query -H "Content-Type: application/json" -d '{"query":"איזה אוזניות מומלצות לריצה וספורט?"}'`
   - Verify response contains cited product SKUs, prices, and conversational Hebrew text.
3. **Resilience Test**:
   - Simulate LLM timeout and verify fallback response is served without breaking user experience.
