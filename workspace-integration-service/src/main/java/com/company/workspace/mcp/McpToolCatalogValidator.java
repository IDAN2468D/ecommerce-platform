package com.company.workspace.mcp;

import com.company.workspace.config.WorkspaceMcpProperties;
import io.modelcontextprotocol.spec.McpSchema;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class McpToolCatalogValidator implements HealthIndicator {

    private final McpToolGateway gateway;
    private final WorkspaceMcpProperties props;

    @EventListener(ApplicationReadyEvent.class)
    public void validateOnStartup() {
        try {
            Set<String> available = gateway.listTools().stream()
                    .map(McpSchema.Tool::name)
                    .collect(Collectors.toSet());

            List<String> missing = props.tools().all().stream()
                    .filter(t -> !available.contains(t))
                    .toList();

            if (missing.isEmpty()) {
                log.info("MCP tool catalog validated successfully. Configured tools available: {}", props.tools().all());
            } else {
                log.warn("Configured MCP tools not found on server: {}. Available tools on server: {}", missing, available);
            }
        } catch (Exception e) {
            log.warn("Google Workspace MCP server not yet reachable at startup ({}). Lazy initialization will occur on first incoming event.", e.getMessage());
        }
    }

    @Override
    public Health health() {
        try {
            gateway.ping();
            return Health.up()
                    .withDetail("mcpEndpoint", props.baseUrl() + props.endpoint())
                    .withDetail("configuredTools", props.tools().all())
                    .build();
        } catch (Exception e) {
            return Health.down(e)
                    .withDetail("mcpEndpoint", props.baseUrl() + props.endpoint())
                    .build();
        }
    }
}
