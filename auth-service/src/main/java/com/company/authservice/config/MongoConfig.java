package com.company.authservice.config;

import org.bson.UuidRepresentation;
import org.springframework.boot.autoconfigure.mongo.MongoClientSettingsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.util.concurrent.TimeUnit;

/**
 * MongoDB Connection & Pool Configuration following /mongodb-connection best practices.
 * Workload Profile: Traditional Long-Running Containerized Microservice (Spring Boot 3 + Java 21 Virtual Threads)
 * executing OLTP user authentication, registration, and profile queries.
 */
@Configuration
@EnableMongoRepositories(basePackages = "com.company.authservice.repository")
public class MongoConfig {

    @Bean
    public MongoClientSettingsBuilderCustomizer mongoClientSettingsBuilderCustomizer() {
        return builder -> builder
                .uuidRepresentation(UuidRepresentation.STANDARD)
                .applyToConnectionPoolSettings(pool -> pool
                        .maxSize(50)
                        .minSize(10)
                        .maxConnectionIdleTime(5, TimeUnit.MINUTES)
                        .maxWaitTime(5, TimeUnit.SECONDS)
                )
                .applyToSocketSettings(socket -> socket
                        .connectTimeout(5, TimeUnit.SECONDS)
                        .readTimeout(30, TimeUnit.SECONDS)
                )
                .applyToClusterSettings(cluster -> cluster
                        .serverSelectionTimeout(5, TimeUnit.SECONDS)
                );
    }
}
