package com.company.ragservice.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "rag.llm")
@Getter
@Setter
public class GeminiProperties {
    private String provider = "google-gemini";
    private String model = "gemini-3.5-flash-lite";
    private String apiKey = "demo_key";
    private Double temperature = 0.2;
    private Integer maxTokens = 1024;
    private String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models";
}
