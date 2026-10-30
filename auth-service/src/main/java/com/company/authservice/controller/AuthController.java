package com.company.authservice.controller;

import com.company.authservice.dto.AuthDtos.*;
import com.company.authservice.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication API", description = "User registration, login, and profile endpoints with JWT & Kafka")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user record in MongoDB and publishes UserRegisteredEvent to Kafka")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticates user against MongoDB, issues JWT token, and publishes UserLoggedInEvent to Kafka")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile", description = "Decodes JWT token and retrieves user details from MongoDB")
    public ResponseEntity<UserProfileResponse> getMe(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        UserProfileResponse profile = authService.getMe(authHeader);
        return ResponseEntity.ok(profile);
    }
}
