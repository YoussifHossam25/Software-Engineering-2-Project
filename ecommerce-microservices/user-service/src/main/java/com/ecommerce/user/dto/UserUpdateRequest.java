package com.ecommerce.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @NotBlank(message = "Name is required")
    private String name;
    private String phone;
    private String address;
    private String role;
}
