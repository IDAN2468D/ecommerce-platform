package com.company.workspace.controller;

import com.company.workspace.domain.WorkspaceLinkEntity;
import com.company.workspace.mcp.McpToolGateway;
import com.company.workspace.service.WorkspaceSyncService;
import io.modelcontextprotocol.spec.McpSchema;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspace")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Workspace", description = "Google Workspace MCP Integration APIs")
public class WorkspaceController {

    private final WorkspaceSyncService syncService;
    private final McpToolGateway toolGateway;

    @Operation(summary = "Get Google Workspace links for an order", description = "Returns Google Drive file ID and Google Calendar event ID associated with the order")
    @GetMapping("/links/{orderId}")
    public ResponseEntity<WorkspaceLinkEntity> getLinks(@PathVariable UUID orderId) {
        return syncService.getLinkByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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
