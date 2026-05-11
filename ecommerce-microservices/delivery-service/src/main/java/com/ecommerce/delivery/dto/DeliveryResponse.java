package com.ecommerce.delivery.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DeliveryResponse {
    private Long id;
    private String deliveryNumber;
    private Long orderId;
    private String orderNumber;
    private Long customerId;
    private String customerEmail;
    private String status;
    private Long driverId;
    private String driverName;
    private String driverPhone;
    private String deliveryAddress;
    private String trackingNotes;
    private LocalDateTime estimatedDeliveryTime;
    private LocalDateTime actualDeliveryTime;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
