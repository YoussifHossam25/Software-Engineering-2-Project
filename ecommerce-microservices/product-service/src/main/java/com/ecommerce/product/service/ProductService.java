package com.ecommerce.product.service;

import com.ecommerce.product.dto.ProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.exception.DuplicateResourceException;
import com.ecommerce.product.exception.InsufficientStockException;
import com.ecommerce.product.exception.ResourceNotFoundException;
import com.ecommerce.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.findBySku(request.getSku()).isPresent()) {
            throw new DuplicateResourceException("Product with SKU already exists: " + request.getSku());
        }
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .sku(request.getSku())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();
        return toResponse(productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductBySku(String sku) {
        return productRepository.findBySku(sku)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku));
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getActiveProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(String category, Pageable pageable) {
        return productRepository.findByCategoryAndActiveTrue(category, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String keyword, Pageable pageable) {
        return productRepository
                .findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findById(id);
        productRepository.findBySku(request.getSku())
                .filter(p -> !p.getId().equals(id))
                .ifPresent(p -> { throw new DuplicateResourceException("SKU already in use: " + request.getSku()); });

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setSku(request.getSku());
        product.setPrice(request.getPrice());
        if (request.getActive() != null) product.setActive(request.getActive());
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = findById(id);
        product.setActive(false);
        productRepository.save(product);
        log.info("Soft-deleted product id={}", id);
    }

    @Transactional
    public ProductResponse activateProduct(Long id) {
        Product product = findById(id);
        product.setActive(true);
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse deductStock(Long id, int qty) {
        Product product = findById(id);
        if (product.getStockQuantity() < qty) {
            throw new InsufficientStockException(
                    "Insufficient stock for " + product.getName() +
                    ". Available: " + product.getStockQuantity() +
                    ", Requested: " + qty);
        }
        product.setStockQuantity(product.getStockQuantity() - qty);
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse restoreStock(Long id, int qty) {
        Product product = findById(id);
        product.setStockQuantity(product.getStockQuantity() + qty);
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateStock(Long id, int qty) {
        Product product = findById(id);
        product.setStockQuantity(qty);
        return toResponse(productRepository.save(product));
    }

    private Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    private ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .category(p.getCategory())
                .sku(p.getSku())
                .price(p.getPrice())
                .stockQuantity(p.getStockQuantity())
                .outOfStock(p.getStockQuantity() <= 0)
                .active(p.getActive())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
