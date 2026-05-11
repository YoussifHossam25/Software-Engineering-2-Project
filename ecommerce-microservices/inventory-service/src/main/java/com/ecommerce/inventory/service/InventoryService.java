package com.ecommerce.inventory.service;

import com.ecommerce.inventory.dto.*;
import com.ecommerce.inventory.entity.Inventory;
import com.ecommerce.inventory.exception.InsufficientStockException;
import com.ecommerce.inventory.exception.ResourceNotFoundException;
import com.ecommerce.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    @Transactional
    public InventoryResponse createInventory(InventoryRequest request) {
        inventoryRepository.findByProductId(request.getProductId()).ifPresent(i -> {
            throw new com.ecommerce.inventory.exception.DuplicateResourceException(
                    "Inventory already exists for productId: " + request.getProductId());
        });
        Inventory inv = Inventory.builder()
                .productId(request.getProductId())
                .productSku(request.getProductSku())
                .productName(request.getProductName())
                .quantityInStock(request.getQuantityInStock())
                .reservedQuantity(0)
                .reorderLevel(request.getReorderLevel() != null ? request.getReorderLevel() : 10)
                .warehouseLocation(request.getWarehouseLocation())
                .lastRestockedAt(LocalDateTime.now())
                .build();
        return toResponse(inventoryRepository.save(inv));
    }

    @Transactional(readOnly = true)
    public InventoryResponse getInventoryByProductId(Long productId) {
        return toResponse(findByProductId(productId));
    }

    @Transactional(readOnly = true)
    public Page<InventoryResponse> getAllInventory(Pageable pageable) {
        return inventoryRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getLowStockItems() {
        return inventoryRepository.findByQuantityInStockLessThanEqual(10)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public InventoryResponse updateInventory(Long id, InventoryRequest request) {
        Inventory inv = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found: " + id));
        inv.setProductSku(request.getProductSku());
        inv.setProductName(request.getProductName());
        inv.setQuantityInStock(request.getQuantityInStock());
        if (request.getReorderLevel() != null) inv.setReorderLevel(request.getReorderLevel());
        if (request.getWarehouseLocation() != null) inv.setWarehouseLocation(request.getWarehouseLocation());
        return toResponse(inventoryRepository.save(inv));
    }

    @Transactional
    public InventoryResponse addStock(Long productId, Integer quantity) {
        Inventory inv = findByProductId(productId);
        inv.setQuantityInStock(inv.getQuantityInStock() + quantity);
        inv.setLastRestockedAt(LocalDateTime.now());
        log.info("Restocked productId={} +{} units", productId, quantity);
        return toResponse(inventoryRepository.save(inv));
    }

    @Transactional(readOnly = true)
    public StockCheckResponse checkStock(StockCheckRequest request) {
        Inventory inv = findByProductId(request.getProductId());
        int available = inv.getQuantityInStock() - inv.getReservedQuantity();
        return StockCheckResponse.builder()
                .productId(request.getProductId())
                .available(available >= request.getRequiredQuantity())
                .availableQuantity(available)
                .build();
    }

    @Transactional
    public boolean reserveStock(StockReserveRequest request) {
        Inventory inv = findByProductId(request.getProductId());
        int available = inv.getQuantityInStock() - inv.getReservedQuantity();
        if (available < request.getQuantity()) {
            throw new InsufficientStockException(
                    "Insufficient stock for productId=" + request.getProductId() +
                    ". Available: " + available + ", Required: " + request.getQuantity());
        }
        inv.setReservedQuantity(inv.getReservedQuantity() + request.getQuantity());
        inventoryRepository.save(inv);
        log.info("Reserved {} units for productId={} orderId={}", request.getQuantity(), request.getProductId(), request.getOrderId());
        return true;
    }

    @Transactional
    public void releaseStock(StockReleaseRequest request) {
        Inventory inv = findByProductId(request.getProductId());
        int newReserved = Math.max(0, inv.getReservedQuantity() - request.getQuantity());
        inv.setReservedQuantity(newReserved);
        inventoryRepository.save(inv);
        log.info("Released {} reserved units for productId={}", request.getQuantity(), request.getProductId());
    }

    @Transactional
    public void confirmStockDeduction(Long productId, Integer quantity) {
        Inventory inv = findByProductId(productId);
        inv.setQuantityInStock(Math.max(0, inv.getQuantityInStock() - quantity));
        inv.setReservedQuantity(Math.max(0, inv.getReservedQuantity() - quantity));
        inventoryRepository.save(inv);
        log.info("Confirmed stock deduction {} units for productId={}", quantity, productId);
    }

    private Inventory findByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for productId: " + productId));
    }

    private InventoryResponse toResponse(Inventory inv) {
        int available = inv.getQuantityInStock() - inv.getReservedQuantity();
        return InventoryResponse.builder()
                .id(inv.getId()).productId(inv.getProductId())
                .productSku(inv.getProductSku()).productName(inv.getProductName())
                .quantityInStock(inv.getQuantityInStock()).reservedQuantity(inv.getReservedQuantity())
                .availableQuantity(available).reorderLevel(inv.getReorderLevel())
                .lowStock(inv.getQuantityInStock() <= inv.getReorderLevel())
                .warehouseLocation(inv.getWarehouseLocation())
                .lastRestockedAt(inv.getLastRestockedAt())
                .createdAt(inv.getCreatedAt()).updatedAt(inv.getUpdatedAt())
                .build();
    }
}
