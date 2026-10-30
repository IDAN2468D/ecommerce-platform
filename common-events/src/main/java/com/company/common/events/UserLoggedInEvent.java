package com.company.common.events;

import java.time.Instant;
import java.util.UUID;

public record UserLoggedInEvent(
        UUID userId,
        String email,
        String fullName,
        String role,
        Instant timestamp
) {}
