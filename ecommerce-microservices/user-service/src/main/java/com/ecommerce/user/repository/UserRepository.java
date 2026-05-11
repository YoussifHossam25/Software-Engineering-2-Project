package com.ecommerce.user.repository;

import com.ecommerce.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByAuthUserId(Long authUserId);
    Page<User> findByRole(String role, Pageable pageable);
    boolean existsByEmail(String email);
}
