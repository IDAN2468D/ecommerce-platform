package com.company.workspace.mcp;

import io.modelcontextprotocol.client.McpSyncClient;
import io.modelcontextprotocol.spec.McpSchema;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class McpToolGatewayTest {

    private final McpSyncClient client = mock(McpSyncClient.class);
    private final McpToolGateway gateway = new McpToolGateway(client);

    @Test
    @DisplayName("Tool error should throw McpToolException")
    void toolErrorThrowsException() {
        var error = McpSchema.CallToolResult.builder()
                .content(List.of(new McpSchema.TextContent("insufficientPermissions")))
                .isError(true)
                .build();
        when(client.callTool(any())).thenReturn(error);

        assertThatThrownBy(() -> gateway.call("create_event", Map.of()))
                .isInstanceOf(McpToolException.class)
                .hasMessageContaining("insufficientPermissions");

        verify(client, times(1)).initialize();
    }

    @Test
    @DisplayName("Extract ID from structured content or regex fallback")
    void extractsIdFromTextFallback() {
        var ok = McpSchema.CallToolResult.builder()
                .content(List.of(new McpSchema.TextContent("Created event. Event ID: abc123xyz")))
                .isError(false)
                .build();

        var id = McpToolGateway.extractId(ok, "id",
                Pattern.compile("(?i)event\\s*id[:=]\\s*\"?([a-z0-9_]{5,})"));

        assertThat(id).contains("abc123xyz");
    }
}
