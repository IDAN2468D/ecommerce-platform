package com.company.apigateway;

import com.company.apigateway.filter.AuthenticationGatewayFilter;
import com.company.apigateway.filter.GatewayRateLimitingFilter;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ApiGatewayApplicationTest {

    private static final String TEST_SECRET = "my-super-secret-jwt-key-that-is-at-least-256-bits-long-for-hmac-sha256";

    @Test
    @DisplayName("API Gateway context loads successfully")
    void contextLoads() {
    }

    @Test
    @DisplayName("AuthenticationGatewayFilter strips spoofed headers, verifies JWT, and injects X-User-Id & X-User-Roles")
    void authenticationGatewayFilter_VerifiesJwtAndInjectsVerifiedHeaders() throws Exception {
        AuthenticationGatewayFilter filter = new AuthenticationGatewayFilter(TEST_SECRET, true, new SimpleMeterRegistry(), null);

        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject("usr_enterprise_01")
                .claim("roles", List.of("ROLE_CUSTOMER", "ROLE_VIP"))
                .claim("email", "vip@company.com")
                .expirationTime(Date.from(Instant.now().plusSeconds(3600)))
                .build();
        SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
        signedJWT.sign(new MACSigner(TEST_SECRET.getBytes(StandardCharsets.UTF_8)));
        String token = signedJWT.serialize();

        MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/orders")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .header("X-User-Id", "spoofed_attacker_id")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicReference<ServerWebExchange> capturedExchange = new AtomicReference<>();
        GatewayFilterChain chain = ex -> {
            capturedExchange.set(ex);
            return Mono.empty();
        };

        filter.filter(exchange, chain).block();

        assertNotNull(capturedExchange.get());
        HttpHeaders downstreamHeaders = capturedExchange.get().getRequest().getHeaders();
        assertEquals("usr_enterprise_01", downstreamHeaders.getFirst("X-User-Id"));
        assertEquals("ROLE_CUSTOMER,ROLE_VIP", downstreamHeaders.getFirst("X-User-Roles"));
        assertEquals("vip@company.com", downstreamHeaders.getFirst("X-User-Email"));
        assertNotNull(downstreamHeaders.getFirst("X-Trace-Id"));
    }

    @Test
    @DisplayName("AuthenticationGatewayFilter blocks unauthenticated protected route when enforceJwt is true")
    void authenticationGatewayFilter_BlocksMissingJwtOnProtectedRoute() {
        AuthenticationGatewayFilter filter = new AuthenticationGatewayFilter(TEST_SECRET, true, new SimpleMeterRegistry(), null);

        MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/orders").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        GatewayFilterChain chain = ex -> Mono.empty();
        filter.filter(exchange, chain).block();

        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }

    @Test
    @DisplayName("GatewayRateLimitingFilter enforces burst limits and returns 429 Too Many Requests")
    void gatewayRateLimitingFilter_Returns429WhenLimitExceeded() {
        GatewayRateLimitingFilter rateLimitingFilter = new GatewayRateLimitingFilter(
                null,
                exchange -> Mono.just("user:usr_rate_test"),
                new SimpleMeterRegistry(),
                true,
                2,
                5,
                10
        );

        GatewayFilterChain chain = ex -> Mono.empty();

        for (int i = 0; i < 2; i++) {
            MockServerWebExchange okExchange = MockServerWebExchange.from(
                    MockServerHttpRequest.post("/api/v1/rag/query")
                            .header("X-User-Id", "usr_rate_test")
                            .build());
            rateLimitingFilter.filter(okExchange, chain).block();
            assertNotEquals(HttpStatus.TOO_MANY_REQUESTS, okExchange.getResponse().getStatusCode());
        }

        MockServerWebExchange throttledExchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/rag/query")
                        .header("X-User-Id", "usr_rate_test")
                        .build());
        rateLimitingFilter.filter(throttledExchange, chain).block();
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, throttledExchange.getResponse().getStatusCode());
        assertEquals("0", throttledExchange.getResponse().getHeaders().getFirst("X-RateLimit-Remaining"));
    }
}
