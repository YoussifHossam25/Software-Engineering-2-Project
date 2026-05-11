package com.ecommerce.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DeliveryUpdateRequest {
    @NotBlank(message = "Status is required")
    private String status;
    private String trackingNotes;
    private String failureReason;
    private LocalDateTime estimatedDeliveryTime;
}
