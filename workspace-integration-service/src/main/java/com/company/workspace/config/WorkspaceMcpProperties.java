package com.company.workspace.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;
import java.util.List;

@Validated
@ConfigurationProperties(prefix = "workspace.mcp")
public record WorkspaceMcpProperties(
        @NotBlank String baseUrl,
        @NotBlank String endpoint,
        @NotNull Duration requestTimeout,
        String authToken,
        @NotBlank String userEmail,
        @Valid @NotNull Tools tools,
        @Valid @NotNull Drive drive,
        @Valid @NotNull Calendar calendar
) {
    public record Tools(@NotBlank String driveCreateFile,
                        @NotBlank String calendarCreateEvent,
                        @NotBlank String calendarDeleteEvent) {
        public List<String> all() {
            return List.of(driveCreateFile, calendarCreateEvent, calendarDeleteEvent);
        }
    }

    public record Drive(@NotBlank String invoicesFolderId,
                        @NotBlank String invoiceSourceUrlTemplate) {}

    public record Calendar(@NotBlank String calendarId,
                           @NotBlank String timeZone,
                           @NotNull Duration deliveryWindow) {}
}
