package com.company.marketplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class MarketplaceVendorServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MarketplaceVendorServiceApplication.class, args);
    }
}
