package com.ecommerce.inventory.controller;

import com.ecommerce.inventory.dto.*;
import com.ecommerce.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<InventoryResponse>> createInventory(@Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(inventoryService.createInventory(request), "Inventory created"));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<InventoryResponse>> getByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getInventoryByProductId(productId), "Inventory retrieved"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<InventoryResponse>>> getAllInventory(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getAllInventory(pageable), "Inventory list retrieved"));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> getLowStockItems() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getLowStockItems(), "Low stock items retrieved"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<InventoryResponse>> updateInventory(
            @PathVariable Long id, @Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.updateInventory(id, request), "Inventory updated"));
    }

    @PostMapping("/product/{productId}/add-stock")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<InventoryResponse>> addStock(
            @PathVariable Long productId, @RequestParam Integer quantity) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.addStock(productId, quantity), "Stock added"));
    }

    /** Internal — called by Order Service */
    @PostMapping("/check")
    public ResponseEntity<ApiResponse<StockCheckResponse>> checkStock(@RequestBody StockCheckRequest request) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.checkStock(request), "Stock check complete"));
    }

    @PostMapping("/reserve")
    public ResponseEntity<ApiResponse<Boolean>> reserveStock(@RequestBody StockReserveRequest request) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.reserveStock(request), "Stock reserved"));
    }

    @PostMapping("/release")
    public ResponseEntity<ApiResponse<Void>> releaseStock(@RequestBody StockReleaseRequest request) {
        inventoryService.releaseStock(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Stock released"));
    }

    @PostMapping("/confirm-deduction")
    public ResponseEntity<ApiResponse<Void>> confirmDeduction(@RequestBody StockReserveRequest request) {
        inventoryService.confirmStockDeduction(request.getProductId(), request.getQuantity());
        return ResponseEntity.ok(ApiResponse.success(null, "Stock deduction confirmed"));
    }
}
