package com.company.apigateway.config;

import com.company.apigateway.filter.AuthenticationGatewayFilter;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import reactor.core.publisher.Mono;

/**
 * Distributed Rate Limiting KeyResolver Configuration for Spring Cloud Gateway.
 * Resolves rate-limiting keys by verified User ID (X-User-Id / X-Customer-Id) or Client IP address.
 */
@Configuration
public class RateLimiterConfig {

    @Bean
    @Primary
    public KeyResolver userOrIpKeyResolver() {
        return exchange -> {
            String userId = exchange.getRequest().getHeaders().getFirst(AuthenticationGatewayFilter.HEADER_USER_ID);
            if (userId != null && !userId.isBlank()) {
                return Mono.just("user:" + userId);
            }
            String customerId = exchange.getRequest().getHeaders().getFirst("X-Customer-Id");
            if (customerId != null && !customerId.isBlank()) {
                return Mono.just("customer:" + customerId);
            }
            String forwardedFor = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
            if (forwardedFor != null && !forwardedFor.isBlank()) {
                return Mono.just("ip:" + forwardedFor.split(",")[0].trim());
            }
            if (exchange.getRequest().getRemoteAddress() != null
                    && exchange.getRequest().getRemoteAddress().getAddress() != null) {
                return Mono.just("ip:" + exchange.getRequest().getRemoteAddress().getAddress().getHostAddress());
            }
            return Mono.just("ip:anonymous");
        };
    }
}

