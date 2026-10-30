package com.company.authservice.service;

import com.company.authservice.domain.entity.UserEntity;
import com.company.authservice.dto.AuthDtos.*;
import com.company.authservice.repository.UserRepository;
import com.company.authservice.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JwtTokenProvider jwtTokenProvider = new JwtTokenProvider();

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtTokenProvider, kafkaTemplate);
    }

    @Test
    @DisplayName("Register new user successfully saves to MongoDB, publishes Kafka event, and returns JWT")
    void registerUser_Success() {
        RegisterRequest request = new RegisterRequest("idan@example.com", "Password123!", "Idan Cohen");

        when(userRepository.existsByEmailIgnoreCase("idan@example.com")).thenReturn(false);
        when(userRepository.save(any(UserEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.token()).isNotBlank();
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.user().email()).isEqualTo("idan@example.com");
        assertThat(response.user().fullName()).isEqualTo("Idan Cohen");

        verify(userRepository, times(1)).save(any(UserEntity.class));
        verify(kafkaTemplate, times(1)).send(eq("user-events"), any(), any());
    }

    @Test
    @DisplayName("Register user with duplicate email throws 409 Conflict")
    void registerUser_DuplicateEmail_ThrowsConflict() {
        RegisterRequest request = new RegisterRequest("idan@example.com", "Password123!", "Idan Cohen");

        when(userRepository.existsByEmailIgnoreCase("idan@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("כבר רשומה");

        verify(userRepository, never()).save(any());
        verifyNoInteractions(kafkaTemplate);
    }

    @Test
    @DisplayName("Login with valid credentials returns JWT and publishes Kafka event")
    void login_Success() {
        LoginRequest request = new LoginRequest("idan@example.com", "Password123!");

        UserEntity user = UserEntity.builder()
                .id(UUID.randomUUID())
                .email("idan@example.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .fullName("Idan Cohen")
                .role("CUSTOMER")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(userRepository.findByEmailIgnoreCase("idan@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(UserEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.token()).isNotBlank();
        assertThat(response.user().email()).isEqualTo("idan@example.com");

        verify(userRepository, times(1)).save(user);
        verify(kafkaTemplate, times(1)).send(eq("user-events"), any(), any());
    }

    @Test
    @DisplayName("Login with wrong password throws 401 Unauthorized")
    void login_WrongPassword_ThrowsUnauthorized() {
        LoginRequest request = new LoginRequest("idan@example.com", "WrongPassword!");

        UserEntity user = UserEntity.builder()
                .id(UUID.randomUUID())
                .email("idan@example.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .fullName("Idan Cohen")
                .build();

        when(userRepository.findByEmailIgnoreCase("idan@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("אימייל או סיסמה שגויים");

        verify(userRepository, never()).save(any());
        verifyNoInteractions(kafkaTemplate);
    }
}
