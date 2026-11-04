package com.company.dynamicpricingservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DynamicPricingServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(DynamicPricingServiceApplication.class, args);
    }
}
