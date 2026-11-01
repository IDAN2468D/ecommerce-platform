package com.company.recommendationloyaltyservice.rag.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class RagConfig {

    @Value("${rag.llm.model:gemini-3.5-flash-lite}")
    private String geminiModel;

    @Value("${rag.llm.api-key:demo_key}")
    private String geminiApiKey;

    @Bean
    public RestClient ragVirtualThreadRestClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
        factory.setReadTimeout((int) Duration.ofSeconds(20).toMillis());

        return RestClient.builder()
                .requestFactory(factory)
                .build();
    }

    public String getGeminiModel() {
        return geminiModel;
    }

    public String getGeminiApiKey() {
        return geminiApiKey;
    }
}
