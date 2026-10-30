package com.company.authservice.service;

import com.company.authservice.domain.entity.UserEntity;
import com.company.authservice.dto.AuthDtos.*;
import com.company.authservice.repository.UserRepository;
import com.company.authservice.security.JwtTokenProvider;
import com.company.common.events.UserLoggedInEvent;
import com.company.common.events.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    public static final String TOPIC_USER_EVENTS = "user-events";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        log.info("Processing user registration for email: {}", normalizedEmail);

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            log.warn("Registration rejected: Email {} is already registered", normalizedEmail);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "כתובת אימייל זו כבר רשומה במערכת");
        }

        UserEntity user = UserEntity.builder()
                .id(UUID.randomUUID())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName().trim())
                .role("CUSTOMER")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .lastLoginAt(Instant.now())
                .build();

        UserEntity savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());

        // Publish to Kafka topic 'user-events'
        try {
            UserRegisteredEvent event = new UserRegisteredEvent(
                    savedUser.getId(),
                    savedUser.getEmail(),
                    savedUser.getFullName(),
                    savedUser.getRole(),
                    savedUser.getCreatedAt()
            );
            log.info("Publishing UserRegisteredEvent to Kafka topic '{}': email={}", TOPIC_USER_EVENTS, savedUser.getEmail());
            kafkaTemplate.send(TOPIC_USER_EVENTS, savedUser.getId().toString(), event);
        } catch (Exception ex) {
            log.warn("Failed to publish UserRegisteredEvent to Kafka: {}", ex.getMessage());
        }

        String token = jwtTokenProvider.generateToken(savedUser);
        return new AuthResponse(
                token,
                "Bearer",
                JwtTokenProvider.EXPIRATION_TIME_MS / 1000,
                toProfileResponse(savedUser)
        );
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        log.info("Processing user login attempt for email: {}", normalizedEmail);

        UserEntity user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "כתובת אימייל או סיסמה שגויים"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            log.warn("Login failed: invalid password for email: {}", normalizedEmail);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "כתובת אימייל או סיסמה שגויים");
        }

        user.setLastLoginAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        // Publish to Kafka topic 'user-events'
        try {
            UserLoggedInEvent event = new UserLoggedInEvent(
                    user.getId(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole(),
                    user.getLastLoginAt()
            );
            log.info("Publishing UserLoggedInEvent to Kafka topic '{}': email={}", TOPIC_USER_EVENTS, user.getEmail());
            kafkaTemplate.send(TOPIC_USER_EVENTS, user.getId().toString(), event);
        } catch (Exception ex) {
            log.warn("Failed to publish UserLoggedInEvent to Kafka: {}", ex.getMessage());
        }

        String token = jwtTokenProvider.generateToken(user);
        return new AuthResponse(
                token,
                "Bearer",
                JwtTokenProvider.EXPIRATION_TIME_MS / 1000,
                toProfileResponse(user)
        );
    }

    public UserProfileResponse getMe(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "חסר אסימון הרשאה תקין (Authorization Bearer Token)");
        }

        String token = authHeader.substring(7).trim();
        String email = jwtTokenProvider.extractSubject(token);

        UserEntity user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "המשתמש לא נמצא"));

        return toProfileResponse(user);
    }

    private UserProfileResponse toProfileResponse(UserEntity user) {
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getCreatedAt(),
                user.getLastLoginAt()
        );
    }
}
