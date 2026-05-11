package com.ecommerce.order.dto;

import lombok.Data;

@Data
public class StockCheckResponse {
    private Long productId;
    private boolean available;
    private Integer availableQuantity;
}
