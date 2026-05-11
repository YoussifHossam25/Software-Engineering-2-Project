package com.ecommerce.delivery.dto;

import lombok.Data;

@Data
public class OrderDto {
    private Long id;
    private String orderNumber;
    private Long customerId;
    private String customerEmail;
    private String status;
    private String shippingAddress;
}
