package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.*;
import com.ecommerce.auth.entity.AuthUser;
import com.ecommerce.auth.entity.Role;
import com.ecommerce.auth.exception.DuplicateResourceException;
import com.ecommerce.auth.exception.ResourceNotFoundException;
import com.ecommerce.auth.exception.UnauthorizedException;
import com.ecommerce.auth.feign.UserServiceClient;
import com.ecommerce.auth.repository.AuthUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserServiceClient userServiceClient;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (authUserRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        Role role = (request.getRole() != null) ? request.getRole() : Role.CUSTOMER;

        AuthUser authUser = AuthUser.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .active(true)
                .build();

        AuthUser saved = authUserRepository.save(authUser);
        log.info("Registered new user: email={}, role={}", saved.getEmail(), saved.getRole());

        try {
            userServiceClient.createUserProfile(new CreateUserProfileRequest(
                    saved.getId(), saved.getName(), saved.getEmail(), saved.getRole().name()
            ));
        } catch (Exception ex) {
            log.warn("Could not create user profile in user-service for userId={}: {}", saved.getId(), ex.getMessage());
        }

        String token = jwtService.generateToken(saved);
        return buildAuthResponse(saved, token);
    }

    public AuthResponse login(LoginRequest request) {
        AuthUser authUser = authUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (!authUser.getActive()) {
            throw new UnauthorizedException("Account is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), authUser.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        log.info("User logged in: email={}", authUser.getEmail());
        String token = jwtService.generateToken(authUser);
        return buildAuthResponse(authUser, token);
    }

    public TokenValidationResponse validateToken(String token) {
        if (!jwtService.validateToken(token)) {
            return TokenValidationResponse.builder().valid(false).build();
        }
        return TokenValidationResponse.builder()
                .valid(true)
                .userId(jwtService.extractUserId(token))
                .email(jwtService.extractEmail(token))
                .role(jwtService.extractRole(token))
                .build();
    }

    private AuthResponse buildAuthResponse(AuthUser user, String token) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .expiresIn(86400000L)
                .build();
    }
}
