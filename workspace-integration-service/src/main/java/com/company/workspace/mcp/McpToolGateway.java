package com.company.workspace.mcp;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import io.modelcontextprotocol.client.McpSyncClient;
import io.modelcontextprotocol.spec.McpSchema;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.locks.ReentrantLock;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class McpToolGateway {

    private final McpSyncClient client;
    private final ReentrantLock initLock = new ReentrantLock();
    private volatile boolean initialized;

    @Retry(name = "workspaceMcp")
    @CircuitBreaker(name = "workspaceMcp")
    public McpSchema.CallToolResult call(String toolName, Map<String, Object> arguments) {
        ensureInitialized();
        log.debug("Calling MCP tool: name={}, argKeys={}", toolName, arguments.keySet());

        McpSchema.CallToolResult result = client.callTool(new McpSchema.CallToolRequest(toolName, arguments));

        if (Boolean.TRUE.equals(result.isError())) {
            throw new McpToolException(toolName, textOf(result));
        }
        return result;
    }

    public List<McpSchema.Tool> listTools() {
        ensureInitialized();
        return client.listTools().tools();
    }

    public void ping() {
        ensureInitialized();
        client.ping();
    }

    private void ensureInitialized() {
        if (initialized) {
            return;
        }
        initLock.lock();
        try {
            if (!initialized) {
                log.info("Performing MCP handshake and capability negotiation with Google Workspace MCP server...");
                client.initialize();
                initialized = true;
                log.info("MCP session established successfully.");
            }
        } finally {
            initLock.unlock();
        }
    }

    public static String textOf(McpSchema.CallToolResult result) {
        if (result.content() == null) {
            return "";
        }
        return result.content().stream()
                .filter(McpSchema.TextContent.class::isInstance)
                .map(c -> ((McpSchema.TextContent) c).text())
                .collect(Collectors.joining("\n"));
    }

    public static Optional<String> extractId(McpSchema.CallToolResult result, String structuredKey, Pattern textPattern) {
        if (result.structuredContent() instanceof Map<?, ?> map && map.get(structuredKey) != null) {
            return Optional.of(map.get(structuredKey).toString());
        }
        Matcher m = textPattern.matcher(textOf(result));
        return m.find() ? Optional.of(m.group(1)) : Optional.empty();
    }
}
