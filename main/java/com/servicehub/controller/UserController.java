package com.servicehub.controller;

import com.servicehub.dto.ServiceHubDTOs.*;
import com.servicehub.security.UserDetailsImpl;
import com.servicehub.service.AddressService;
import com.servicehub.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@PreAuthorize("hasRole('USER')")
@RequiredArgsConstructor
public class UserController {

    private final AddressService addressService;
    private final BookingService bookingService;

    // ---- Addresses ----
    @GetMapping("/addresses")
    public ResponseEntity<List<AddressResponse>> getAddresses(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(addressService.getUserAddresses(user.getId()));
    }

    @PostMapping("/addresses")
    public ResponseEntity<AddressResponse> addAddress(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody AddressRequest req) {
        return ResponseEntity.status(201).body(addressService.addAddress(user.getId(), req));
    }

    @PutMapping("/addresses/{addressId}")
    public ResponseEntity<AddressResponse> updateAddress(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequest req) {
        return ResponseEntity.ok(addressService.updateAddress(user.getId(), addressId, req));
    }

    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<ApiResponse> deleteAddress(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long addressId) {
        addressService.deleteAddress(user.getId(), addressId);
        return ResponseEntity.ok(ApiResponse.ok("Address deleted"));
    }

    // ---- Bookings ----
    @PostMapping("/bookings")
    public ResponseEntity<BookingResponse> createBooking(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody CreateBookingRequest req) {
        return ResponseEntity.status(201).body(bookingService.createBooking(user.getId(), req));
    }

    @GetMapping("/bookings")
    public ResponseEntity<Page<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(bookingService.getUserBookings(user.getId(), pageable));
    }

    @PatchMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(bookingId, "CANCELLED", user.getId(), false));
    }

    @PostMapping("/reviews")
    public ResponseEntity<ReviewResponse> submitReview(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody CreateReviewRequest req) {
        return ResponseEntity.status(201).body(bookingService.submitReview(user.getId(), req));
    }
}
