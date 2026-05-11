package com.ecommerce.inventory.dto;

import lombok.Data;

@Data
public class StockCheckRequest {
    private Long productId;
    private Integer requiredQuantity;
}
