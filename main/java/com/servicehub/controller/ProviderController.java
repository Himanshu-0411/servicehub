package com.servicehub.controller;

import com.servicehub.dto.ServiceHubDTOs;
import com.servicehub.dto.ServiceHubDTOs.*;
import com.servicehub.security.UserDetailsImpl;
import com.servicehub.service.BookingService;
import com.servicehub.service.ProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ProviderController {

    private final ProviderService providerService;
    private final BookingService bookingService;

    // ---- Public ----
    @GetMapping("/api/providers/public")
    public ResponseEntity<Page<ProviderPublicResponse>> listProviders(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(providerService.getApprovedProviders(categoryId, search, pageable));
    }

    @GetMapping("/api/providers/public/{id}")
    public ResponseEntity<ProviderPublicResponse> getProvider(@PathVariable Long id) {
        return ResponseEntity.ok(providerService.getProviderById(id));
    }

    @GetMapping("/api/providers/public/{id}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getProviderReviews(
            @PathVariable Long id, @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(providerService.getProviderReviews(id, pageable));
    }

    // ---- Provider panel ----
    @GetMapping("/api/provider/profile")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ProviderPublicResponse> getMyProfile(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(providerService.getProviderByUserId(user.getId()));
    }

    @PutMapping("/api/provider/profile")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ProviderPublicResponse> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestBody UpdateProviderRequest req) {
        return ResponseEntity.ok(providerService.updateProfile(user.getId(), req));
    }

    @GetMapping("/api/provider/bookings")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Page<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(bookingService.getProviderBookings(user.getId(), pageable));
    }

    @PatchMapping("/api/provider/bookings/{bookingId}/status")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long bookingId,
            @RequestParam String status) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(bookingId, status, user.getId(), true));
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<ServiceHubDTOs.ApiResponse> getProvidersByCity(@PathVariable String city) {
        return ResponseEntity.ok(ServiceHubDTOs.ApiResponse.ok(
                "Providers fetched successfully",
                providerService.getProvidersByCity(city)
        ));
    }

}
