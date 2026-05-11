package com.ecommerce.user.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor serviceRequestInterceptor() {
        return template -> {
            template.header("X-User-Id", "0");
            template.header("X-User-Email", "system@internal.service");
            template.header("X-User-Role", "ADMIN");
        };
    }
}
