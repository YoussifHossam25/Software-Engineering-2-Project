package com.ecommerce.delivery.repository;

import com.ecommerce.delivery.entity.Delivery;
import com.ecommerce.delivery.entity.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    Optional<Delivery> findByDeliveryNumber(String deliveryNumber);
    Optional<Delivery> findByOrderId(Long orderId);
    Optional<Delivery> findByOrderNumber(String orderNumber);
    List<Delivery> findByDriverIdOrderByCreatedAtDesc(Long driverId);
    List<Delivery> findByStatusOrderByCreatedAtDesc(DeliveryStatus status);
    List<Delivery> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
