package com.company.reviewratingservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI reviewsOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Review & Rating Service API")
                        .description("Verified Customer Reviews, Ratings & Redis Caching")
                        .version("v2.0"));
    }
}
