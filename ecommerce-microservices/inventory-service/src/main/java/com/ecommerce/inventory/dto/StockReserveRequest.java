package com.ecommerce.inventory.dto;

import lombok.Data;

@Data
public class StockReserveRequest {
    private Long productId;
    private Integer quantity;
    private String orderId;
}
