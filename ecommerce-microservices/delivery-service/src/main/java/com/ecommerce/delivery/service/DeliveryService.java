package com.ecommerce.delivery.service;

import com.ecommerce.delivery.dto.*;
import com.ecommerce.delivery.entity.Delivery;
import com.ecommerce.delivery.entity.DeliveryStatus;
import com.ecommerce.delivery.exception.ResourceNotFoundException;
import com.ecommerce.delivery.exception.UnauthorizedException;
import com.ecommerce.delivery.repository.DeliveryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;

    @Transactional
    public DeliveryResponse createDelivery(DeliveryRequest request) {
        if (deliveryRepository.findByOrderId(request.getOrderId()).isPresent()) {
            throw new IllegalStateException("Delivery already exists for order: " + request.getOrderId());
        }

        String deliveryNumber = "DEL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Delivery delivery = Delivery.builder()
                .deliveryNumber(deliveryNumber)
                .orderId(request.getOrderId())
                .orderNumber(request.getOrderNumber())
                .customerId(request.getCustomerId() != null ? request.getCustomerId() : 0L)
                .customerEmail(request.getCustomerEmail())
                .status(DeliveryStatus.PENDING)
                .deliveryAddress(request.getDeliveryAddress() != null ? request.getDeliveryAddress() : "N/A")
                .trackingNotes(request.getTrackingNotes())
                .build();

        Delivery saved = deliveryRepository.save(delivery);
        log.info("Delivery created: {} for order {}", deliveryNumber, request.getOrderNumber());
        return toResponse(saved);
    }

    public DeliveryResponse getDeliveryById(Long id, Long userId, String role) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found: " + id));
        if (!isStaff(role) && (delivery.getCustomerId() == null || !delivery.getCustomerId().equals(userId))) {
            throw new UnauthorizedException("Access denied to delivery: " + id);
        }
        return toResponse(delivery);
    }

    public DeliveryResponse getDeliveryByNumber(String deliveryNumber, Long userId, String role) {
        Delivery delivery = deliveryRepository.findByDeliveryNumber(deliveryNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found: " + deliveryNumber));
        if (!isStaff(role) && (delivery.getCustomerId() == null || !delivery.getCustomerId().equals(userId))) {
            throw new UnauthorizedException("Access denied");
        }
        return toResponse(delivery);
    }

    public DeliveryResponse getDeliveryByOrderId(Long orderId, Long userId, String role) {
        Delivery delivery = deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found for order: " + orderId));
        if (!isStaff(role) && (delivery.getCustomerId() == null || !delivery.getCustomerId().equals(userId))) {
            throw new UnauthorizedException("Access denied");
        }
        return toResponse(delivery);
    }

    public List<DeliveryResponse> getAllDeliveries() {
        return deliveryRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<DeliveryResponse> getMyDeliveries(Long customerId) {
        return deliveryRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<DeliveryResponse> getDriverDeliveries(Long driverId, Long requestingUserId, String role) {
        if (!isStaff(role) && !driverId.equals(requestingUserId)) {
            throw new UnauthorizedException("Access denied");
        }
        return deliveryRepository.findByDriverIdOrderByCreatedAtDesc(driverId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<DeliveryResponse> getDeliveriesByStatus(String status) {
        DeliveryStatus deliveryStatus;
        try {
            deliveryStatus = DeliveryStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Invalid status: " + status);
        }
        return deliveryRepository.findByStatusOrderByCreatedAtDesc(deliveryStatus)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public DeliveryResponse assignDriver(Long id, AssignDriverRequest request) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found: " + id));

        if (delivery.getStatus() != DeliveryStatus.PENDING) {
            throw new IllegalStateException("Driver can only be assigned to PENDING deliveries");
        }

        delivery.setDriverId(request.getDriverId());
        delivery.setDriverName(request.getDriverName());
        delivery.setDriverPhone(request.getDriverPhone());
        delivery.setStatus(DeliveryStatus.ASSIGNED);

        return toResponse(deliveryRepository.save(delivery));
    }

    @Transactional
    public DeliveryResponse updateDeliveryStatus(Long id, DeliveryUpdateRequest request,
                                                  Long requestingUserId, String role) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found: " + id));

        if ("DELIVERY".equalsIgnoreCase(role)) {
            if (delivery.getDriverId() == null) {
                delivery.setDriverId(requestingUserId);
            } else if (!requestingUserId.equals(delivery.getDriverId())) {
                throw new UnauthorizedException("You can only update your own deliveries");
            }
        }

        DeliveryStatus newStatus;
        try {
            newStatus = DeliveryStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Invalid status: " + request.getStatus());
        }

        delivery.setStatus(newStatus);

        if (delivery.getDeliveryAddress() == null) delivery.setDeliveryAddress("N/A");

        if (request.getTrackingNotes() != null) {
            delivery.setTrackingNotes(request.getTrackingNotes());
        }
        if (request.getFailureReason() != null) {
            delivery.setFailureReason(request.getFailureReason());
        }
        if (request.getEstimatedDeliveryTime() != null) {
            delivery.setEstimatedDeliveryTime(request.getEstimatedDeliveryTime());
        }
        if (newStatus == DeliveryStatus.DELIVERED) {
            delivery.setActualDeliveryTime(LocalDateTime.now());
        }

        log.info("Delivery {} status updated to {} by user {}", delivery.getDeliveryNumber(), newStatus, requestingUserId);
        return toResponse(deliveryRepository.save(delivery));
    }

    private boolean isStaff(String role) {
        return "ADMIN".equalsIgnoreCase(role) || "MANAGER".equalsIgnoreCase(role) || "DELIVERY".equalsIgnoreCase(role);
    }

    private DeliveryResponse toResponse(Delivery d) {
        return DeliveryResponse.builder()
                .id(d.getId())
                .deliveryNumber(d.getDeliveryNumber())
                .orderId(d.getOrderId())
                .orderNumber(d.getOrderNumber())
                .customerId(d.getCustomerId())
                .customerEmail(d.getCustomerEmail())
                .status(d.getStatus().name())
                .driverId(d.getDriverId())
                .driverName(d.getDriverName())
                .driverPhone(d.getDriverPhone())
                .deliveryAddress(d.getDeliveryAddress())
                .trackingNotes(d.getTrackingNotes())
                .estimatedDeliveryTime(d.getEstimatedDeliveryTime())
                .actualDeliveryTime(d.getActualDeliveryTime())
                .failureReason(d.getFailureReason())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }
}
