package com.ecommerce.delivery.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                var request = attrs.getRequest();
                String userId = request.getHeader("X-User-Id");
                String email = request.getHeader("X-User-Email");
                String role = request.getHeader("X-User-Role");
                if (userId != null) requestTemplate.header("X-User-Id", userId);
                if (email != null) requestTemplate.header("X-User-Email", email);
                if (role != null) requestTemplate.header("X-User-Role", role);
            } else {
                requestTemplate.header("X-User-Id", "0");
                requestTemplate.header("X-User-Email", "system@internal.service");
                requestTemplate.header("X-User-Role", "ADMIN");
            }
        };
    }
}
