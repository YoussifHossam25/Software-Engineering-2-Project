package com.ecommerce.inventory.dto;

import lombok.Data;

@Data
public class StockReleaseRequest {
    private Long productId;
    private Integer quantity;
}
