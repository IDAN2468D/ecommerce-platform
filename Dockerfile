# Multi-stage Unified Cloud Build for Render (Frontend Next.js 14 + Backend Spring Cloud Gateway)

# Stage 1: Build Java Spring Boot API Gateway
FROM eclipse-temurin:21-jdk-alpine AS java-builder
WORKDIR /workspace
COPY pom.xml mvnw ./
COPY .mvn .mvn
COPY . .
RUN chmod +x ./mvnw && ./mvnw clean package -pl api-gateway -am -DskipTests -B

# Stage 2: Build Next.js 14 Frontend Storefront
FROM node:20-alpine AS node-builder
WORKDIR /app
COPY web-client/package*.json ./
RUN npm install --no-audit --no-fund
COPY web-client/ ./
RUN mkdir -p public
RUN npm run build && npm prune --omit=dev && npm cache clean --force

# Stage 3: Unified Production Runtime (Node.js 20 + OpenJDK 21)
FROM node:20-alpine AS runner
WORKDIR /app

# Install lightweight OpenJDK 21 JRE for Gateway execution
RUN apk add --no-cache openjdk21-jre-headless ca-certificates tzdata

ENV NODE_ENV=production
ENV GATEWAY_URL=http://127.0.0.1:8080
ENV PORT=10005

# Copy Gateway JAR
COPY --from=java-builder /workspace/api-gateway/target/*.jar /app/gateway.jar

# Copy Next.js Production Build
WORKDIR /app/web-client
COPY --from=node-builder /app/package*.json ./
COPY --from=node-builder /app/node_modules ./node_modules
COPY --from=node-builder /app/.next ./.next
COPY --from=node-builder /app/public ./public

WORKDIR /app

# Copy startup orchestration script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose custom ports (10005, 8085, 3005) and fallback defaults
EXPOSE 10005 8085 3005 10000 8080 3000

HEALTHCHECK --interval=20s --timeout=5s --start-period=45s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT:-10000}/ || exit 1

ENTRYPOINT ["/bin/sh", "/app/start.sh"]
