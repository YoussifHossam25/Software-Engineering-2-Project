package com.ecommerce.delivery.controller;

import com.ecommerce.delivery.dto.*;
import com.ecommerce.delivery.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<DeliveryResponse>> createDelivery(
            @Valid @RequestBody DeliveryRequest request) {
        DeliveryResponse delivery = deliveryService.createDelivery(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(delivery, "Delivery created successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DeliveryResponse>> getDeliveryById(
            @PathVariable Long id, Authentication auth) {
        Long userId = Long.parseLong((String) auth.getDetails());
        String role = getRole(auth);
        return ResponseEntity.ok(ApiResponse.success(
                deliveryService.getDeliveryById(id, userId, role), "Delivery retrieved"));
    }

    @GetMapping("/number/{deliveryNumber}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DeliveryResponse>> getDeliveryByNumber(
            @PathVariable String deliveryNumber, Authentication auth) {
        Long userId = Long.parseLong((String) auth.getDetails());
        String role = getRole(auth);
        return ResponseEntity.ok(ApiResponse.success(
                deliveryService.getDeliveryByNumber(deliveryNumber, userId, role), "Delivery retrieved"));
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DeliveryResponse>> getDeliveryByOrderId(
            @PathVariable Long orderId, Authentication auth) {
        Long userId = Long.parseLong((String) auth.getDetails());
        String role = getRole(auth);
        return ResponseEntity.ok(ApiResponse.success(
                deliveryService.getDeliveryByOrderId(orderId, userId, role), "Delivery retrieved"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DELIVERY')")
    public ResponseEntity<ApiResponse<List<DeliveryResponse>>> getAllDeliveries() {
        return ResponseEntity.ok(ApiResponse.success(deliveryService.getAllDeliveries(), "All deliveries retrieved"));
    }

    @GetMapping("/my-deliveries")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<DeliveryResponse>>> getMyDeliveries(Authentication auth) {
        Long userId = Long.parseLong((String) auth.getDetails());
        return ResponseEntity.ok(ApiResponse.success(
                deliveryService.getMyDeliveries(userId), "Deliveries retrieved"));
    }

    @GetMapping("/driver/{driverId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DELIVERY')")
    public ResponseEntity<ApiResponse<List<DeliveryResponse>>> getDriverDeliveries(
            @PathVariable Long driverId, Authentication auth) {
        Long userId = Long.parseLong((String) auth.getDetails());
        String role = getRole(auth);
        return ResponseEntity.ok(ApiResponse.success(
                deliveryService.getDriverDeliveries(driverId, userId, role), "Driver deliveries retrieved"));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<DeliveryResponse>>> getDeliveriesByStatus(
            @PathVariable String status) {
        return ResponseEntity.ok(ApiResponse.success(
                deliveryService.getDeliveriesByStatus(status), "Deliveries retrieved"));
    }

    @PutMapping("/{id}/assign-driver")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<DeliveryResponse>> assignDriver(
            @PathVariable Long id,
            @Valid @RequestBody AssignDriverRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                deliveryService.assignDriver(id, request), "Driver assigned successfully"));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DELIVERY')")
    public ResponseEntity<ApiResponse<DeliveryResponse>> updateDeliveryStatus(
            @PathVariable Long id,
            @Valid @RequestBody DeliveryUpdateRequest request,
            Authentication auth) {
        Long userId = Long.parseLong((String) auth.getDetails());
        String role = getRole(auth);
        return ResponseEntity.ok(ApiResponse.success(
                deliveryService.updateDeliveryStatus(id, request, userId, role), "Delivery status updated"));
    }

    private String getRole(Authentication auth) {
        return auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
    }
}
