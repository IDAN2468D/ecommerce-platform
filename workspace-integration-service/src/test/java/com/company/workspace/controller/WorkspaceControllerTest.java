package com.company.workspace.controller;

import com.company.workspace.domain.WorkspaceLinkEntity;
import com.company.workspace.mcp.McpToolGateway;
import com.company.workspace.service.WorkspaceSyncService;
import io.modelcontextprotocol.spec.McpSchema;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(WorkspaceController.class)
class WorkspaceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WorkspaceSyncService syncService;

    @MockBean
    private McpToolGateway toolGateway;

    @Test
    @DisplayName("GET /api/v1/workspace/health returns UP with MCP status")
    void healthCheckReturnsUp() throws Exception {
        McpSchema.Tool driveTool = org.mockito.Mockito.mock(McpSchema.Tool.class);
        when(driveTool.name()).thenReturn("create_drive_file");
        when(toolGateway.listTools()).thenReturn(List.of(driveTool));

        mockMvc.perform(get("/api/v1/workspace/health")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.mcpServerConnected").value(true))
                .andExpect(jsonPath("$.availableTools[0]").value("create_drive_file"));
    }

    @Test
    @DisplayName("GET /api/v1/workspace/links/{orderId} returns links if found")
    void getLinksReturnsEntity() throws Exception {
        UUID orderId = UUID.randomUUID();
        WorkspaceLinkEntity entity = WorkspaceLinkEntity.builder()
                .orderId(orderId)
                .driveFileId("drive-123")
                .calendarEventId("cal-456")
                .build();

        when(syncService.getLinkByOrderId(orderId)).thenReturn(Optional.of(entity));

        mockMvc.perform(get("/api/v1/workspace/links/{orderId}", orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.driveFileId").value("drive-123"))
                .andExpect(jsonPath("$.calendarEventId").value("cal-456"));
    }
}
