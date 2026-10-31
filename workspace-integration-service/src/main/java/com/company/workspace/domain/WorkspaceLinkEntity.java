package com.company.workspace.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.UUID;

@Document("workspace_links")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceLinkEntity {

    @Id
    private UUID orderId;

    private String driveFileId;

    private String calendarEventId;

    private String customerId;

    private Instant createdAt;

    private Instant updatedAt;

    @Version
    private Long version;
}
