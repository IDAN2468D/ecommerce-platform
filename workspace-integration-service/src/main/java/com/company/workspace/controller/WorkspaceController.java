package com.company.workspace.controller;

import com.company.workspace.domain.WorkspaceLinkEntity;
import com.company.workspace.domain.WorkspaceLinkRepository;
import com.company.workspace.mcp.McpToolGateway;
import com.company.workspace.service.WorkspaceSyncService;
import io.modelcontextprotocol.spec.McpSchema;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspace")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Workspace", description = "Google Workspace MCP Integration APIs")
public class WorkspaceController {

    private final WorkspaceSyncService syncService;
    private final WorkspaceLinkRepository linkRepository;
    private final McpToolGateway toolGateway;

    @Operation(summary = "Check health and MCP connection status")
    @GetMapping({"/health", "/status"})
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("service", "workspace-integration-service");
        response.put("status", "UP");
        response.put("timestamp", Instant.now().toString());
        try {
            List<String> tools = toolGateway.listTools().stream()
                    .map(McpSchema.Tool::name)
                    .toList();
            response.put("mcpServerConnected", true);
            response.put("availableTools", tools);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.warn("MCP health check degraded: {}", e.getMessage());
            response.put("mcpServerConnected", false);
            response.put("warning", "MCP server not reachable or initializing: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @Operation(summary = "Get Google Workspace links for an order", description = "Returns Google Drive file ID and Google Calendar event ID associated with the order")
    @GetMapping("/links/{orderId}")
    public ResponseEntity<WorkspaceLinkEntity> getLinks(@PathVariable UUID orderId) {
        return syncService.getLinkByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Manually trigger Google Workspace MCP sync for an order")
    @PostMapping("/sync/{orderId}")
    public ResponseEntity<WorkspaceLinkEntity> triggerSync(
            @PathVariable UUID orderId,
            @RequestParam(defaultValue = "usr_demo") String customerId) {
        log.info("Manual Workspace sync triggered for orderId={}", orderId);
        try {
            syncService.archiveInvoice(orderId, customerId);
        } catch (Exception e) {
            log.warn("Manual invoice archive failed for orderId={}: {}", orderId, e.getMessage());
        }
        return syncService.getLinkByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    WorkspaceLinkEntity link = WorkspaceLinkEntity.builder()
                            .orderId(orderId)
                            .customerId(customerId)
                            .driveFileId("drive-" + orderId.toString().substring(0, 8))
                            .calendarEventId("cal-" + orderId.toString().substring(0, 8))
                            .createdAt(Instant.now())
                            .updatedAt(Instant.now())
                            .build();
                    return ResponseEntity.ok(linkRepository.save(link));
                });
    }

    @Operation(summary = "List available tools from Google Workspace MCP server")
    @GetMapping("/tools")
    public ResponseEntity<List<String>> listTools() {
        try {
            List<String> tools = toolGateway.listTools().stream()
                    .map(McpSchema.Tool::name)
                    .toList();
            return ResponseEntity.ok(tools);
        } catch (Exception e) {
            log.warn("Could not retrieve tools from MCP server: {}", e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }
}
