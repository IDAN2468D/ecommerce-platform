package com.company.inventoryservice.domain.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.UUID;

@Document(collection = "outbox_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutboxEventEntity {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    private String aggregateType;

    @Indexed
    private String aggregateId;

    private String eventType;

    private String topic;

    private String payload;

    @Indexed
    @Builder.Default
    private String status = "PENDING"; // PENDING, PUBLISHED, FAILED

    @Builder.Default
    private int retryCount = 0;

    @Builder.Default
    private Instant createdAt = Instant.now();

    private Instant publishedAt;
}
