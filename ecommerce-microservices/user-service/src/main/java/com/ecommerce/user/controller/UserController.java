package com.ecommerce.user.controller;

import com.ecommerce.user.dto.AdminCreateUserRequest;
import com.ecommerce.user.dto.ApiResponse;
import com.ecommerce.user.dto.CreateUserProfileRequest;
import com.ecommerce.user.dto.UserResponse;
import com.ecommerce.user.dto.UserUpdateRequest;
import com.ecommerce.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> adminCreateUser(
            @Valid @RequestBody AdminCreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(userService.adminCreateUser(request), "User created"));
    }

    /** Called internally by auth-service — no JWT, no gateway routing */
    @PostMapping("/internal")
    public ResponseEntity<ApiResponse<UserResponse>> createUserProfile(
            @RequestBody CreateUserProfileRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(userService.createUserProfile(request), "User profile created"));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile(
            @RequestHeader("X-User-Email") String email) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserByEmail(email), "Profile retrieved"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id), "User retrieved"));
    }

    @GetMapping("/by-email")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByEmail(@RequestParam String email) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserByEmail(email), "User retrieved"));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(required = false) String role,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<UserResponse> result = (role != null && !role.isBlank())
                ? userService.getUsersByRole(role, pageable)
                : userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Users retrieved"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request,
            @RequestHeader("X-User-Email") String currentEmail,
            @RequestHeader("X-User-Role") String role) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateUser(id, request, currentEmail, role), "User updated"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deactivated"));
    }
}
