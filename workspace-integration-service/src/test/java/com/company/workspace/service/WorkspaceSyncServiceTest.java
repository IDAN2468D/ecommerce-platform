package com.company.workspace.service;

import com.company.common.events.ShipmentCancelledEvent;
import com.company.common.events.ShipmentScheduledEvent;
import com.company.workspace.config.WorkspaceMcpProperties;
import com.company.workspace.domain.WorkspaceLinkEntity;
import com.company.workspace.domain.WorkspaceLinkRepository;
import com.company.workspace.mcp.McpToolGateway;
import io.modelcontextprotocol.spec.McpSchema;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkspaceSyncServiceTest {

    @Mock
    private McpToolGateway mcp;

    @Mock
    private WorkspaceLinkRepository linkRepository;

    private WorkspaceMcpProperties props;
    private WorkspaceSyncService syncService;

    @BeforeEach
    void setUp() {
        props = new WorkspaceMcpProperties(
                "http://localhost:8000",
                "/mcp",
                Duration.ofSeconds(20),
                "test-token",
                "ops@example.com",
                new WorkspaceMcpProperties.Tools("create_drive_file", "create_event", "delete_event", "send_gmail_message", "manage_drive_access"),
                new WorkspaceMcpProperties.Drive("folder-123", "http://order-service:8081/api/v1/orders/%s/invoice"),
                new WorkspaceMcpProperties.Calendar("primary", "Asia/Jerusalem", Duration.ofHours(2))
        );
        syncService = new WorkspaceSyncService(mcp, linkRepository, props);
    }

    @Test
    @DisplayName("archiveInvoice calls MCP drive tool and saves driveFileId")
    void archiveInvoiceSuccess() {
        UUID orderId = UUID.randomUUID();
        when(linkRepository.findById(orderId)).thenReturn(Optional.empty());

        var toolResult = McpSchema.CallToolResult.builder()
                .content(List.of(new McpSchema.TextContent("File created successfully. ID: drive_file_999")))
                .isError(false)
                .build();
        when(mcp.call(eq("create_drive_file"), any())).thenReturn(toolResult);

        syncService.archiveInvoice(orderId, "usr_123");

        ArgumentCaptor<WorkspaceLinkEntity> captor = ArgumentCaptor.forClass(WorkspaceLinkEntity.class);
        verify(linkRepository).save(captor.capture());
        WorkspaceLinkEntity saved = captor.getValue();

        assertThat(saved.getOrderId()).isEqualTo(orderId);
        assertThat(saved.getDriveFileId()).isEqualTo("drive_file_999");
        assertThat(saved.getCustomerId()).isEqualTo("usr_123");
    }

    @Test
    @DisplayName("archiveInvoice is idempotent and skips if already archived")
    void archiveInvoiceIdempotent() {
        UUID orderId = UUID.randomUUID();
        WorkspaceLinkEntity existing = WorkspaceLinkEntity.builder()
                .orderId(orderId)
                .driveFileId("already_archived_id")
                .build();
        when(linkRepository.findById(orderId)).thenReturn(Optional.of(existing));

        syncService.archiveInvoice(orderId, "usr_123");

        verify(mcp, never()).call(any(), any());
        verify(linkRepository, never()).save(any());
    }

    @Test
    @DisplayName("scheduleDelivery calls MCP calendar tool and stores eventId")
    void scheduleDeliverySuccess() {
        UUID orderId = UUID.randomUUID();
        UUID shipmentId = UUID.randomUUID();
        ShipmentScheduledEvent event = new ShipmentScheduledEvent(
                shipmentId,
                orderId,
                "usr_456",
                "IL-EXP-12345",
                "Israel Post",
                "Herzl 1, Tel Aviv",
                Instant.now().plusSeconds(86400),
                Instant.now()
        );

        when(linkRepository.findById(orderId)).thenReturn(Optional.empty());

        var toolResult = McpSchema.CallToolResult.builder()
                .content(List.of(new McpSchema.TextContent("Created calendar appointment with ID: cal_event_777")))
                .isError(false)
                .build();
        when(mcp.call(eq("create_event"), any())).thenReturn(toolResult);

        syncService.scheduleDelivery(event);

        ArgumentCaptor<WorkspaceLinkEntity> captor = ArgumentCaptor.forClass(WorkspaceLinkEntity.class);
        verify(linkRepository).save(captor.capture());
        WorkspaceLinkEntity saved = captor.getValue();

        assertThat(saved.getOrderId()).isEqualTo(orderId);
        assertThat(saved.getCalendarEventId()).isEqualTo("cal_event_777");
    }

    @Test
    @DisplayName("cancelDelivery performs SAGA compensation by deleting calendar event")
    void cancelDeliverySuccess() {
        UUID orderId = UUID.randomUUID();
        UUID shipmentId = UUID.randomUUID();
        ShipmentCancelledEvent event = new ShipmentCancelledEvent(
                shipmentId,
                orderId,
                "usr_456",
                "IL-EXP-12345",
                "Cancelled by user",
                Instant.now()
        );

        WorkspaceLinkEntity existing = WorkspaceLinkEntity.builder()
                .orderId(orderId)
                .calendarEventId("cal_event_777")
                .build();
        when(linkRepository.findById(orderId)).thenReturn(Optional.of(existing));

        var toolResult = McpSchema.CallToolResult.builder()
                .content(List.of(new McpSchema.TextContent("Event deleted")))
                .isError(false)
                .build();
        when(mcp.call(eq("delete_event"), any())).thenReturn(toolResult);

        syncService.cancelDelivery(event);

        verify(mcp).call(eq("delete_event"), argThat(map -> "cal_event_777".equals(map.get("event_id"))));
        assertThat(existing.getCalendarEventId()).isNull();
        verify(linkRepository).save(existing);
    }

    @Test
    @DisplayName("sendReceiptNotification falls back to driveManageAccess when gmailSendMessage fails")
    void sendReceiptNotificationFallbackToDrive() {
        UUID orderId = UUID.randomUUID();
        when(mcp.call(eq("send_gmail_message"), any()))
                .thenThrow(new RuntimeException("OAuth2 scope missing: https://www.googleapis.com/auth/gmail.send"));

        var shareResult = McpSchema.CallToolResult.builder()
                .content(List.of(new McpSchema.TextContent("Permission added")))
                .isError(false)
                .build();
        when(mcp.call(eq("manage_drive_access"), any())).thenReturn(shareResult);

        syncService.sendReceiptNotification(orderId, "customer@example.com", "fake-pdf".getBytes(), "drive_file_123");

        verify(mcp).call(eq("send_gmail_message"), argThat(map -> "customer@example.com".equals(map.get("to"))));
        verify(mcp).call(eq("manage_drive_access"), argThat(map ->
                "drive_file_123".equals(map.get("file_id")) &&
                "customer@example.com".equals(map.get("share_with")) &&
                Boolean.TRUE.equals(map.get("send_notification"))
        ));
    }
}
