package com.company.workspace.config;

import io.modelcontextprotocol.client.McpClient;
import io.modelcontextprotocol.client.McpSyncClient;
import io.modelcontextprotocol.client.transport.HttpClientStreamableHttpTransport;
import io.modelcontextprotocol.spec.McpSchema;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
@EnableConfigurationProperties(WorkspaceMcpProperties.class)
public class McpClientConfig {

    @Bean(destroyMethod = "closeGracefully")
    public McpSyncClient workspaceMcpClient(WorkspaceMcpProperties props) {
        var transportBuilder = HttpClientStreamableHttpTransport
                .builder(props.baseUrl())
                .endpoint(props.endpoint());

        if (StringUtils.hasText(props.authToken())) {
            transportBuilder.addHttpRequestCustomizer((builder, method, uri, body, ctx) ->
                    builder.header("Authorization", "Bearer " + props.authToken()));
        }

        return McpClient.sync(transportBuilder.build())
                .requestTimeout(props.requestTimeout())
                .clientInfo(new McpSchema.Implementation("workspace-integration-service", "1.0.0"))
                .build();
    }
}
