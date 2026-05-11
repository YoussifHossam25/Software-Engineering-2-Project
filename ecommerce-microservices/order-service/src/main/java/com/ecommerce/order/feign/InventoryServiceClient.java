package com.ecommerce.order.feign;

import com.ecommerce.order.dto.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "INVENTORY-SERVICE", configuration = com.ecommerce.order.config.FeignConfig.class)
public interface InventoryServiceClient {

    @PostMapping("/api/inventory/check")
    ApiResponse<StockCheckResponse> checkStock(@RequestBody StockCheckRequest request);

    @PostMapping("/api/inventory/reserve")
    ApiResponse<Void> reserveStock(@RequestBody StockReserveRequest request);

    @PostMapping("/api/inventory/release")
    ApiResponse<Void> releaseStock(@RequestBody StockReleaseRequest request);

    @PostMapping("/api/inventory/confirm-deduction")
    ApiResponse<Void> confirmStockDeduction(@RequestBody StockReserveRequest request);
}
