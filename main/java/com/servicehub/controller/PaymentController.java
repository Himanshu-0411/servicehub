package com.servicehub.controller;

import com.servicehub.dto.PaymentDTOs.*;
import com.servicehub.security.UserDetailsImpl;
import com.servicehub.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /** Step 1: Initiate — get order details before showing payment UI */
    @PostMapping("/initiate/{bookingId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PaymentOrderResponse> initiate(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.initiatePayment(user.getId(), bookingId));
    }

    /** Step 2: Process — submit payment details and get result */
    @PostMapping("/process")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PaymentResponse> process(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestBody ProcessPaymentRequest req) {
        return ResponseEntity.ok(paymentService.processPayment(user.getId(), req));
    }

    /** Get payment status for a booking */
    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PaymentResponse> getStatus(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(user.getId(), bookingId));
    }
}
