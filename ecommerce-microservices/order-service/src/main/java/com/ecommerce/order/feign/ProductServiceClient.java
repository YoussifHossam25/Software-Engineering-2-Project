package com.ecommerce.order.feign;

import com.ecommerce.order.dto.ApiResponse;
import com.ecommerce.order.dto.ProductDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "PRODUCT-SERVICE", configuration = com.ecommerce.order.config.FeignConfig.class)
public interface ProductServiceClient {

    @GetMapping("/api/products/{id}")
    ApiResponse<ProductDto> getProductById(@PathVariable("id") Long id);

    @GetMapping("/api/products/sku/{sku}")
    ApiResponse<ProductDto> getProductBySku(@PathVariable("sku") String sku);

    @PostMapping("/api/products/{id}/deduct-stock")
    ApiResponse<ProductDto> deductStock(@PathVariable("id") Long id, @RequestBody Map<String, Integer> body);

    @PostMapping("/api/products/{id}/restore-stock")
    ApiResponse<ProductDto> restoreStock(@PathVariable("id") Long id, @RequestBody Map<String, Integer> body);
}
