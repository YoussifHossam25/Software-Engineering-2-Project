package com.ecommerce.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeliveryRequest {
    @NotNull(message = "Order ID is required")
    private Long orderId;
    @NotBlank(message = "Order number is required")
    private String orderNumber;
    private Long customerId;
    private String customerEmail;
    private String deliveryAddress;
    private String trackingNotes;
}
