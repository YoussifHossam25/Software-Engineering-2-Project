package com.ecommerce.delivery.feign;

import com.ecommerce.delivery.dto.ApiResponse;
import com.ecommerce.delivery.dto.OrderDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "ORDER-SERVICE", configuration = com.ecommerce.delivery.config.FeignConfig.class)
public interface OrderServiceClient {

    @GetMapping("/api/orders/{id}")
    ApiResponse<OrderDto> getOrderById(@PathVariable("id") Long id);

    @GetMapping("/api/orders/number/{orderNumber}")
    ApiResponse<OrderDto> getOrderByNumber(@PathVariable("orderNumber") String orderNumber);
}
