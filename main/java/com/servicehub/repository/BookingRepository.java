package com.servicehub.repository;

import com.servicehub.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Page<Booking> findByUserId(Long userId, Pageable pageable);
    Page<Booking> findByProviderId(Long providerId, Pageable pageable);
    List<Booking> findByProviderIdAndStatus(Long providerId, Booking.BookingStatus status);
    long countByStatus(Booking.BookingStatus status);
}
