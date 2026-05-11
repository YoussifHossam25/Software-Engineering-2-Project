package com.ecommerce.inventory.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class StockCheckResponse {
    private Long productId;
    private boolean available;
    private Integer availableQuantity;
}
