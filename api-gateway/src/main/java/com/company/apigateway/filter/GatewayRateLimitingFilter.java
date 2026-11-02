package com.company.apigateway.filter;

import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Distributed Redis Rate Limiting Filter with Local Resilience Fallback.
 * Protects critical endpoints:
 * - AI RAG routes (/api/v1/rag/**)
 * - Order & Checkout routes (/api/v1/orders/**)
 * - Authentication routes (/api/v1/auth/**)
 * - General platform routes (/api/v1/**)
 */
@Component
public class GatewayRateLimitingFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(GatewayRateLimitingFilter.class);

    private final ReactiveStringRedisTemplate redisTemplate;
    private final KeyResolver keyResolver;
    private final MeterRegistry meterRegistry;
    private final boolean enabled;
    private final int ragLimitPerMinute;
    private final int orderLimitPerMinute;
    private final int defaultLimitPerMinute;

    // Local fallback sliding window when Redis is unreachable in local/unit test environments
    private final Map<String, WindowCounter> localCounters = new ConcurrentHashMap<>();

    private record WindowCounter(long windowMinute, AtomicInteger count) {}

    @Autowired
    public GatewayRateLimitingFilter(
            @Autowired(required = false) ReactiveStringRedisTemplate redisTemplate,
            KeyResolver keyResolver,
            @Autowired(required = false) MeterRegistry meterRegistry,
            @Value("${gateway.rate-limit.enabled:true}") boolean enabled,
            @Value("${gateway.rate-limit.rag-requests-per-minute:40}") int ragLimitPerMinute,
            @Value("${gateway.rate-limit.order-requests-per-minute:60}") int orderLimitPerMinute,
            @Value("${gateway.rate-limit.default-requests-per-minute:180}") int defaultLimitPerMinute) {
        this.redisTemplate = redisTemplate;
        this.keyResolver = keyResolver;
        this.meterRegistry = meterRegistry;
        this.enabled = enabled;
        this.ragLimitPerMinute = ragLimitPerMinute;
        this.orderLimitPerMinute = orderLimitPerMinute;
        this.defaultLimitPerMinute = defaultLimitPerMinute;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (!enabled || HttpMethod.OPTIONS.equals(exchange.getRequest().getMethod())) {
            return chain.filter(exchange);
        }

        String path = exchange.getRequest().getURI().getPath();
        if (path == null || path.startsWith("/actuator")) {
            return chain.filter(exchange);
        }

        String bucket = resolveBucket(path);
        int limit = resolveLimit(bucket);
        long currentMinute = Instant.now().getEpochSecond() / 60;

        return keyResolver.resolve(exchange)
                .defaultIfEmpty("ip:anonymous")
                .flatMap(principalKey -> {
                    String redisKey = String.format("gateway:ratelimit:%s:%s:%d", bucket, principalKey, currentMinute);
                    if (redisTemplate != null) {
                        return checkRedisRateLimit(exchange, chain, redisKey, bucket, limit, principalKey);
                    }
                    return checkLocalRateLimit(exchange, chain, redisKey, bucket, limit, currentMinute);
                });
    }

    private Mono<Void> checkRedisRateLimit(
            ServerWebExchange exchange,
            GatewayFilterChain chain,
            String redisKey,
            String bucket,
            int limit,
            String principalKey) {

        long currentMinute = Instant.now().getEpochSecond() / 60;
        return redisTemplate.opsForValue().increment(redisKey)
                .flatMap(count -> {
                    Mono<Boolean> expireMono = (count == 1L)
                            ? redisTemplate.expire(redisKey, Duration.ofSeconds(65))
                            : Mono.just(Boolean.TRUE);
                    return expireMono.thenReturn(count);
                })
                .timeout(Duration.ofMillis(400))
                .flatMap(count -> evaluateDecision(exchange, chain, bucket, limit, count, "REDIS"))
                .onErrorResume(ex -> {
                    log.debug("Redis rate limiter fallback to local counter ({}): {}", principalKey, ex.getMessage());
                    return checkLocalRateLimit(exchange, chain, redisKey, bucket, limit, currentMinute);
                });
    }

    private Mono<Void> checkLocalRateLimit(
            ServerWebExchange exchange,
            GatewayFilterChain chain,
            String key,
            String bucket,
            int limit,
            long currentMinute) {

        WindowCounter counter = localCounters.compute(key, (k, existing) -> {
            if (existing == null || existing.windowMinute() != currentMinute) {
                return new WindowCounter(currentMinute, new AtomicInteger(1));
            }
            existing.count().incrementAndGet();
            return existing;
        });

        long count = counter.count().get();
        return evaluateDecision(exchange, chain, bucket, limit, count, "LOCAL_FALLBACK");
    }

    private Mono<Void> evaluateDecision(
            ServerWebExchange exchange,
            GatewayFilterChain chain,
            String bucket,
            int limit,
            long currentCount,
            String source) {

        long remaining = Math.max(0, limit - currentCount);
        exchange.getResponse().getHeaders().set("X-RateLimit-Limit", String.valueOf(limit));
        exchange.getResponse().getHeaders().set("X-RateLimit-Remaining", String.valueOf(remaining));
        exchange.getResponse().getHeaders().set("X-RateLimit-Source", source);

        if (currentCount > limit) {
            if (meterRegistry != null) {
                meterRegistry.counter("ecommerce_gateway_ratelimit_requests_total",
                        "bucket", bucket, "outcome", "REJECTED").increment();
            }
            log.warn("Rate limit exceeded on bucket '{}' (count={}/{}, source={})", bucket, currentCount, limit, source);
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
            exchange.getResponse().getHeaders().set("Retry-After", "60");
            String body = String.format(
                    "{\"type\":\"about:blank\",\"title\":\"Too Many Requests\",\"status\":429,\"detail\":\"Rate limit of %d requests/min exceeded for %s\"}",
                    limit, bucket
            );
            DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
            return exchange.getResponse().writeWith(Mono.just(buffer));
        }

        if (meterRegistry != null) {
            meterRegistry.counter("ecommerce_gateway_ratelimit_requests_total",
                    "bucket", bucket, "outcome", "ALLOWED").increment();
        }
        return chain.filter(exchange);
    }

    private String resolveBucket(String path) {
        if (path.startsWith("/api/v1/rag")) {
            return "ai-rag";
        }
        if (path.startsWith("/api/v1/orders")) {
            return "orders-checkout";
        }
        if (path.startsWith("/api/v1/auth")) {
            return "auth";
        }
        return "general";
    }

    private int resolveLimit(String bucket) {
        return switch (bucket) {
            case "ai-rag" -> ragLimitPerMinute;
            case "orders-checkout" -> orderLimitPerMinute;
            default -> defaultLimitPerMinute;
        };
    }

    @Override
    public int getOrder() {
        return -2; // Run right after AuthenticationGatewayFilter (-3)
    }
}

