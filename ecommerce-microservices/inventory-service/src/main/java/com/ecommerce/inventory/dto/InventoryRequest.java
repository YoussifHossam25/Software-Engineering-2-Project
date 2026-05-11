package com.ecommerce.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;
    private String productSku;
    @NotBlank(message = "Product name is required")
    private String productName;
    @NotNull @Min(0)
    private Integer quantityInStock;
    private Integer reorderLevel;
    private String warehouseLocation;
}
