package com.company.authservice.security;

import com.company.authservice.domain.entity.UserEntity;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {

    // Shared HMAC secret key matching order-service for zero-trust microservice verification
    public static final String DEFAULT_HMAC_SECRET = "order-service-default-secret-key-32-bytes!!";
    public static final long EXPIRATION_TIME_MS = 86_400_000L; // 24 hours

    public String generateToken(UserEntity user) {
        try {
            Date now = new Date();
            Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME_MS);

            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(user.getEmail())
                    .claim("userId", user.getId().toString())
                    .claim("email", user.getEmail())
                    .claim("fullName", user.getFullName())
                    .claim("role", user.getRole())
                    .issueTime(now)
                    .expirationTime(expiryDate)
                    .build();

            SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claimsSet);
            signedJWT.sign(new MACSigner(DEFAULT_HMAC_SECRET.getBytes(StandardCharsets.UTF_8)));

            return signedJWT.serialize();
        } catch (Exception ex) {
            log.error("Failed to generate JWT token for user {}: {}", user.getEmail(), ex.getMessage());
            throw new RuntimeException("Error generating JWT token", ex);
        }
    }

    public String extractSubject(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            if (!signedJWT.verify(new MACVerifier(DEFAULT_HMAC_SECRET.getBytes(StandardCharsets.UTF_8)))) {
                throw new IllegalArgumentException("Invalid JWT signature");
            }
            if (new Date().after(signedJWT.getJWTClaimsSet().getExpirationTime())) {
                throw new IllegalArgumentException("JWT token is expired");
            }
            return signedJWT.getJWTClaimsSet().getSubject();
        } catch (Exception ex) {
            log.warn("Failed to parse/validate JWT token: {}", ex.getMessage());
            throw new IllegalArgumentException("Invalid or expired JWT token: " + ex.getMessage());
        }
    }
}
