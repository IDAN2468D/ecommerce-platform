# Multi-stage cloud build for Maven Multi-Module Platform
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace

# Copy Maven wrapper, root descriptor and all source modules
COPY pom.xml mvnw ./
COPY .mvn .mvn
COPY . .

# Ensure wrapper script is executable and build the central API Gateway
RUN chmod +x ./mvnw && ./mvnw clean package -pl api-gateway -am -DskipTests -B

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add non-root system user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy API Gateway jar from builder
COPY --from=builder --chown=appuser:appgroup /workspace/api-gateway/target/*.jar app.jar

# JVM options enabling Virtual Threads and optimized container memory
ENV JAVA_OPTS="-XX:+UseZGC -XX:+ZGenerational -XX:MaxRAMPercentage=75.0 -Dspring.threads.virtual.enabled=true"

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
