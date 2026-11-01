# Spec-First Architecture Governance & Agent Protocol

## 1. Governance Principles
All architectural evolutions, new services, and cross-cutting features within this distributed microservices platform must strictly adhere to the **Spec-First** methodology before any production code is committed:

1. **Specification Precedence**:
   - No business logic or microservice may be created without an approved Specification file located in `.agents/specs/`.
   - The spec defines the public contracts (OpenAPI 3.1 / AsyncAPI), error handling structures, data schemas, and boundary responsibilities.

2. **Decoupled Autonomous Services**:
   - Each microservice is bounded by its Domain-Driven Design (DDD) aggregate.
   - Cross-service interaction must occur either via asynchronous Kafka events (Event-Driven Architecture) or lightweight HTTP/REST through the `api-gateway`.
   - Never share database schemas or tables across services.

3. **Technology Standards**:
   - **Runtime**: Java 21 LTS with Virtual Threads (`spring.threads.virtual.enabled: true`).
   - **Framework**: Spring Boot 3.4.x / 3.3.x, Spring Cloud Gateway, Spring Data MongoDB / Redis.
   - **Observability**: Prometheus metrics (`/actuator/prometheus`), OpenTelemetry tracing, Zipkin.
   - **Resilience**: Resilience4j Circuit Breakers, Retry policies, and fallback handlers.
   - **BiDi / RTL First**: All customer-facing messages and UI responses must adhere to Right-to-Left (Hebrew) formatting standards.

4. **Change Management Process**:
   ```
   Idea / Prompt 
     ➔ Spec Draft (.agents/specs/*.md) 
     ➔ Task Implementation Plan (.agents/tasks/*.md) 
     ➔ Code Implementation & Scaffold 
     ➔ Gateway & Docker Wiring 
     ➔ Verification & Automated Tests
   ```
