package com.company.shippingservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI shippingOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Shipping & Delivery Service API")
                        .description("SAGA Step 5 Delivery Logistics & Real-Time Tracking")
                        .version("v2.0"));
    }
}
