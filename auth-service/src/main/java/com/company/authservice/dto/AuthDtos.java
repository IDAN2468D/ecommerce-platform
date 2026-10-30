package com.company.authservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank(message = "כתובת אימייל הינה שדה חובה")
            @Email(message = "כתובת אימייל לא תקינה")
            String email,

            @NotBlank(message = "סיסמה הינה שדה חובה")
            @Size(min = 6, message = "הסיסמה חייבת להכיל לפחות 6 תווים")
            String password,

            @NotBlank(message = "שם מלא הינו שדה חובה")
            String fullName
    ) {}

    public record LoginRequest(
            @NotBlank(message = "כתובת אימייל הינה שדה חובה")
            @Email(message = "כתובת אימייל לא תקינה")
            String email,

            @NotBlank(message = "סיסמה הינה שדה חובה")
            String password
    ) {}

    public record AuthResponse(
            String token,
            String tokenType,
            long expiresIn,
            UserProfileResponse user
    ) {}

    public record UserProfileResponse(
            UUID id,
            String email,
            String fullName,
            String role,
            Instant createdAt,
            Instant lastLoginAt
    ) {}
}
