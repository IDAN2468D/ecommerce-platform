package com.company.recommendationloyaltyservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class RecommendationLoyaltyServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(RecommendationLoyaltyServiceApplication.class, args);
    }
}
