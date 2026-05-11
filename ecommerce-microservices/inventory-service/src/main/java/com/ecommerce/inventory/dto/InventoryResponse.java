package com.ecommerce.inventory.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InventoryResponse {
    private Long id;
    private Long productId;
    private String productSku;
    private String productName;
    private Integer quantityInStock;
    private Integer reservedQuantity;
    private Integer availableQuantity;
    private Integer reorderLevel;
    private boolean lowStock;
    private String warehouseLocation;
    private LocalDateTime lastRestockedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
