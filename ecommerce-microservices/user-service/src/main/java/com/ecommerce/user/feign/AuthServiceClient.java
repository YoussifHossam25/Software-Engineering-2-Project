package com.ecommerce.user.feign;

import com.ecommerce.user.dto.AdminCreateUserRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "AUTH-SERVICE", configuration = com.ecommerce.user.config.FeignConfig.class)
public interface AuthServiceClient {

    @PostMapping("/api/auth/register")
    Map<String, Object> register(@RequestBody AdminCreateUserRequest request);
}
