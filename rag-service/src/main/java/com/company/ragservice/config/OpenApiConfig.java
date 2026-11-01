package com.company.ragservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI ragServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Enterprise AI RAG Service API")
                        .description("Retrieval-Augmented Generation (RAG) microservice utilizing MongoDB Atlas Vector Search and Google Gemini gemini-3.5-flash-lite.")
                        .version("1.0.0")
                        .contact(new Contact().name("AI Platform Team").email("idankzm@gmail.com")));
    }
}
