package com.ecommerce.order.service;

import com.ecommerce.order.dto.*;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.entity.OrderItem;
import com.ecommerce.order.entity.OrderStatus;
import com.ecommerce.order.exception.InsufficientStockException;
import com.ecommerce.order.exception.ResourceNotFoundException;
import com.ecommerce.order.exception.UnauthorizedException;
import com.ecommerce.order.feign.ProductServiceClient;
import com.ecommerce.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private static final BigDecimal TAX_RATE = BigDecimal.ZERO;
    private static final BigDecimal SHIPPING_COST = BigDecimal.ZERO;

    private final OrderRepository orderRepository;
    private final ProductServiceClient productServiceClient;

    @Transactional
    public OrderResponse createOrder(OrderRequest request, Long customerId, String customerEmail) {
        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        List<OrderItem> items = new ArrayList<>();
        List<Long> deductedProductIds = new ArrayList<>();

        try {
            for (OrderItemRequest itemReq : request.getItems()) {
                ApiResponse<ProductDto> productResponse = productServiceClient.getProductById(itemReq.getProductId());
                ProductDto product = productResponse.getData();
                if (product == null || !product.isActive()) {
                    throw new ResourceNotFoundException("Product not found or unavailable: " + itemReq.getProductId());
                }

                productServiceClient.deductStock(
                        itemReq.getProductId(),
                        Map.of("quantity", itemReq.getQuantity())
                );
                deductedProductIds.add(itemReq.getProductId());

                BigDecimal unitPrice = product.getPrice();
                BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));

                OrderItem orderItem = OrderItem.builder()
                        .productId(product.getId())
                        .productName(product.getName())
                        .productSku(product.getSku())
                        .quantity(itemReq.getQuantity())
                        .unitPrice(unitPrice)
                        .totalPrice(totalPrice)
                        .build();
                items.add(orderItem);
            }

            BigDecimal subtotal = items.stream()
                    .map(OrderItem::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
            BigDecimal total = subtotal.add(tax).add(SHIPPING_COST);

            Order order = Order.builder()
                    .orderNumber(orderNumber)
                    .customerId(customerId)
                    .customerEmail(customerEmail)
                    .status(OrderStatus.PENDING)
                    .shippingAddress(request.getShippingAddress())
                    .notes(request.getNotes())
                    .subtotal(subtotal)
                    .tax(tax)
                    .shippingCost(SHIPPING_COST)
                    .totalAmount(total)
                    .build();

            items.forEach(item -> item.setOrder(order));
            order.setItems(items);

            Order saved = orderRepository.save(order);
            log.info("Order created: {} for customer {}", orderNumber, customerId);
            return toResponse(saved);

        } catch (Exception ex) {
            for (int i = 0; i < deductedProductIds.size(); i++) {
                Long productId = deductedProductIds.get(i);
                Integer qty = request.getItems().get(i).getQuantity();
                try {
                    productServiceClient.restoreStock(productId, Map.of("quantity", qty));
                } catch (Exception restoreEx) {
                    log.error("Failed to restore stock for product {} on order {}: {}",
                            productId, orderNumber, restoreEx.getMessage());
                }
            }
            throw ex;
        }
    }

    public OrderResponse getOrderById(Long id, Long requestingUserId, String requestingRole) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
        if (!isAdminOrManager(requestingRole) && !order.getCustomerId().equals(requestingUserId)) {
            throw new UnauthorizedException("Access denied to order: " + id);
        }
        return toResponse(order);
    }

    public OrderResponse getOrderByNumber(String orderNumber, Long requestingUserId, String requestingRole) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderNumber));
        if (!isAdminOrManager(requestingRole) && !order.getCustomerId().equals(requestingUserId)) {
            throw new UnauthorizedException("Access denied to order: " + orderNumber);
        }
        return toResponse(order);
    }

    public List<OrderResponse> getMyOrders(Long customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersByStatus(String status) {
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            return orderRepository.findByStatusOrderByCreatedAtDesc(orderStatus)
                    .stream().map(this::toResponse).collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Invalid status: " + status);
        }
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatusUpdateRequest request,
                                           Long requestingUserId, String requestingRole) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));

        if (!isAdminOrManager(requestingRole) && !order.getCustomerId().equals(requestingUserId)) {
            throw new UnauthorizedException("Access denied");
        }

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Invalid status: " + request.getStatus());
        }

        OrderStatus currentStatus = order.getStatus();
        validateStatusTransition(currentStatus, newStatus, requestingRole);

        if (newStatus == OrderStatus.CANCELLED && currentStatus == OrderStatus.PENDING) {
            for (OrderItem item : order.getItems()) {
                try {
                    productServiceClient.restoreStock(
                            item.getProductId(),
                            Map.of("quantity", item.getQuantity())
                    );
                } catch (Exception ex) {
                    log.error("Failed to restore stock for item {} on cancelled order {}: {}",
                            item.getProductId(), order.getOrderNumber(), ex.getMessage());
                }
            }
        }

        order.setStatus(newStatus);
        if (request.getNotes() != null) {
            order.setNotes(request.getNotes());
        }

        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse cancelOrder(Long id, Long requestingUserId, String requestingRole) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));

        if (!isAdminOrManager(requestingRole) && !order.getCustomerId().equals(requestingUserId)) {
            throw new UnauthorizedException("Access denied");
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Only PENDING orders can be cancelled by customer");
        }

        for (OrderItem item : order.getItems()) {
            try {
                productServiceClient.restoreStock(
                        item.getProductId(),
                        Map.of("quantity", item.getQuantity())
                );
            } catch (Exception ex) {
                log.error("Failed to restore stock for item {} on cancelled order {}: {}",
                        item.getProductId(), order.getOrderNumber(), ex.getMessage());
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        return toResponse(orderRepository.save(order));
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next, String role) {
        if (!isAdminOrManager(role)) {
            if (next != OrderStatus.CANCELLED) {
                throw new UnauthorizedException("Customers can only cancel orders");
            }
        }
    }

    private boolean isAdminOrManager(String role) {
        return "ADMIN".equalsIgnoreCase(role) || "MANAGER".equalsIgnoreCase(role);
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .productSku(item.getProductSku())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerId(order.getCustomerId())
                .customerEmail(order.getCustomerEmail())
                .status(order.getStatus().name())
                .items(itemResponses)
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .shippingCost(order.getShippingCost())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
