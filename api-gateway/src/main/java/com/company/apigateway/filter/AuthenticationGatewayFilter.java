package com.company.apigateway.filter;

import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.tracing.Tracer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * Centralized JWT Authentication & Zero-Trust Header Propagation Filter at API Gateway.
 * 1. Strips any spoofed incoming identity headers (X-User-Id, X-User-Roles, X-User-Email, X-Gateway-Verified).
 * 2. Validates Bearer JWT tokens using shared HMAC-SHA256 key and forwards verified identity headers downstream.
 * 3. Protects restricted routes (such as /api/v1/orders checkout/history) while permitting public catalog/auth routes.
 * 4. Propagates end-to-end Distributed Trace ID (X-Trace-Id) across requests and responses.
 */
@Component
public class AuthenticationGatewayFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationGatewayFilter.class);

    public static final String HEADER_USER_ID = "X-User-Id";
    public static final String HEADER_USER_ROLES = "X-User-Roles";
    public static final String HEADER_USER_EMAIL = "X-User-Email";
    public static final String HEADER_GATEWAY_VERIFIED = "X-Gateway-Verified";
    public static final String HEADER_TRACE_ID = "X-Trace-Id";

    private final String jwtSecret;
    private final boolean enforceJwtOnProtectedRoutes;
    private final MeterRegistry meterRegistry;
    private final Tracer tracer;

    @Autowired
    public AuthenticationGatewayFilter(
            @Value("${jwt.secret:order-service-default-secret-key-32-bytes!!}") String jwtSecret,
            @Value("${gateway.security.enforce-jwt:true}") boolean enforceJwtOnProtectedRoutes,
            @Autowired(required = false) MeterRegistry meterRegistry,
            @Autowired(required = false) Tracer tracer) {
        this.jwtSecret = jwtSecret;
        this.enforceJwtOnProtectedRoutes = enforceJwtOnProtectedRoutes;
        this.meterRegistry = meterRegistry;
        this.tracer = tracer;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        HttpMethod method = request.getMethod();

        // Resolve or generate Trace ID for end-to-end observability
        String traceId = resolveTraceId(request);
        exchange.getResponse().getHeaders().set(HEADER_TRACE_ID, traceId);

        if (HttpMethod.OPTIONS.equals(method)) {
            return chain.filter(exchange);
        }

        // 1. Strip any external spoofed headers before processing
        ServerHttpRequest.Builder requestBuilder = request.mutate()
                .headers(headers -> {
                    headers.remove(HEADER_USER_ID);
                    headers.remove(HEADER_USER_ROLES);
                    headers.remove(HEADER_USER_EMAIL);
                    headers.remove(HEADER_GATEWAY_VERIFIED);
                    headers.set(HEADER_TRACE_ID, traceId);
                });

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        boolean hasBearer = authHeader != null && authHeader.startsWith("Bearer ");
        boolean isProtected = isProtectedRoute(path);

        if (hasBearer) {
            String token = authHeader.substring(7).trim();
            try {
                JWTClaimsSet claims = validateAndExtractClaims(token);
                String subject = claims.getSubject() != null ? claims.getSubject() : "usr_demo";
                String userId = claims.getStringClaim("userId") != null ? claims.getStringClaim("userId") : subject;
                String email = claims.getStringClaim("email") != null ? claims.getStringClaim("email") : subject;
                String role = extractRolesClaim(claims);

                requestBuilder
                        .header(HEADER_USER_ID, userId)
                        .header(HEADER_USER_ROLES, role)
                        .header(HEADER_USER_EMAIL, email)
                        .header(HEADER_GATEWAY_VERIFIED, "true");
                if (!request.getHeaders().containsKey("X-Customer-Id")) {
                    requestBuilder.header("X-Customer-Id", userId);
                }

                recordMetric("AUTHENTICATED");
                ServerWebExchange mutatedExchange = exchange.mutate().request(requestBuilder.build()).build();
                return chain.filter(mutatedExchange);
            } catch (Exception ex) {
                log.warn("Gateway JWT validation failed for path {}: {}", path, ex.getMessage());
                if (enforceJwtOnProtectedRoutes && isProtected) {
                    recordMetric("DENIED_INVALID_TOKEN");
                    return rejectUnauthorized(exchange, "Invalid or expired JWT token at API Gateway: " + ex.getMessage());
                }
            }
        } else if (enforceJwtOnProtectedRoutes && isProtected) {
            recordMetric("DENIED_MISSING_TOKEN");
            return rejectUnauthorized(exchange, "Missing Authorization Bearer token for protected route: " + path);
        }

        recordMetric("PUBLIC_ALLOWED");
        ServerWebExchange mutatedExchange = exchange.mutate().request(requestBuilder.build()).build();
        return chain.filter(mutatedExchange);
    }

    private JWTClaimsSet validateAndExtractClaims(String token) throws Exception {
        SignedJWT signedJWT = SignedJWT.parse(token);
        MACVerifier verifier = new MACVerifier(jwtSecret.getBytes(StandardCharsets.UTF_8));
        if (!signedJWT.verify(verifier)) {
            throw new IllegalArgumentException("Invalid JWT HMAC signature");
        }
        JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
        Date expiration = claims.getExpirationTime();
        if (expiration != null && new Date().after(expiration)) {
            throw new IllegalArgumentException("JWT token is expired");
        }
        return claims;
    }

    private String extractRolesClaim(JWTClaimsSet claims) {
        try {
            Object rolesObj = claims.getClaim("roles");
            if (rolesObj instanceof java.util.Collection<?> collection && !collection.isEmpty()) {
                return String.join(",", collection.stream().map(String::valueOf).toList());
            }
            if (rolesObj instanceof String rolesStr && !rolesStr.isBlank()) {
                return rolesStr;
            }
            String singleRole = claims.getStringClaim("role");
            if (singleRole != null && !singleRole.isBlank()) {
                return singleRole;
            }
        } catch (Exception ignored) {
        }
        return "ROLE_CUSTOMER";
    }

    private boolean isProtectedRoute(String path) {
        if (path == null) {
            return false;
        }
        // Public sub-paths under /api/v1/orders
        if (path.startsWith("/api/v1/orders/coupons")
                || path.startsWith("/api/v1/orders/outbox")
                || path.matches("^/api/v1/orders/[^/]+/invoice$")) {
            return false;
        }
        return path.equals("/api/v1/orders") || path.startsWith("/api/v1/orders/");
    }

    private String resolveTraceId(ServerHttpRequest request) {
        if (tracer != null && tracer.currentSpan() != null) {
            return tracer.currentSpan().context().traceId();
        }
        String existingTrace = request.getHeaders().getFirst(HEADER_TRACE_ID);
        if (existingTrace != null && !existingTrace.isBlank()) {
            return existingTrace.trim();
        }
        String traceparent = request.getHeaders().getFirst("traceparent");
        if (traceparent != null) {
            String[] parts = traceparent.split("-");
            if (parts.length >= 2 && parts[1].length() == 32) {
                return parts[1];
            }
        }
        return UUID.randomUUID().toString().replace("-", "");
    }

    private void recordMetric(String outcome) {
        if (meterRegistry != null) {
            meterRegistry.counter("ecommerce_gateway_auth_decisions_total", "outcome", outcome).increment();
        }
    }

    private Mono<Void> rejectUnauthorized(ServerWebExchange exchange, String detail) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String body = String.format(
                "{\"type\":\"about:blank\",\"title\":\"Unauthorized\",\"status\":401,\"detail\":\"%s\"}",
                detail.replace("\"", "'")
        );
        DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -3; // Run before RateLimiting (-2) and Logging (-1)
    }
}
