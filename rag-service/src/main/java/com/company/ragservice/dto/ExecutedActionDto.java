package com.company.ragservice.dto;

import lombok.Builder;

import java.util.Map;

@Builder
public record ExecutedActionDto(
        String toolName,
        String actionType,
        String status,
        String summary,
        Map<String, Object> payload
) {}
