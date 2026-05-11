package com.ecommerce.user.service;

import com.ecommerce.user.dto.AdminCreateUserRequest;
import com.ecommerce.user.dto.CreateUserProfileRequest;
import com.ecommerce.user.dto.UserResponse;
import com.ecommerce.user.dto.UserUpdateRequest;
import com.ecommerce.user.entity.User;
import com.ecommerce.user.exception.ResourceNotFoundException;
import com.ecommerce.user.exception.UnauthorizedException;
import com.ecommerce.user.feign.AuthServiceClient;
import com.ecommerce.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final AuthServiceClient authServiceClient;

    @Transactional
    public UserResponse adminCreateUser(AdminCreateUserRequest request) {
        authServiceClient.register(request);
        return userRepository.findByEmail(request.getEmail())
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User creation failed for: " + request.getEmail()));
    }

    @Transactional
    public UserResponse createUserProfile(CreateUserProfileRequest request) {
        User user = User.builder()
                .authUserId(request.getAuthUserId())
                .name(request.getName())
                .email(request.getEmail())
                .role(request.getRole())
                .active(true)
                .build();
        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getUsersByRole(String role, Pageable pageable) {
        return userRepository.findByRole(role, pageable).map(this::toResponse);
    }

    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request, String currentEmail, String role) {
        User user = findById(id);
        boolean isAdmin = "ADMIN".equals(role) || "MANAGER".equals(role);
        boolean isSelf = user.getEmail().equals(currentEmail);

        if (!isAdmin && !isSelf) {
            throw new UnauthorizedException("You can only update your own profile");
        }

        user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getRole() != null && isAdmin) user.setRole(request.getRole());
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = findById(id);
        user.setActive(false);
        userRepository.save(user);
        log.info("Deactivated user id={}", id);
    }

    private User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private UserResponse toResponse(User u) {
        return UserResponse.builder()
                .id(u.getId()).authUserId(u.getAuthUserId())
                .name(u.getName()).email(u.getEmail())
                .phone(u.getPhone()).address(u.getAddress())
                .role(u.getRole()).active(u.getActive())
                .createdAt(u.getCreatedAt()).updatedAt(u.getUpdatedAt())
                .build();
    }
}
