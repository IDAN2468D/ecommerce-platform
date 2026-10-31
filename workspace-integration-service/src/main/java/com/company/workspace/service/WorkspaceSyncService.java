package com.company.workspace.service;

import com.company.common.events.ShipmentCancelledEvent;
import com.company.common.events.ShipmentScheduledEvent;
import com.company.workspace.config.WorkspaceMcpProperties;
import com.company.workspace.domain.WorkspaceLinkEntity;
import com.company.workspace.domain.WorkspaceLinkRepository;
import com.company.workspace.mcp.McpToolGateway;
import io.modelcontextprotocol.spec.McpSchema;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceSyncService {

    private static final Pattern DRIVE_ID_PATTERN = Pattern.compile("(?i)\\bid[:=]\\s*\"?([A-Za-z0-9_-]{10,})");
    private static final Pattern EVENT_ID_PATTERN = Pattern.compile("(?i)(?:event\\s*)?id[:=]\\s*\"?([a-v0-9_]{5,})");

    private final McpToolGateway mcp;
    private final WorkspaceLinkRepository linkRepository;
    private final WorkspaceMcpProperties props;

    /**
     * Archives the official Hebrew Tax Invoice PDF into Google Drive via MCP.
     * Operation is strictly idempotent.
     */
    public void archiveInvoice(UUID orderId, String customerId) {
        WorkspaceLinkEntity link = linkRepository.findById(orderId).orElseGet(() -> newLink(orderId, customerId));
        if (link.getDriveFileId() != null) {
            log.info("Invoice for orderId={} is already archived in Drive (fileId={}), skipping.", orderId, link.getDriveFileId());
            return;
        }

        String shortOrderId = orderId.toString().substring(0, 8).toUpperCase();
        String fileName = "INV-" + shortOrderId + ".pdf";
        String downloadUrl = props.drive().invoiceSourceUrlTemplate().formatted(orderId);

        Map<String, Object> args = new LinkedHashMap<>();
        args.put("user_google_email", props.userEmail());
        args.put("file_name", fileName);
        args.put("folder_id", props.drive().invoicesFolderId());
        args.put("mime_type", "application/pdf");
        args.put("fileUrl", downloadUrl);

        log.info("Invoking MCP tool '{}' to archive invoice for orderId={}...", props.tools().driveCreateFile(), orderId);
        McpSchema.CallToolResult result = mcp.call(props.tools().driveCreateFile(), args);

        String fileId = McpToolGateway.extractId(result, "id", DRIVE_ID_PATTERN)
                .orElse(shortOrderId + "-drive-ref");

        link.setDriveFileId(fileId);
        link.setCustomerId(customerId);
        link.setUpdatedAt(Instant.now());
        linkRepository.save(link);
        log.info("Successfully archived invoice to Google Drive: orderId={}, fileId={}", orderId, fileId);
    }

    /**
     * Schedules a delivery appointment window in Google Calendar via MCP.
     * Operation is strictly idempotent.
     */
    public void scheduleDelivery(ShipmentScheduledEvent event) {
        WorkspaceLinkEntity link = linkRepository.findById(event.orderId()).orElseGet(() -> newLink(event.orderId(), event.customerId()));
        if (link.getCalendarEventId() != null) {
            log.info("Calendar event for orderId={} already exists (eventId={}), skipping.", event.orderId(), link.getCalendarEventId());
            return;
        }

        ZoneId zone = ZoneId.of(props.calendar().timeZone());
        Instant start = event.estimatedDeliveryDate() != null ? event.estimatedDeliveryDate() : Instant.now().plusSeconds(86400);
        Instant end = start.plus(props.calendar().deliveryWindow());

        Map<String, Object> args = new LinkedHashMap<>();
        args.put("action", "create");
        args.put("user_google_email", props.userEmail());
        args.put("calendar_id", props.calendar().calendarId());
        args.put("summary", "משלוח הזמנה " + event.orderId().toString().substring(0, 8).toUpperCase());
        args.put("start_time", toRfc3339(start, zone));
        args.put("end_time", toRfc3339(end, zone));
        args.put("timezone", props.calendar().timeZone());
        args.put("location", event.destinationAddress() != null ? event.destinationAddress() : "כתובת הלקוח");
        args.put("description", "חברת שילוח: " + event.carrier() + "\nמספר מעקב: " + event.trackingNumber());

        log.info("Invoking MCP tool '{}' to schedule delivery event for orderId={}...", props.tools().calendarCreateEvent(), event.orderId());
        McpSchema.CallToolResult result = mcp.call(props.tools().calendarCreateEvent(), args);

        String eventId = McpToolGateway.extractId(result, "id", EVENT_ID_PATTERN)
                .orElse(event.orderId().toString().substring(0, 8) + "-cal-event");

        link.setCalendarEventId(eventId);
        link.setCustomerId(event.customerId());
        link.setUpdatedAt(Instant.now());
        linkRepository.save(link);
        log.info("Successfully scheduled Google Calendar event: orderId={}, eventId={}", event.orderId(), eventId);
    }

    /**
     * SAGA Compensating Transaction: deletes the delivery appointment from Google Calendar if shipment is cancelled.
     */
    public void cancelDelivery(ShipmentCancelledEvent event) {
        linkRepository.findById(event.orderId())
                .filter(l -> l.getCalendarEventId() != null)
                .ifPresentOrElse(link -> {
                    log.info("Executing SAGA compensation: Deleting Calendar event {} for cancelled orderId={}...", link.getCalendarEventId(), event.orderId());
                    mcp.call(props.tools().calendarDeleteEvent(), Map.of(
                            "action", "delete",
                            "user_google_email", props.userEmail(),
                            "calendar_id", props.calendar().calendarId(),
                            "event_id", link.getCalendarEventId()
                    ));
                    link.setCalendarEventId(null);
                    link.setUpdatedAt(Instant.now());
                    linkRepository.save(link);
                    log.info("Successfully removed Calendar event for orderId={}", event.orderId());
                }, () -> log.info("No active Calendar event found for cancelled orderId={}, no compensation needed.", event.orderId()));
    }

    public Optional<WorkspaceLinkEntity> getLinkByOrderId(UUID orderId) {
        return linkRepository.findById(orderId);
    }

    private static String toRfc3339(Instant instant, ZoneId zone) {
        return OffsetDateTime.ofInstant(instant, zone).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }

    private static WorkspaceLinkEntity newLink(UUID orderId, String customerId) {
        return WorkspaceLinkEntity.builder()
                .orderId(orderId)
                .customerId(customerId)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }
}
