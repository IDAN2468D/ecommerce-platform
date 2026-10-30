package com.company.cartwishlistservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI cartOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Cart & Wishlist Service API")
                        .description("Sub-2ms Redis Hash Shopping Cart & Cloud Wishlist Engine")
                        .version("v2.0"));
    }
}
