package com.company.paymentservice.config;

import org.bson.UuidRepresentation;
import org.springframework.boot.autoconfigure.mongo.MongoClientSettingsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.util.concurrent.TimeUnit;

/**
 * MongoDB Connection & Pool Configuration following /mongodb-connection best practices.
 * Workload Profile: Traditional Long-Running Containerized Microservice (Spring Boot 3 + Java 21 Virtual Threads)
 * executing OLTP financial charges, idempotency lookups, and SAGA refunds.
 */
@Configuration
@EnableMongoRepositories(basePackages = "com.company.paymentservice.repository")
public class MongoConfig {

    @Bean
    public MongoClientSettingsBuilderCustomizer mongoClientSettingsBuilderCustomizer() {
        return builder -> builder
                // Standard RFC 4122 UUID BSON Binary subtype 4 encoding for entity IDs
                .uuidRepresentation(UuidRepresentation.STANDARD)
                .applyToConnectionPoolSettings(pool -> pool
                        // maxPoolSize=50: Supports concurrent Virtual Thread OLTP operations with headroom for burst traffic
                        .maxSize(50)
                        // minPoolSize=10: Keeps 10 warm connections ready to avoid 50-500ms TCP handshake latency spikes
                        .minSize(10)
                        // maxIdleTimeMS=300000 (5m): Retains warm connections for steady traffic while pruning excess burst connections
                        .maxConnectionIdleTime(5, TimeUnit.MINUTES)
                        // waitQueueTimeoutMS=5000 (5s): Fail fast if connection pool is exhausted under extreme load
                        .maxWaitTime(5, TimeUnit.SECONDS)
                )
                .applyToSocketSettings(socket -> socket
                        // connectTimeoutMS=5000 (5s): Fail fast when establishing new TCP connections if host is unreachable
                        .connectTimeout(5, TimeUnit.SECONDS)
                        // socketTimeoutMS=30000 (30s): Prevents hanging sockets on OLTP queries
                        .readTimeout(30, TimeUnit.SECONDS)
                )
                .applyToClusterSettings(cluster -> cluster
                        // serverSelectionTimeoutMS=5000 (5s): Fail fast during topology inspection or primary election
                        .serverSelectionTimeout(5, TimeUnit.SECONDS)
                );
    }
}
