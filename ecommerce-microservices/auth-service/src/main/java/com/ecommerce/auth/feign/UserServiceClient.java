package com.ecommerce.auth.feign;

import com.ecommerce.auth.config.FeignConfig;
import com.ecommerce.auth.dto.CreateUserProfileRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "USER-SERVICE", configuration = FeignConfig.class)
public interface UserServiceClient {

    @PostMapping("/api/users/internal")
    void createUserProfile(@RequestBody CreateUserProfileRequest request);
}
