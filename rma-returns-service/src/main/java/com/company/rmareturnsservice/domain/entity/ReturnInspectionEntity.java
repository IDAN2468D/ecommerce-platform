package com.company.rmareturnsservice.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "return_inspections")
public class ReturnInspectionEntity {
    @Id
    private String id;
    private String rmaNumber;
    private String imageBase64Hash;
    private String detectedCondition;
    private Double confidenceScore;
    private boolean autoApproved;
    private Instant inspectedAt;
}
